import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { List, MapPin, X, Search, Eye, ArrowRight } from 'lucide-react';

export const ControlButtons = ({
  onLocationClick,
  onListClick,
  onSelectMissingPost,
  onSelectReportPost
}) => {
  const [showPostTypeMenu, setShowPostTypeMenu] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  
  // 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target) && 
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setShowPostTypeMenu(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuRef, buttonRef]);
  
  return (
    <>
      {/* 오버레이 - 메뉴가 열릴 때만 보임 */}
      {showPostTypeMenu && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50"
          onClick={() => setShowPostTypeMenu(false)}
        />
      )}
    
      <button
        onClick={onLocationClick}
        className="fixed bottom-20 left-4 z-40 bg-white rounded-full p-3 shadow-lg text-orange-600 hover:text-orange-500 transition-colors border-2 border-orange-100"
      >
        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2L12 4" />
          <path d="M12 20L12 22" />
          <path d="M20 12L22 12" />
          <path d="M2 12L4 12" />
        </svg>
      </button>
      
      <button
        onClick={onListClick}
        className="fixed bottom-36 left-4 z-40 bg-white rounded-full p-3 shadow-lg text-orange-600 hover:text-orange-600 transition-colors border-2 border-orange-100"
      >
        <List size={24} strokeWidth={2.5} />
      </button>
      
      
    </>
  );
};

ControlButtons.propTypes = {
  onLocationClick: PropTypes.func.isRequired,
  onListClick: PropTypes.func.isRequired,
  onSelectMissingPost: PropTypes.func,
  onSelectReportPost: PropTypes.func
};

export default ControlButtons;