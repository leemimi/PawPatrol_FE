const NotificationPopup = ({ notification, onClose }) => {
    const handleClick = () => {
      // 알림 클릭 처리 (예: 해당 페이지로 이동)
      // ...
      
      // 알림 닫기
      onClose();
    };
    
    // 인라인 스타일로 애니메이션 정의
    const slideInAnimation = {
      opacity: 1,
      transform: 'translateX(0)',
      transition: 'opacity 0.3s ease-out, transform 0.3s ease-out'
    };
    
    // 컴포넌트가 마운트될 때 초기 상태
    const slideInInitial = {
      opacity: 0,
      transform: 'translateX(100%)'
    };
    
    return (
      <div 
        className="fixed top-5 right-5 bg-white rounded-lg shadow-lg p-4 z-50 max-w-xs flex items-start cursor-pointer transition-transform duration-300 hover:-translate-y-1"
        onClick={handleClick}
        style={{...slideInInitial, ...slideInAnimation}}
      >
        <div className="flex-1">
          <h3 className="text-base font-semibold mb-1 text-gray-800">
            {notification.title}
          </h3>
          <p className="text-sm text-gray-600">
            {notification.content}
          </p>
        </div>
        <button 
          className="ml-2 text-gray-400 hover:text-gray-600 text-xl focus:outline-none"
          onClick={(e) => { e.stopPropagation(); onClose(); }}
        >
          ×
        </button>
      </div>
    );
  };
  
  export default NotificationPopup;