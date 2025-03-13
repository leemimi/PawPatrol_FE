import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ImageGallery from './ProtectionDetail/components/ImageGallery';
import axios from 'axios';
import { ChevronLeft, MoreVertical, MapPin, Clock, MessageSquare, Share, Send, MessageCircle } from 'lucide-react';

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
        console.log('Comments Response:', response);
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
      console.error("Error posting comment:", error);
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
      console.error("Error updating comment:", error);
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
        console.error("Error deleting comment:", error);
      }
    }
  };

  // 게시글 핸들러
  const handleEdit = () => {
    if (postId) {
      navigate(`/lostmypetfix/${postId}`);
    } else {
      console.error("postId is not available.");
      navigate('/error');
    }
  };

  const handleDelete = async (postId) => {
    if (window.confirm('정말로 삭제하시겠습니까?')) {
      try {
        const response = await axios.delete(`${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/lost-foundposts/${postId}`);
        if (response.data.resultCode === "200") {
          alert('게시글이 성공적으로 삭제되었습니다.');
          navigate(-1);
        }
      } catch (error) {
        console.error('게시글 삭제 중 오류 발생:', error);
        alert('게시글 삭제에 실패했습니다.');
      }
    }
  };

  // 채팅 핸들러
  // handleStartChat 함수 수정
const handleStartChat = () => {
  if (!post || !post.nickname) {
    alert('게시자 정보를 불러올 수 없습니다.');
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
      return post.images.map((image, index) => {
        const imageUrl = image?.path || '/api/placeholder/160/160';
        return (
          <img
            key={index}
            src={imageUrl}
            alt={`Pet image ${index + 1}`}
            className="w-full h-auto rounded-lg cursor-pointer"
            onClick={() => handleImageClick(index)}
          />
        );
      });
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
          <div className="flex items-center mb-2">
            <h3 className="font-bold text-xl">{post.title}</h3>
          </div>

          <div className="flex items-center text-gray-500 mb-2">
            <p>글쓴이: {post.nickname}</p>
          </div>

          <div className="flex items-center text-gray-500 mb-2">
            <Clock size={16} className="mr-1" />
            <p>
              {post.lostTime
                ? `실종시간: ${new Date(post.lostTime).toLocaleString('ko-KR', {
                  year: 'numeric',
                  month: 'numeric',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: 'numeric',
                  second: 'numeric',
                  hour12: true
                })}`
                : post.findTime
                  ? `발견시각: ${new Date(post.findTime).toLocaleString('ko-KR', {
                    year: 'numeric',
                    month: 'numeric',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                    second: 'numeric',
                    hour12: true
                  })}`
                  : "시간 정보 없음"}

            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-4">
            {renderImages()}
          </div>

          {post.pet && (
            <div className="bg-gray-50 p-4 rounded-lg mb-4 shadow-sm border border-gray-100">
              <h3 className="font-medium text-gray-700 mb-2 border-b pb-2">반려동물 정보</h3>
              <div className="flex flex-col gap-2">
                {post.pet.estimatedAge && (
                  <div className="flex flex-col">
                    <span className="text-gray-500 font-medium">나이:</span>
                    <span className="text-gray-700 mt-1">{post.pet.estimatedAge}</span>
                  </div>
                )}
                {post.pet.gender && (
                  <div className="flex flex-col">
                    <span className="text-gray-500 font-medium">성별:</span>
                    <span className="text-gray-700 mt-1">{post.pet.gender}</span>
                  </div>
                )}
                {post.pet.breed && (
                  <div className="flex flex-col">
                    <span className="text-gray-500 font-medium">품종:</span>
                    <span className="text-gray-700 mt-1">{post.pet.breed}</span>
                  </div>
                )}
                {post.pet.healthCondition && (
                  <div className="flex flex-col">
                    <span className="text-gray-500 font-medium">건강 상태:</span>
                    <span className="text-gray-700 mt-1">{post.pet.healthCondition}</span>
                  </div>
                )}
                {post.pet.feature && (
                  <div className="flex flex-col">
                    <span className="text-gray-500 font-medium">특징:</span>
                    <span className="text-gray-700 mt-1">{post.pet.feature}</span>
                  </div>
                )}
                {post.pet.size && (
                  <div className="flex flex-col">
                    <span className="text-gray-500 font-medium">크기:</span>
                    <span className="text-gray-700 mt-1">{post.pet.size}</span>
                  </div>
                )}
              </div>
            </div>
          )}


          <div className="bg-gray-50 p-4 rounded-lg mb-4 shadow-sm border border-gray-100">
            <h3 className="font-medium text-gray-700 mb-2 border-b pb-2">내용</h3>
            <p className="text-gray-800 leading-relaxed whitespace-pre-line break-words">
              {post.content}
            </p>
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

        {comments.map(comment => (
          <div key={comment.id} className="border-b py-3 last:border-b-0">
            <div className="grid grid-cols-[auto_1fr_auto] gap-2">
              {/* 프로필 이미지 */}
              <div className="self-start -mt-1">
                {comment.profileImage && !comment.profileImage.includes('default.png') ? (
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
                  <span className="font-semibold text-gray-800">{comment.nickname}</span>
                  {currentUserId === comment.userId && (
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
        ))}

        {/* Comment form - 새 댓글 작성용으로만 사용 */}
        <form onSubmit={handleSubmitComment} className="mt-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={!isEditing ? newComment : ''}
              onChange={(e) => !isEditing && setNewComment(e.target.value)}
              placeholder="댓글을 입력하세요"
              className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
            <button
              type="submit"
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
            >
              등록
            </button>
          </div>
        </form>
      </div>

      {/* 이미지 갤러리 모달 */}
      {isGalleryOpen && post?.images?.length > 0 && (
        <ImageGallery
          images={post.images.map(img => img.path)}
          initialIndex={currentImageIndex}
          onClose={closeGallery}
        />
      )}
    </div>
  );
};

export default PetPostDetail;