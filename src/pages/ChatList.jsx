import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, UserCircle, FileText, Award } from 'lucide-react';
import axios from 'axios';

const ChatList = () => {
  const navigate = useNavigate();
  const [chatRooms, setChatRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL'); 
  
  const currentUser = {
    id: JSON.parse(localStorage.getItem('userInfo'))?.id,
    nickname: JSON.parse(localStorage.getItem('userInfo'))?.nickname
  };

  useEffect(() => {
    fetchChatRooms();
  }, [activeTab]);

  const fetchChatRooms = async () => {
    if (!currentUser.id) {
      console.error('Current user ID is missing');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      // 탭에 따라 다른 API 엔드포인트 호출
      let endpoint = `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/chatlist`;
      if (activeTab !== 'ALL') {
        endpoint += `?type=${activeTab}`;
      }
      
      const response = await axios.get(endpoint);
      console.log('Fetched chat rooms:', response.data);
      
      if (response.data && response.data.resultCode === "200") {
        setChatRooms(response.data.data || []);
      } else {
        console.warn('Unexpected response format:', response.data);
        setChatRooms([]);
      }
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
      setChatRooms([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChatSelect = (room) => {
    const otherMember = room.member1.id === currentUser.id ? room.member2 : room.member1;
    console.log(room);
    
    // Chat target 정보 생성
    const chatTarget = {
      userId: otherMember.id,
      nickname: otherMember.nickname,
      postId: room.post.id,
      postTitle: room.post.content,
      type: room.type,
      owner: room.member2.id,
    };
    
    // LOSTFOUND 타입이고 보상금이 있는 경우 chatTarget에 reward 추가
    if (room.type === 'LOSTFOUND' && room.post && room.post.reward) {
      chatTarget.reward = room.post.reward;
    }
    
    // Store chat target info in session storage
    sessionStorage.setItem('chatTarget', JSON.stringify(chatTarget));
    
    navigate('/chat');
  };

  // Format relative time (e.g., "2시간 전", "방금 전")
  const formatRelativeTime = (timestamp) => {
    if (!timestamp) return '';
    
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffMs = now - messageTime;
    
    // Convert to appropriate units
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 1) return '방금 전';
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 7) return `${diffDays}일 전`;
    
    // If older than a week, show date
    return `${messageTime.getMonth() + 1}월 ${messageTime.getDate()}일`;
  };

  const getOtherMemberName = (room) => {
    if (!room.member1 || !room.member2) return '알 수 없음';
    return room.member1.id === currentUser.id ? room.member2.nickname : room.member1.nickname;
  };

  const getUnreadCount = (room) => {
    if (!room.messages || !room.messages.length) return 0;
    
    return room.messages.filter(msg => 
      !msg.isRead && msg.receiver.id === currentUser.id
    ).length;
  };

  // 보상금 포맷팅 함수
  const formatReward = (amount) => {
    return amount ? amount.toLocaleString() + '원' : '';
  };

  const filteredRooms = chatRooms;

  return (
    <div className="flex flex-col h-full bg-[#FFF5E6]">
      {/* Header */}
      <div className="bg-orange-500 p-4 shadow-md">
        <div className="flex items-center justify-between">
          <h1 className="text-white text-xl font-semibold">채팅</h1>
        </div>
      </div>
      
      {/* Tab Navigation */}
      <div className="flex border-b border-amber-100 bg-white">
        <button 
          className={`flex-1 py-3 font-medium text-sm ${
            activeTab === 'ALL' 
              ? 'text-orange-500 border-b-2 border-orange-500 bg-orange-50/50' 
              : 'text-amber-700 hover:text-orange-500'
          }`}
          onClick={() => setActiveTab('ALL')}
        >
          전체
        </button>
        <button 
          className={`flex-1 py-3 font-medium text-sm ${
            activeTab === 'PROTECTADOPT' 
              ? 'text-orange-500 border-b-2 border-orange-500 bg-orange-50/50' 
              : 'text-amber-700 hover:text-orange-500'
          }`}
          onClick={() => setActiveTab('PROTECTADOPT')}
        >
          임보/입양
        </button>
        <button 
          className={`flex-1 py-3 font-medium text-sm ${
            activeTab === 'LOSTFOUND' 
              ? 'text-orange-500 border-b-2 border-orange-500 bg-orange-50/50' 
              : 'text-amber-700 hover:text-orange-500'
          }`}
          onClick={() => setActiveTab('LOSTFOUND')}
        >
          구조/제보
        </button>
      </div>
      
      {/* Chat List */}
      <div className="flex-1 overflow-y-auto bg-white">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full p-4">
            <div className="animate-pulse flex space-x-4">
              <div className="rounded-full bg-amber-100 h-12 w-12"></div>
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 bg-amber-100 rounded w-3/4"></div>
                <div className="h-4 bg-amber-100 rounded w-5/6"></div>
              </div>
            </div>
            <p className="text-amber-600 mt-4">채팅 목록을 불러오는 중...</p>
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-4 text-amber-700">
            <div className="bg-amber-100 rounded-full p-4 mb-3">
              <MessageSquare className="w-8 h-8 text-orange-500" />
            </div>
            <p>아직 채팅이 없어요</p>
            <p className="text-sm mt-2 text-amber-600">
              {activeTab === 'ALL' ? '게시글에서 메시지를 보내보세요!' : 
               activeTab === 'PROTECTADOPT' ? '임보/입양 관련 채팅이 없습니다.' : 
               '구조/제보 관련 채팅이 없습니다.'}
            </p>
          </div>
        ) : (
          filteredRooms.map((room) => {
            const otherMemberName = getOtherMemberName(room);
            const lastMessage = room.lastMessage;
            const unreadCount = room.unreadCount;
            const hasReward = room.type === 'LOSTFOUND' && room.post && room.post.reward;
            
            return (
              <div 
                key={room.id} 
                className="border-b border-amber-100 hover:bg-amber-50/50 transition-colors duration-200 cursor-pointer"
                onClick={() => handleChatSelect(room)}
              >
                <div className="flex items-start p-4">
                  {/* Avatar */}
                  <div className="relative mr-3">
                    <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                      <UserCircle className="w-10 h-10 text-orange-500" />
                    </div>
                    {unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount}
                      </div>
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900 truncate">{otherMemberName}</h3>
                      <span className="text-xs text-gray-500">
                        {lastMessage ? formatRelativeTime(lastMessage.timestamp) : ''}
                      </span>
                    </div>
                    
                    {/* Post Title */}
                    {room.post && (
                      <div className="flex items-center text-xs text-blue-500 mt-1">
                        <FileText className="w-3 h-3 mr-1 flex-shrink-0" />
                        <span className="truncate">{room.post.content}</span>
                        {/* 채팅방 타입 표시 */}
                        <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">
                          {room.type === 'PROTECTADOPT' ? '임보/입양' : 
                           room.type === 'LOSTFOUND' ? '구조/제보' : '기타'}
                        </span>
                        
                        {/* 보상금 표시 - 새로 추가 */}
                        {hasReward && (
                          <span className="ml-2 flex items-center gap-1 px-1.5 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-800">
                            <Award className="w-3 h-3" />
                            {formatReward(room.post.reward)}
                          </span>
                        )}
                      </div>
                    )}
                    
                    {/* Last Message */}
                    <p className={`text-sm mt-1 truncate ${unreadCount > 0 ? 'font-medium text-gray-900' : 'text-gray-500'}`}>
                      {lastMessage ? lastMessage.content : '새로운 대화를 시작하세요'}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ChatList;
