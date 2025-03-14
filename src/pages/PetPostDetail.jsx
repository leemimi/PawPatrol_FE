import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ImageGallery from './ProtectionDetail/components/ImageGallery';
import axios from 'axios';
import { ChevronLeft, MoreVertical, MapPin, Clock, MessageSquare, Share, Send, MessageCircle } from 'lucide-react';
import Swal from 'sweetalert2';

const PetPostDetail = ({ onClose }) => {
  const { postId } = useParams();
  const navigate = useNavigate();

  // State management
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [showOptions, setShowOptions] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isAuthor, setIsAuthor] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [profileImage, setProfileImage] = useState(null);

  // 게시글 데이터, 댓글 데이터 가져오기
  useEffect(() => {
    if (!postId) return;

    axios.get(`${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/lost-foundposts/${postId}`)
      .then(response => {
        setPost(response.data.data);
      })
      .catch(error => console.error("Error fetching post data:", error));

    axios.get(`${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/comments/lost-foundposts/${postId}`)
      .then(response => {
        setComments(response.data.data || []);
      })
      .catch(error => console.error("Error fetching comments:", error));
  }, [postId]);

  // 현재 유저 정보
  useEffect(() => {
    if (!postId) return;

    const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {};
    if (userInfo.email) {
      axios.get(`${import.meta.env.VITE_CORE_API_BASE_URL}/api/v2/auth/me`, { withCredentials: true })
        .then(response => {
          if (response.data?.data) {
            const userId = response.data.data.id;
            const userProfileImage = response.data.data.profileImage; // 프로필 이미지 URL 추출
            setCurrentUserId(userId);
            setProfileImage(userProfileImage); // 프로필 이미지 상태 설정
          }
        })
        .catch(error => console.error("Error fetching current user data:", error));
    }
  }, [postId]);

  // 현재 로그인한 사용자가 작성자인지 검증
  useEffect(() => {
    if (post && currentUserId !== null) {
      setIsAuthor(Number(post.userId) === Number(currentUserId));
    }
  }, [post, currentUserId]);

  // 댓글 핸들러
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const commentData = {
      content: newComment,
      lostFoundPostId: postId,
    };

    try {
      const response = await axios.post(`${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/comments`, commentData);
      if (response.data.resultCode === "200") {
        setComments([...comments, response.data.data]);
        setNewComment('');
      }
    } catch (error) {
    }
  };

  const handleEditComment = (comment) => {
    setNewComment(comment.content);
    setIsEditing(true);
    setEditingCommentId(comment.id);
  };

  const handleUpdateComments = async () => {
    if (!newComment.trim()) return;

    const updatedComment = { content: newComment };

    try {
      const response = await axios.put(`${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/comments/${editingCommentId}`, updatedComment);
      if (response.data.resultCode === "200") {
        setComments(comments.map(comment =>
          comment.id === editingCommentId ? { ...comment, content: newComment } : comment
        ));
        setIsEditing(false);
        setNewComment('');
      }
    } catch (error) {
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm('정말로 삭제하시겠습니까?')) {
      try {
        const response = await axios.delete(`${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/comments/${commentId}`);
        if (response.data.resultCode === "200") {
          setComments(comments.filter(comment => comment.id !== commentId));
        }
      } catch (error) {
      }
    }
  };

  // 게시글 핸들러
  const handleEdit = () => {
    if (postId) {
      navigate(`/lostmypetfix/${postId}`);
    } else {
      navigate('/error');
    }
  };

  const handleDelete = async (postId) => {
    if (window.confirm('정말로 삭제하시겠습니까?')) {
      try {
        const response = await axios.delete(`${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/lost-foundposts/${postId}`);
        if (response.data.resultCode === "200") {
          Swal.fire({
            icon: 'success',
            title: '게시글 삭제 완료',
            text: '게시글이 성공적으로 삭제되었습니다.',
            confirmButtonText: '확인'
          });
          navigate(-1);
        }
      } catch (error) {
        Swal.fire({
          title: '오류',
          text: '게시글 삭제에 실패했습니다.',
          icon: 'error',
          confirmButtonText: '확인'
        });
      }
    }
  };

  // 채팅 핸들러
  // handleStartChat 함수 수정
  const handleStartChat = () => {
    if (!post || !post.nickname) {
      Swal.fire({
        title: '오류',
        text: '게시자 정보를 불러올 수 없습니다.',
        icon: 'error',
        confirmButtonText: '확인'
      });
      return;
    }

    // 채팅 대상 정보를 세션 스토리지에 저장
    sessionStorage.setItem('chatTarget', JSON.stringify({
      userId: post.author.id,
      nickname: post.author.nickname,
      postId: post.id,
      postTitle: post.content,
      type: 'LOSTFOUND',
      reward: post.reward || null,
      owner: post.author.id,
    }));

    navigate('/chat');
  };

  // 이미지 핸들러
  const renderImages = () => {
    if (post?.images?.length > 0) {
      // 유효한 경로만 필터링하여 중복 제거
      const validImages = post.images.filter(image => image && image?.path); // null, undefined, 경로가 없는 이미지 필터링
      const uniqueImages = Array.from(new Set(validImages.map(image => image.path)))
        .map(path => validImages.find(image => image.path === path)); // 중복된 이미지 경로를 가진 첫 번째 이미지를 유지

      // 이미지가 없으면 렌더링하지 않음
      if (uniqueImages.length === 0) return null;

      return (
        <div className="w-full mb-4">
          {/* 첫 번째 이미지는 크게 표시 */}
          {uniqueImages.length > 0 && (
            <div className="w-full h-64 mb-2">
              <img
                src={uniqueImages[0]?.path || '/api/placeholder/160/160'}
                alt={`Main Post Image`}
                className="w-full h-full object-cover rounded-lg cursor-pointer"
                onClick={() => uniqueImages[0]?.path && handleImageClick(0)}
                style={{ cursor: uniqueImages[0]?.path ? 'pointer' : 'not-allowed' }}
              />
            </div>
          )}

          {/* 나머지 이미지는 가로 스크롤로 표시 */}
          {uniqueImages.length > 1 && (
            <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
              {uniqueImages.slice(1).map((image, index) => {
                // 실제 인덱스는 1부터 시작하므로 +1 해줌
                const realIndex = index + 1;
                const imageUrl = image?.path || '/api/placeholder/160/160';
                const handleClick = image?.path ? () => handleImageClick(realIndex) : null;

                return (
                  <img
                    key={realIndex}
                    src={imageUrl}
                    alt={`Post Image ${realIndex + 1}`}
                    className="w-24 h-24 flex-shrink-0 object-cover rounded-lg cursor-pointer"
                    onClick={handleClick}
                    style={{ cursor: image?.path ? 'pointer' : 'not-allowed' }}
                  />
                );
              })}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const handleImageClick = (index) => {
    setCurrentImageIndex(index);
    setIsGalleryOpen(true);
  };

  const closeGallery = () => {
    setIsGalleryOpen(false);
  };

  const handleGoToCommunity = () => {
    navigate(-1);
  };

  if (!post) {
    return (
      <div className="max-w-lg mx-auto bg-orange-100 min-h-screen p-3 relative">
        <div className="flex justify-center items-center h-full">
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto bg-orange-100 min-h-screen p-3 relative pb-24">
      <div className="mb-4 bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={handleGoToCommunity} className="p-2 rounded-full hover:bg-gray-100">
              <ChevronLeft size={24} />
            </button>
            <h2 className="text-lg font-semibold">게시글 상세</h2>
          </div>

          {isAuthor && (
            <div className="relative">
              <button
                onClick={() => setShowOptions(!showOptions)}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <MoreVertical size={20} />
              </button>

              {showOptions && (
                <div className="absolute right-0 mt-2 w-36 bg-white rounded-md shadow-lg z-10">
                  <button
                    onClick={handleEdit}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    수정하기
                  </button>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-500"
                  >
                    삭제하기
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 내용 */}
        <div className="mt-4">
          <div className="flex items-center mb-3">
            <h3 className="font-bold text-2xl text-orange-600">{post.title}</h3>
          </div>
          <div className="flex items-center mb-3 p-2 bg-orange-50 rounded-lg">
            <div className="flex items-center gap-2">
              {post.author && post.author.profileImageUrl ? (
                <img
                  src={post.author.profileImageUrl}
                  alt="프로필"
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-medium">
                  {post.nickname ? post.nickname.charAt(0).toUpperCase() : '?'}
                </div>
              )}
              <p className="font-medium text-gray-700">{post.nickname}</p>
            </div>
          </div>


          <div className="flex items-center text-gray-700 mb-4 p-2 bg-orange-50 rounded-lg">
            <Clock size={18} className="mr-2 text-orange-600" />
            <p className="font-medium">
              {post.lostTime
                ? `실종시간: ${new Date(post.lostTime).toLocaleString('ko-KR', {
                  year: 'numeric',
                  month: 'numeric',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: 'numeric',
                  hour12: true
                })}`
                : post.findTime
                  ? `발견시각: ${new Date(post.findTime).toLocaleString('ko-KR', {
                    year: 'numeric',
                    month: 'numeric',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                    hour12: true
                  })}`
                  : "시간 정보 없음"}
            </p>
          </div>
          <div className="flex items-center text-gray-700 mb-4 p-2 bg-orange-50 rounded-lg">
            <MapPin size={18} className="mr-2 text-orange-600" />
            <p className="font-medium">
              {post.lostTime
                ? `실종장소: ${post.location || "위치 정보 없음"}`
                : `발견장소: ${post.location || "위치 정보 없음"}`
              }
            </p>
          </div>

          {/* 이미지 렌더링 부분 수정 */}
          <div className="mb-6">
            {post?.images?.length > 0 ? (
              <div className="w-full">
                {/* 첫 번째 이미지는 더 크게 표시 */}
                {post.images.length > 0 && post.images[0]?.path && (
                  <div className="w-full h-80 mb-3">
                    <img
                      src={post.images[0]?.path || '/api/placeholder/400/320'}
                      alt={`${post.title} 메인 이미지`}
                      className="w-full h-full object-cover rounded-lg shadow-md cursor-pointer border border-orange-200"
                      onClick={() => post.images[0]?.path && handleImageClick(0)}
                      style={{ cursor: post.images[0]?.path ? 'pointer' : 'not-allowed' }}
                    />
                  </div>
                )}

                {/* 나머지 이미지는 가로 스크롤로 표시 */}
                {post.images.length > 1 && (
                  <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-thin scrollbar-thumb-orange-300 scrollbar-track-transparent">
                    {post.images.slice(1).map((image, index) => {
                      // 실제 인덱스는 1부터 시작하므로 +1 해줌
                      const realIndex = index + 1;
                      const imageUrl = image?.path || '/api/placeholder/160/160';
                      const handleClick = image?.path ? () => handleImageClick(realIndex) : null;

                      return (
                        <div key={realIndex} className="relative h-28 w-28 flex-shrink-0">
                          <img
                            src={imageUrl}
                            alt={`${post.title} 추가 이미지 ${realIndex + 1}`}
                            className="h-full w-full object-cover rounded-lg shadow border border-orange-200 cursor-pointer"
                            onClick={handleClick}
                            style={{ cursor: image?.path ? 'pointer' : 'not-allowed' }}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-48 bg-orange-50 rounded-lg flex items-center justify-center mb-4">
                <p className="text-gray-500">등록된 이미지가 없습니다</p>
              </div>
            )}
          </div>

          {post.pet && (
            <div className="bg-white p-4 rounded-lg mb-4 shadow-md hover:shadow-lg transition-shadow border border-orange-100">
              <h3 className="font-bold text-xl text-orange-600 mb-3 pb-2 border-b border-orange-200 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                반려동물 정보
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {post.pet.estimatedAge && (
                  <div className="p-3 bg-orange-50 rounded-lg border border-orange-100">
                    <span className="text-orange-700 font-bold text-sm uppercase tracking-wider mb-1 block">나이</span>
                    <span className="text-gray-900 font-medium text-base block mt-1">{post.pet.estimatedAge}</span>
                  </div>
                )}
                {post.pet.gender && (
                  <div className="p-3 bg-orange-50 rounded-lg border border-orange-100">
                    <span className="text-orange-700 font-bold text-sm uppercase tracking-wider mb-1 block">성별</span>
                    <span className="text-gray-900 font-medium text-base block mt-1">{post.pet.gender}</span>
                  </div>
                )}
                {post.pet.breed && (
                  <div className="p-3 bg-orange-50 rounded-lg border border-orange-100">
                    <span className="text-orange-700 font-bold text-sm uppercase tracking-wider mb-1 block">품종</span>
                    <span className="text-gray-900 font-medium text-base block mt-1">{post.pet.breed}</span>
                  </div>
                )}
                {post.pet.size && (
                  <div className="p-3 bg-orange-50 rounded-lg border border-orange-100">
                    <span className="text-orange-700 font-bold text-sm uppercase tracking-wider mb-1 block">크기</span>
                    <span className="text-gray-900 font-medium text-base block mt-1">{post.pet.size}</span>
                  </div>
                )}
                {post.pet.healthCondition && (
                  <div className="col-span-2 p-3 bg-orange-50 rounded-lg border border-orange-100">
                    <span className="text-orange-700 font-bold text-sm uppercase tracking-wider mb-1 block">건강 상태</span>
                    <span className="text-gray-900 font-medium text-base block mt-1">{post.pet.healthCondition}</span>
                  </div>
                )}
                {post.pet.feature && (
                  <div className="col-span-2 p-3 bg-orange-50 rounded-lg border border-orange-100">
                    <span className="text-orange-700 font-bold text-sm uppercase tracking-wider mb-1 block">특징</span>
                    <span className="text-gray-900 font-medium text-base block mt-1">{post.pet.feature}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="bg-white p-4 rounded-lg mb-4 shadow-md hover:shadow-lg transition-shadow border border-orange-100">
            <h3 className="font-bold text-xl text-orange-600 mb-3 pb-2 border-b border-orange-200 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              내용
            </h3>
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
              <p className="text-gray-900 leading-relaxed whitespace-pre-line break-words">
                {post.content}
              </p>
            </div>
          </div>

          {!isAuthor && (
            <button
              onClick={handleStartChat}
              className="w-full py-2 bg-orange-500 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-orange-600 transition-colors"
            >
              <MessageCircle size={20} />
              <span>작성자와 대화하기</span>
            </button>
          )}
        </div>
      </div>

      {/* 댓글 섹션 */}
      <div className="bg-white rounded-xl p-4 shadow-md mb-20">
        <h3 className="font-semibold text-lg mb-4">댓글 {comments.length}개</h3>

        {comments.map(comment => {
          // Check if it's a system alert comment
          const isAlertComment = comment.content.startsWith('🔍 유사한 목격 제보가 있습니다');

          return (
            <div key={comment.id} className={`border-b py-3 last:border-b-0 ${isAlertComment ? 'bg-blue-50 rounded-lg' : ''}`}>
              <div className="grid grid-cols-[auto_1fr_auto] gap-2">
                {/* 프로필 이미지 */}
                <div className="self-start -mt-1">
                  {isAlertComment ? (
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                      🔍
                    </div>
                  ) : comment.profileImage && !comment.profileImage.includes('default.png') ? (
                    <img
                      src={comment.profileImage}
                      alt={`${comment.nickname}의 프로필`}
                      className="w-8 h-8 rounded-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/path/to/fallback-image.png';
                      }}
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-medium">
                      {comment.nickname ? comment.nickname.charAt(0).toUpperCase() : '?'}
                    </div>
                  )}
                </div>

                {/* 닉네임과 내용 */}
                <div className="flex flex-col min-width-0 overflow-hidden">
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold ${isAlertComment ? 'text-blue-700' : 'text-gray-800'}`}>
                      {isAlertComment ? '시스템 알림' : comment.nickname}
                    </span>
                    {!isAlertComment && currentUserId === comment.userId && (
                      <div className="flex gap-2 items-center">
                        {!(isEditing && editingCommentId === comment.id) && (
                          <>
                            <button
                              onClick={() => {
                                setEditingCommentId(comment.id);
                                setNewComment(comment.content);
                                setIsEditing(true);
                              }}
                              className="text-xs text-blue-500 hover:underline"
                            >
                              수정
                            </button>
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              className="text-xs text-red-500 hover:underline"
                            >
                              삭제
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {isEditing && editingCommentId === comment.id ? (
                    <div className="mt-1">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
                        rows={3}
                      />
                      <div className="flex justify-end gap-2 mt-2">
                        <button
                          onClick={handleUpdateComments}
                          className="px-3 py-1 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                        >
                          저장
                        </button>
                        <button
                          onClick={() => {
                            setIsEditing(false);
                            setNewComment('');
                            setEditingCommentId(null);
                          }}
                          className="px-3 py-1 text-sm bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                        >
                          취소
                        </button>
                      </div>
                    </div>
                  ) : isAlertComment ? (
                    <div className="p-3 rounded-lg mt-1 bg-white border border-blue-200 text-gray-700 break-words">
                      <div className="font-medium text-blue-700 mb-2">유사한 목격 제보가 있습니다!</div>

                      {comment.content.split('\n').map((line, index) => {
                        // Handle the formatted URL link
                        if (line.includes('[게시글 보기]')) {
                          const match = line.match(/🔗 \[게시글 보기\]\((.*?)\)/);
                          const url = match ? match[1] : '#';
                          return (
                            <div key={index} className="my-2">
                              <a
                                href={url}
                                className="inline-flex items-center gap-1 text-blue-600 bg-blue-100 px-3 py-1 rounded-full font-medium text-sm hover:bg-blue-200 transition-colors"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                🔗 게시글 보기
                              </a>
                            </div>
                          );
                        }

                        // Handle image URLs
                        if (line.includes('🖼️ 이미지:')) {
                          const parts = line.split('🖼️ 이미지: ');
                          const imageUrl = parts[1]?.trim();

                          return (
                            <div key={index} className="my-2">
                              <div className="text-sm text-gray-600 mb-1">🖼️ 이미지:</div>
                              {imageUrl && imageUrl !== 'null' ? (
                                <img
                                  src={imageUrl}
                                  alt="유사 게시물 이미지"
                                  className="w-full max-h-32 object-cover rounded-lg border border-gray-200"
                                />
                              ) : (
                                <div className="text-xs text-gray-500 italic">이미지 없음</div>
                              )}
                            </div>
                          );
                        }

                        // Handle similarity percentage
                        if (line.includes('📝 유사도:')) {
                          const parts = line.split('📝 유사도: ');
                          const similarityStr = parts[1]?.trim();
                          const similarity = parseFloat(similarityStr);

                          return (
                            <div key={index} className="mt-2">
                              <div className="text-sm text-gray-600 mb-1">📝 유사도:</div>
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-blue-500 rounded-full"
                                    style={{ width: `${Math.min(similarity * 100, 100)}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-medium">{similarityStr}</span>
                              </div>
                            </div>
                          );
                        }

                        // Handle content
                        if (line.includes('내용:')) {
                          const parts = line.split('내용: ');
                          const content = parts[1]?.trim();

                          return (
                            <div key={index} className="my-2">
                              <div className="text-sm text-gray-600 mb-1">내용:</div>
                              <div className="bg-gray-50 p-2 rounded border border-gray-200 text-sm">
                                {content || '내용 없음'}
                              </div>
                            </div>
                          );
                        }

                        // Default rendering for other lines
                        return line && !line.startsWith('🔍') ? <p key={index} className="my-1">{line}</p> : null;
                      })}
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-2 rounded-lg mt-1 border border-gray-100 text-gray-700 break-words overflow-hidden">
                      {comment.content}
                    </div>
                  )}
                </div>

                {/* 날짜 */}
                <div className="text-sm text-gray-500 whitespace-nowrap self-start">
                  {new Date(comment.createdAt).toLocaleString('ko-KR', {
                    year: 'numeric',
                    month: 'numeric',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                    hour12: true
                  })}
                </div>
              </div>
            </div>
          );
        })}

        {/* Comment form - 새 댓글 작성용으로만 사용 */}
        <form onSubmit={handleSubmitComment} className="mt-4">
          <div className="flex gap-2 overflow-x-auto">
            <input
              type="text"
              value={!isEditing ? newComment : ''}
              onChange={(e) => !isEditing && setNewComment(e.target.value)}
              placeholder="댓글을 입력하세요"
              className="flex-1 min-w-0 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
            <button
              type="submit"
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors shrink-0"
            >
              등록
            </button>
          </div>
        </form>
      </div>

      {/* 이미지 갤러리 모달 */}
      {isGalleryOpen && post?.images?.length > 0 && (
        <ImageGallery
          images={post.images} // 객체 배열 그대로 전달
          currentIndex={currentImageIndex}
          setCurrentIndex={setCurrentImageIndex} // 상태 업데이트 함수 필요
          closeGallery={closeGallery}
        />
      )}
    </div>
  );
};

export default PetPostDetail;