import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Bell, X, MessageSquare } from 'lucide-react';

const NotificationButton = ({ notifications = [], onViewNotification, onClearNotification }) => {
  const [showNotificationsMenu, setShowNotificationsMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  // 읽지 않은 알림 개수 업데이트
  useEffect(() => {
    const unread = notifications.filter(notif => !notif.read).length;
    setUnreadCount(unread);
  }, [notifications]);

  // 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target) && 
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setShowNotificationsMenu(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuRef, buttonRef]);

  // 알림 클릭 핸들러
  const handleNotificationClick = (notification) => {
    if (onViewNotification) {
      onViewNotification(notification);
    }
    setShowNotificationsMenu(false);
  };

  // 알림 삭제 핸들러
  const handleClearNotification = (e, notification) => {
    e.stopPropagation(); // 부모 요소의 클릭 이벤트 전파 방지
    if (onClearNotification) {
      onClearNotification(notification);
    }
  };

  // 읽지 않은 알림 수에 따라 버튼 색상 변경
  const getButtonStyle = () => {
    return unreadCount > 0 
      ? 'bg-orange-500 text-white hover:bg-orange-600' 
      : 'bg-white text-gray-600 hover:bg-gray-100';
  };

  return (
    <>
      {/* 알림 버튼 - 글쓰기 버튼 위로 위치 변경 */}
      <div className="fixed bottom-32 right-6 z-50">
        <button
          ref={buttonRef}
          onClick={() => setShowNotificationsMenu(!showNotificationsMenu)}
          className={`flex items-center justify-center w-12 h-12 rounded-full shadow-lg ${getButtonStyle()} transition-colors`}
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
        
        {/* 알림 목록 메뉴 */}
        {showNotificationsMenu && (
          <div 
            ref={menuRef}
            className="absolute bottom-14 right-0 bg-white rounded-lg shadow-lg w-72 overflow-hidden z-50"
          >
            <div className="p-3 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-semibold text-gray-900">알림</h3>
              {notifications.length > 0 && (
                <span className="text-xs text-gray-500">{notifications.length}개의 알림</span>
              )}
            </div>
            
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <MessageSquare size={32} className="mx-auto mb-2 text-gray-300" />
                  <p>새로운 알림이 없습니다</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {notifications.map((notification, index) => (
                    <li 
                      key={notification.id || index}
                      onClick={() => handleNotificationClick(notification)}
                      className={`p-3 hover:bg-gray-50 cursor-pointer ${!notification.read ? 'bg-orange-50' : ''}`}
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-sm text-gray-900">
                          {notification.status === 'FINDING' ? '실종 신고' : '발견 신고'}
                        </h4>
                        <button 
                          onClick={(e) => handleClearNotification(e, notification)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <X size={14} />
                        </button>
                      </div>
                      <p className="text-sm text-gray-700 mt-1 line-clamp-2">
                        {notification.content}
                      </p>
                      <div className="flex items-center mt-2 text-xs text-gray-500">
                        <span className="mr-2">작성자: {notification.nickname}</span>
                        {notification.timestamp && (
                          <span>{new Date(notification.timestamp).toLocaleTimeString()}</span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

NotificationButton.propTypes = {
  notifications: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      status: PropTypes.string,
      content: PropTypes.string,
      nickname: PropTypes.string,
      timestamp: PropTypes.number,
      read: PropTypes.bool,
      latitude: PropTypes.number,
      longitude: PropTypes.number
    })
  ),
  onViewNotification: PropTypes.func,
  onClearNotification: PropTypes.func
};

export default NotificationButton;