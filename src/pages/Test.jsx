import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { PetCard } from '../components/PetCard'; // 경로를 실제 구조에 맞게 조정해주세요

// 테스트 데이터
const testPet = {
  foundId: 1, // foundId 명시적 추가
  // id: 1, // id 대신 foundId만 사용
  content: "테스트 펫 게시물입니다.",
  status: "SIGHTED",
  image: "/api/placeholder/160/160",
  time: "2025-02-27T12:00:00",
  location: "서울시 강남구",
  pet: {
    animalType: "CAT",
    breed: "국내 단모종",
    gender: "W",
    size: "SMALL"
  }
};

// 메인 페이지
const Test = () => {
  const [showPetCard, setShowPetCard] = useState(true);
  
  const handleClose = () => {
    setShowPetCard(false);
    setTimeout(() => setShowPetCard(true), 1000); // 1초 후 다시 표시
  };
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">PetCard 테스트 페이지</h1>
      
      <div className="flex gap-4 mb-6">
        <Link to="/" className="px-4 py-2 bg-blue-500 text-white rounded-md">
          홈
        </Link>
        <Link to="/detail/1" className="px-4 py-2 bg-green-500 text-white rounded-md">
          상세 페이지 (ID: 1)
        </Link>
      </div>
      
      {showPetCard ? (
        <div className="bg-gray-100 p-6 rounded-lg mb-8">
          <h2 className="text-lg font-bold mb-4">PetCard - 일반 모드</h2>
          <PetCard 
            pet={testPet} 
            onClose={handleClose} 
          />
        </div>
      ) : (
        <div className="bg-gray-100 p-6 rounded-lg mb-8 text-center">
          <p>PetCard가 닫혔습니다. 1초 후 다시 표시됩니다.</p>
        </div>
      )}
      
      <div className="bg-gray-100 p-6 rounded-lg">
        <h2 className="text-lg font-bold mb-4">수동 테스트 버튼</h2>
        <div className="flex flex-col gap-2">
          <button 
            onClick={() => window.location.href = `/PetPostDetail/1`}
            className="px-4 py-2 bg-orange-500 text-white rounded-md"
          >
            수동 이동: /PetPostDetail/1
          </button>
          
          <button 
            onClick={() => {
              const testId = prompt("이동할 ID를 입력하세요:");
              if (testId) window.location.href = `/PetPostDetail/${testId}`;
            }}
            className="px-4 py-2 bg-purple-500 text-white rounded-md"
          >
            ID 직접 입력하여 이동
          </button>
        </div>
      </div>
    </div>
  );
};
export default Test;