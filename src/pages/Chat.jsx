import React, { useState, useEffect, useRef } from 'react';
import { Send, ArrowLeft, MoreVertical, UserCircle, FileText, MessageSquare, Image, X, Award } from 'lucide-react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Chat = () => {
  const navigate = useNavigate();
  const [selectedUser, setSelectedUser] = useState({
    id: null,
    nickname: null,
    postInfo: {
      id: null,
      title: null,
      type: null,
      userId: null,
      reward: null
    }
  });
  const [currentRoomId, setCurrentRoomId] = useState(null);
  const [roomIdentifier, setRoomIdentifier] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [stompClient, setStompClient] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  // 현재 사용자 정보 가져오기
  const currentUser = {
    id: JSON.parse(localStorage.getItem('userInfo')).id,
    nickname: JSON.parse(localStorage.getItem('userInfo')).nickname
  };

  const isDogOwner = () => {
    return selectedUser?.postInfo?.type === 'PROTECTADOPT' && 
           selectedUser.postInfo.userId == currentUser.id; 
  };

  // 보상금 표시 포맷 함수
  const formatReward = (amount) => {
    return amount ? amount.toLocaleString() + '원' : '';
  };

  // 입양 신청 배너 렌더링
  const renderAdoptionRequestBanner = () => {
    if (selectedUser?.postInfo?.type === 'PROTECTADOPT') {
      return (
        <div className="p-2 bg-orange-100 border-b border-orange-200 flex flex-col items-center">
          <p className="text-center text-orange-800 font-medium text-sm">
            {isDogOwner() 
              ? "입양 신청을 수락하거나 거절하시겠습니까?" 
              : "입양 신청이 진행 중입니다"}
          </p>
          {isDogOwner() && (
            <div className="flex space-x-3 mt-1">
              <button 
                onClick={() => navigate(`/protection/${selectedUser.postInfo.id}#decision-section`)}
                className="px-3 py-1 bg-orange-500 text-white rounded-full text-xs hover:bg-orange-600 transition duration-300"
              >
                수락하거나 거절하러 가기
              </button>
            </div>
          )}
        </div>
      );
    }
    return null;
  };
  
  // 보상금 배너 렌더링
  const renderRewardBanner = () => {
    if (selectedUser?.postInfo?.type === 'LOSTFOUND' && selectedUser?.postInfo?.reward) {
      return (
        <div className="p-2 bg-yellow-50 border-b border-yellow-200 flex items-center justify-center">
          <Award className="w-4 h-4 text-yellow-600 mr-1" />
          <p className="text-center text-yellow-800 font-medium text-sm">
            이 게시글은 <span className="font-bold text-yellow-700">{formatReward(selectedUser.postInfo.reward)}</span>의 보상금이 걸려있습니다
          </p>
        </div>
      );
    }
    return null;
  };

  // 세션 스토리지에서 채팅 대상 정보 가져오기
  useEffect(() => {
    const chatTargetData = sessionStorage.getItem('chatTarget');

    if (chatTargetData) {
      const parsedData = JSON.parse(chatTargetData);
      setSelectedUser({
        id: parsedData.userId,
        nickname: parsedData.nickname || "상대방",
        postInfo: parsedData.postId ? {
          id: parsedData.postId,
          title: parsedData.postTitle,
          type: parsedData.type,
          userId: parsedData.owner,
          reward: parsedData.reward
        } : null
      });
    }
  }, []);

  // WebSocket 연결 설정
  useEffect(() => {
    let client = null;

    if (!currentUser.id) {
      console.error('Current user ID is missing');
      return;
    }

    try {
      const socketFactory = () => {
        return new SockJS(`${import.meta.env.VITE_CORE_API_BASE_URL}/ws`, null, {
          transports: ['websocket', 'xhr-streaming', 'xhr-polling'],
          withCredentials: true
        });
      };

      client = new Client({
        webSocketFactory: socketFactory,
        debug: function (str) {
          console.log('STOMP: ' + str);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000
      });

      client.onConnect = (frame) => {
        setIsConnected(true);
        setStompClient(client);
      };

      client.onStompError = (frame) => {
        console.error('STOMP error:', frame.headers['message']);
        setIsConnected(false);
      };

      client.onWebSocketClose = () => {
        setIsConnected(false);
      };

      // 연결 활성화
      client.activate();

    } catch (error) {
      console.error('WebSocket setup error:', error);
      setIsConnected(false);
    }

    return () => {
      if (client) {
        client.deactivate();
        setIsConnected(false);
      }
    };
  }, [currentUser.id]);


  // 채팅방 ID가 설정되면 메시지를 불러오고 WebSocket 구독을 설정
  useEffect(() => {
    if (stompClient && isConnected && selectedUser?.postInfo?.id) {
      // 채팅방 식별자 설정
      const identifier = `${selectedUser.postInfo.id}_${Math.min(currentUser.id, selectedUser.id)}_${Math.max(currentUser.id, selectedUser.id)}_${selectedUser.postInfo.type || 'DEFAULT'}`;
      fetchMessages(identifier);
      setRoomIdentifier(identifier);

      // WebSocket 구독
      subscribeToRoom(identifier);
    }
  }, [selectedUser, currentUser.id, stompClient, isConnected]);

  // 채팅방 구독
  const subscribeToRoom = (identifier) => {
    if (!stompClient || !identifier) {
      return;
    }

    // 기존 구독 해제
    if (window.chatSubscription) {
      window.chatSubscription.unsubscribe();
    }

    // 새 구독 설정
    window.chatSubscription = stompClient.subscribe(`/queue/chat/${identifier}`, (message) => {
      try {
        // 메시지 형식에 따라 처리 로직 수정
        const messageData = JSON.parse(message.body);

        // 메시지가 type/data 구조인지 또는 직접 메시지 객체인지 확인
        const newMsg = messageData.type === 'MESSAGE' ? messageData.data : messageData;

        setMessages(prevMessages => {
          const isDuplicate = prevMessages.some(msg =>
            msg.id === newMsg.id ||
            (msg.content === newMsg.content &&
              msg.sender?.id === newMsg.sender?.id &&
              Math.abs(new Date(msg.timestamp) - new Date(newMsg.timestamp)) < 1000)
          );

          return isDuplicate ? prevMessages : [...prevMessages, newMsg];
        });

        // 자동 읽음 처리
        markMessagesAsRead(identifier);
      } catch (error) {
        console.error('Error processing received message:', error);
      }
    });
  };

  // 메시지 불러오기
  const fetchMessages = async (identifier) => {
    try {
      markMessagesAsRead(identifier);
      const response = await axios.get(`/api/v1/chat/rooms/${identifier}/messages`, { withCredentials: true });

      if (response.data && response.data.resultCode === "200") {
        setMessages(response.data.data || []);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      setMessages([]);
    }
  };

  useEffect(() => {
    if (roomIdentifier) {
      markMessagesAsRead(roomIdentifier);
    }
  }, [roomIdentifier]);

  // 메시지가 변경될 때마다 스크롤 아래로
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = () => {
    if ((!newMessage.trim() && selectedImages.length === 0) || !selectedUser || !selectedUser.postInfo) {
      return;
    }

    if (!stompClient || !isConnected) {
      alert('연결 상태를 확인해주세요. 메시지를 전송할 수 없습니다.');
      return;
    }

    // 이미지 있으면 이미지 업로드
    if (selectedImages.length > 0) {
      uploadImages();
      return;
    }

    // 텍스트 메시지 전송
    const postId = selectedUser.postInfo.id;

    try {
      // 즉시 메시지를 화면에 표시
      const newMsg = {
        content: newMessage,
        sender: {
          id: currentUser.id,
          nickname: currentUser.nickname
        },
        receiver: {
          id: selectedUser.id,
          nickname: selectedUser.nickname
        },
        timestamp: new Date().toISOString(),
        read: false,
        messageType: 'TEXT'
      };

      setMessages(prev => [...prev, newMsg]);

      // WebSocket으로 메시지 전송
      stompClient.publish({
        destination: `/app/chat/${postId}`,
        body: JSON.stringify({
          content: newMessage,
          receiverId: selectedUser.id,
          senderId: currentUser.id,
          type: selectedUser.postInfo.type
        })
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('메시지 전송 중 오류가 발생했습니다.');

      // 에러 발생 시 마지막 메시지 제거
      setMessages(prev => prev.slice(0, -1));
    }
  };

  // 이미지 업로드 함수
  const uploadImages = async () => {
    if (!roomIdentifier || selectedImages.length === 0) return;

    setIsUploading(true);

    const formData = new FormData();
    selectedImages.forEach(file => {
      formData.append('images', file);
    });
    formData.append('roomIdentifier', roomIdentifier);

    try {
      // 임시 메시지 추가 (업로드 중임을 표시)
      const tempMsgId = `temp-${Date.now()}`;
      const tempImageUrls = selectedImages.map(file => URL.createObjectURL(file));
      const tempImageMsg = {
        id: tempMsgId,
        content: JSON.stringify(tempImageUrls.map(url => ({ url }))),
        sender: currentUser,
        receiver: { id: selectedUser.id },
        postId: selectedUser.postInfo.id,
        timestamp: new Date().toISOString(),
        read: false,
        messageType: 'IMAGE',
        isTemp: true
      };

      setMessages(prev => [...prev, tempImageMsg]);

      const response = await axios.post(`/api/v1/chat/images/${selectedUser.postInfo.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        params: {
          receiverId: selectedUser.id,
          senderId: currentUser.id
        },
        withCredentials: true
      });

      setMessages(prev => prev.filter(msg => msg.id !== tempMsgId));
      setSelectedImages([]);

      if (newMessage.trim()) {
        stompClient.publish({
          destination: `/app/chat/${selectedUser.postInfo.id}`,
          body: JSON.stringify({
            content: newMessage,
            receiverId: selectedUser.id,
            senderId: currentUser.id,
            type: selectedUser.postInfo.type
          })
        });
        setNewMessage('');
      }

    } catch (error) {
      console.error('Error uploading image:', error);
      alert('이미지 업로드 중 오류가 발생했습니다.');
      setMessages(prevMessages => prevMessages.filter(msg => !msg.isTemp));
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      // 파일 확장자 확인
      const validFiles = files.filter(file => {
        const ext = file.name.split('.').pop().toLowerCase();
        return ['jpg', 'jpeg', 'png', 'gif'].includes(ext);
      });

      if (validFiles.length !== files.length) {
        alert('jpg, jpeg, png, gif 형식의 이미지만 업로드 가능합니다.');
      }

      if (validFiles.length > 5) {
        alert('한 번에 최대 5개의 이미지만 업로드할 수 있습니다.');
        setSelectedImages(validFiles.slice(0, 5));
      } else {
        setSelectedImages(validFiles);
      }

      setTimeout(() => {
        document.querySelector('input[type="text"]').focus();
      }, 100);
    }
  };

  const removeImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const goToPost = (postId) => {
    if (!postId) return;
    navigate(`/PetPostDetail/${postId}`);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';

    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return '';

    // 오늘 날짜인지 확인
    const today = new Date();
    const isToday = date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();

    // 오늘이면 시간만, 아니면 날짜도 표시
    if (isToday) {
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const ampm = hours >= 12 ? '오후' : '오전';
      const formattedHours = hours % 12 || 12;
      const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

      return `${ampm} ${formattedHours}:${formattedMinutes}`;
    } else {
      const month = date.getMonth() + 1;
      const day = date.getDate();
      return `${month}/${day}`;
    }
  };

  const markMessagesAsRead = async (identifier) => {
    try {
      const response = await axios.post(
        `/api/v1/chat/rooms/${identifier}/read`, 
        {}, 
        { withCredentials: true }
      );

      if (response.data && response.data.resultCode === "200") {
        setMessages(prevMessages =>
          prevMessages.map(msg => {
            if (msg.sender?.id !== currentUser.id && !msg.read) {
              return { ...msg, read: true };
            }
            return msg;
          })
        );
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const renderMessageContent = (message) => {
    if (message.messageType === 'IMAGE') {
      try {
        const imageData = JSON.parse(message.content);
        return (
          <div className="image-message">
            {Array.isArray(imageData) ? (
              <div className={`grid ${imageData.length > 1
                  ? imageData.length > 2
                    ? 'grid-cols-2'
                    : 'grid-cols-1'
                  : ''
                } gap-1`}>
                {imageData.map((img, idx) => (
                  <img
                    key={idx}
                    src={img.path}
                    alt={`Shared image ${idx + 1}`}
                    className={`rounded-lg object-cover cursor-pointer ${imageData.length === 1
                        ? 'max-h-40 max-w-full'
                        : imageData.length === 2
                          ? 'max-h-32 max-w-full'
                          : 'max-h-24 w-full'
                      }`}
                    onClick={() => window.open(img.url || img.fullPath, '_blank')}
                  />
                ))}
              </div>
            ) : (
              <p className="text-red-500">이미지를 불러올 수 없습니다.</p>
            )}
          </div>
        );
      } catch (e) {
        console.error("Image parse error:", e);
        return <p className="text-red-500">이미지 포맷 오류</p>;
      }
    }

    return message.content;
  };

  if (!selectedUser) {
    return (
      <div className="flex flex-col h-screen w-full items-center justify-center">
        <div className="bg-orange-100 rounded-full p-4 mb-3">
          <MessageSquare className="w-8 h-8 text-orange-500" />
        </div>
        <p className="text-center text-gray-500">채팅 정보를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[100vh] max-h-[100vh] bg-white">
      {/* 채팅 헤더 - 고정 높이 */}
      <div className="flex-none h-16 p-4 border-b border-gray-200 flex items-center">
        <button onClick={handleBack} className="mr-2">
          <ArrowLeft className="text-gray-600 w-5 h-5" />
        </button>

        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center mr-2">
          <UserCircle className="w-6 h-6 text-orange-500" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-800 text-sm">{selectedUser.nickname}</p>

          {selectedUser.postInfo && (
            <div
              className="flex items-center text-xs text-blue-500 cursor-pointer hover:underline"
              onClick={() => goToPost(selectedUser.postInfo.id)}
            >
              <FileText className="w-3 h-3 mr-1" />
              <span className="truncate">{selectedUser.postInfo.title}</span>
            </div>
          )}
        </div>

        <MoreVertical className="text-gray-600 cursor-pointer w-5 h-5" />
        <div className={`w-2 h-2 rounded-full ml-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
      </div>

      {/* 배너 영역 - 조건부 렌더링 */}
      <div className="flex-none">
        {renderAdoptionRequestBanner()}
        {renderRewardBanner()}
      </div>

      {/* 메시지 영역 - 남은 공간을 모두 차지하면서 스크롤 가능 */}
      <div className="flex-1 min-h-0 overflow-y-auto bg-gray-50">
        <div className="p-4">
          {!Array.isArray(messages) || messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-gray-500 p-4 h-full">
              <div className="bg-orange-100 rounded-full p-3 mb-2">
                <MessageSquare className="w-6 h-6 text-orange-500" />
              </div>
              <p className="text-center text-sm">대화를 시작해보세요!</p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const isMine = msg.sender?.id === currentUser.id || msg.sender === currentUser.id;

              return (
                <div
                  key={index}
                  className={`mb-2 flex ${isMine ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] p-2 rounded-2xl ${
                      isMine
                        ? 'bg-orange-500 text-white'
                        : 'bg-white text-gray-800 border border-gray-200'
                    } ${msg.isTemp ? 'opacity-70' : ''} text-sm`}
                  >
                    {renderMessageContent(msg)}
                    <div className={`text-xs mt-1 ${isMine ? 'text-orange-200' : 'text-gray-400'}`}>
                      {formatTime(msg.timestamp)}
                      {msg.isTemp && ' (전송 중...)'}
                      {!msg.read && !isMine && ' (읽지 않음)'}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 입력 영역 - 고정 높이 */}
      <div className="flex-none bg-white border-t border-gray-200">
        {/* 이미지 미리보기 - 조건부 표시 */}
        {selectedImages.length > 0 && (
          <div className="p-2 bg-gray-100">
            <div className="flex overflow-x-auto gap-2 py-1 max-h-20">
              {selectedImages.map((file, index) => (
                <div key={index} className="relative flex-shrink-0">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Preview ${index}`}
                    className="h-14 w-14 object-cover rounded-lg border border-gray-300"
                  />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 w-4 h-4 flex items-center justify-center"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 메시지 입력창 - 고정 높이 */}
        <div className="h-16 p-4 flex items-center">
          <input
            type="file"
            multiple
            accept="image/*"
            ref={fileInputRef}
            className="hidden"
            onChange={handleImageSelect}
          />
          <button
            onClick={() => fileInputRef.current.click()}
            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-orange-500"
            disabled={isUploading}
          >
            <Image className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={handleTyping}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="메시지를 입력하세요"
            className="flex-1 p-2 border border-gray-300 rounded-full mx-2 focus:outline-none focus:ring-1 focus:ring-orange-400 text-sm"
            disabled={isUploading}
          />
          <button
            onClick={sendMessage}
            disabled={(!newMessage.trim() && selectedImages.length === 0) || !isConnected || !selectedUser?.postInfo || isUploading}
            className={`w-8 h-8 rounded-full ${
              (newMessage.trim() || selectedImages.length > 0) && isConnected && selectedUser?.postInfo && !isUploading
                ? 'bg-orange-500 hover:bg-orange-600'
                : 'bg-gray-300'
            } text-white flex items-center justify-center transition duration-300`}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;