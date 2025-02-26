import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom'; // useNavigate & useParams import
import axios from 'axios'; // axios import

import { 
  ChevronLeft, 
  MoreVertical, 
  MapPin, 
  Clock,
  MessageSquare,
  Share,
  Send
} from 'lucide-react';

const PetPostDetail = ({ onClose }) => {
  const { postId } = useParams();  // Extract postId from URL
  const navigate = useNavigate();
  
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [showOptions, setShowOptions] = useState(false);
  const [commentType, setCommentType] = useState('lost'); // 'lost' or 'find'

  useEffect(() => {
    if (!postId) return; // If no postId, do nothing.

    // Fetch the post details
    axios.get(`http://localhost:8090/api/v1/lost-foundposts/${postId}`)
      .then(response => {
        setPost(response.data.data);
      })
      .catch(error => console.error("Error fetching post data:", error));

    // Fetch the comments for the post
    axios.get(`http://localhost:8090/api/v1/comments/lost-foundposts/${postId}`)
      .then(response => setComments(response.data.data || []))
      .catch(error => console.error("Error fetching comments:", error));
  }, [postId]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const commentData = {
      content: newComment,
      findPostId: commentType === 'lost' ? postId : null,
  
    };

    try {
      const response = await axios.post('http://localhost:8090/api/v1/comments', commentData);
      if (response.data.resultCode === "200") {
        setComments([...comments, response.data.data]);
        setNewComment('');
      }
    } catch (error) {
      console.error("Error posting comment:", error);
    }
  };

  // Edit comment handler
  const handleEditComment = (comment) => {
    setNewComment(comment.content); // Set the current comment's content in the input box
    setIsEditing(true);
    setEditingCommentId(comment.id); // Store the ID of the comment being edited
  };

  // Save the updated comment
  const handleUpdateComments = async () => {
    if (!newComment.trim()) return;

    const updatedComment = {
      content: newComment
    };

    try {
      const response = await axios.put(`http://localhost:8090/api/v1/comments/${editingCommentId}`, updatedComment);
      if (response.data.resultCode === "200") {
        setComments(comments.map(comment => 
          comment.id === editingCommentId ? { ...comment, content: newComment } : comment
        ));
        setIsEditing(false); // Hide the edit form
        setNewComment(''); // Clear the input
      }
    } catch (error) {
      console.error("Error updating comment:", error);
    }
  };

  // Delete comment handler
  const handleDeleteComment = async (commentId) => {
    if (window.confirm('정말로 삭제하시겠습니까?')) {
      try {
        const response = await axios.delete(`http://localhost:8090/api/v1/comments/${commentId}`);
        if (response.data.resultCode === "200") {
          setComments(comments.filter(comment => comment.id !== commentId)); // Remove deleted comment from state
        }
      } catch (error) {
        console.error("Error deleting comment:", error);
      }
    }
  };

  const handleEdit = (postId) => {
    navigate(`/lostmypetfix/${postId}`);
};

const handleDelete = async (postId) => {
  if (window.confirm('정말로 삭제하시겠습니까?')) {
    try {
      const response = await axios.delete(`http://localhost:8090/api/v1/lost-foundposts/${postId}`);
      if (response.data.resultCode === "200") {
        console.log('Post deleted');
        alert('게시글이 성공적으로 삭제되었습니다.');
        navigate(-1);  // Navigate back after deleting the post
      }
    } catch (error) {
      console.error('게시글 삭제 중 오류 발생:', error);
      alert('게시글 삭제에 실패했습니다.');
    }
  }
};

// Handle image rendering
const renderImages = () => {
  if (post && post.images && post.images.length > 0) {
    return post.images.map((image, index) => (
      <img key={index} src={image.imageUrl} alt={`Post Image ${index + 1}`} className="w-full h-auto my-4" />
    ));
  }
  return null;
};


  const handleUpdate = () => {
    setPost({...post, title: newComment}); // Update the post with new data
    setIsEditing(false);
  };

  const handleGoTocommunity = () => {
    navigate('/community');
    setIsActionMenuVisible(false);
  };

  if (!post) {
    return <div>Loading...</div>; // Show loading state while fetching
  }

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <button onClick={handleGoTocommunity} className="p-2">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-lg font-bold">게시글</h1>
        <div className="relative">
          <button 
            onClick={() => setShowOptions(!showOptions)}
            className="p-2"
          >
            <MoreVertical size={24} />
          </button>
          
          {showOptions && (
            <div className="absolute right-0 top-full mt-2 bg-white border rounded-lg shadow-lg py-2 w-32">
              <button
                onClick={() => handleEdit(post.foundId)}
                className="w-full px-4 py-2 text-left hover:bg-gray-100"
              >
                수정하기
              </button>
              <button
                onClick={() =>handleDelete(post.foundId)}
                className="w-full px-4 py-2 text-left text-red-500 hover:bg-gray-100"
              >
                삭제하기
              </button>
            </div>
          )}
        </div>
      </header>

       {/* Content */}
<div className="flex-1 overflow-y-auto">
  {isEditing ? (
    <div className="p-4 space-y-4">
      <textarea
        value={newComment} // Use the newComment state to manage the content of the comment
        onChange={(e) => setNewComment(e.target.value)} // Update the newComment state when content changes
        className="w-full px-4 py-3 border rounded-lg h-32"
        placeholder="수정할 댓글을 입력하세요..." // Placeholder for comment editing
      />
      
      <div className="flex gap-2">
        <button
          onClick={() => setIsEditing(false)} // Cancel editing
          className="flex-1 px-4 py-2 border rounded-lg"
        >
          취소
        </button>
        <button
          onClick={handleUpdateComments} // Handle the comment update when "수정완료" is clicked
          className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg"
        >
          수정완료
        </button>
      </div>
    </div>
  ) : (
          <>
            {/* Post Content */}
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-3">
                <div>
                  <p className="font-medium">독립제보글 글쓴이: {post.nickname}</p>
                </div>
              </div>

              <div className="space-y-2">
                <span className="inline-block px-2 py-1 bg-orange-100 text-orange-500 rounded-full text-sm">
                  {post.status}
                </span>
                <h2 className="text-xl font-bold">{post.content}</h2>
                <p className="text-gray-700">
  {post.lostTime ? `실종시간: ${post.lostTime}` : post.findTime ? `발견시각: ${post.findTime}` : "시간 정보 없음"}
</p>

                {/* Location */}
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <MapPin size={16} />
                  <span>{post.latitude}, {post.longitude}</span>
                </div>

              
              </div>
              <div className="space-y-2">
  {post.pet && post.pet.estimatedAge && (
    <p className="text-gray-500">생년월일: {post.pet.estimatedAge}</p>
  )}
  {post.pet && post.pet.gender && (
    <p className="text-gray-500">성별: {post.pet.gender}</p>
  )}
  {post.pet && post.pet.breed && (
    <p className="text-gray-500">품종: {post.pet.breed}</p>
  )}
  {post.pet && post.pet.healthCondition && (
    <p className="text-gray-500">건강 상태: {post.pet.healthCondition}</p>
  )}
  {post.pet && post.pet.feature && (
    <p className="text-gray-500">특징: {post.pet.feature}</p>
  )}
  {post.pet && post.pet.size && (
    <p className="text-gray-500">크기: {post.pet.size}</p>
  )}
</div>

              

              {/* Render Images */}
          {renderImages()}


              <div className="flex justify-between py-2 border-t">
                <button className="flex items-center gap-1 text-gray-500">
                  <MessageSquare size={20} />
                  <span>댓글 {comments.length}</span>
                </button>
                <button className="flex items-center gap-1 text-gray-500">
                  <Share size={20} />
                  <span>공유하기</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Comment Input */}
      <div className="flex-1 overflow-y-auto pb-16">
        <div className="mt-4">
          <h2 className="font-semibold">댓글</h2>
          {comments.map(comment => (
            <div key={comment.id} className="border p-2 mt-2 rounded">
              <p><strong>{comment.nickname}</strong>: {comment.content}</p>
              <div className="flex gap-2">
                <button onClick={() => handleEditComment(comment)} className="text-blue-500">수정</button>
                <button onClick={() => handleDeleteComment(comment.id)} className="text-red-500">삭제</button>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmitComment} className="mt-4 flex items-center gap-2">
          <select value={commentType} onChange={(e) => setCommentType(e.target.value)} className="border p-1">
            <option value="find">신고글 댓글</option>
          </select>
          <input 
            type="text" 
            value={newComment} 
            onChange={(e) => setNewComment(e.target.value)} 
            placeholder="댓글을 입력하세요..."
            className="flex-1 border p-2 rounded"
          />
          <button type="submit" className="bg-orange-500 text-white p-2 rounded">
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default PetPostDetail;
