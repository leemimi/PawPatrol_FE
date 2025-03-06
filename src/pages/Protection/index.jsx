import React, { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '../../components/StatusBadge';
import InfiniteScroll from '../../components/InfiniteScroll';
import { useProtections } from '../../hooks/useProtections';

const Protection = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 수정된 커스텀 훅 사용
  const {
    data,
    loading,
    error,
    nextPage
  } = useProtections(0, 10);

  // 훅에서 누적된 데이터 사용
  const animals = data.content;
  const totalElements = data.totalElements;
  const hasMore = !data.last;

  // 페이지 로드 시 스크롤을 최상단으로 이동
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleAnimalClick = (animal) => {
    navigate(`/protection/${animal.animalCaseId}`);
  };

  const renderAnimal = (animal, index) => (
    <div
      className="bg-white rounded-xl overflow-hidden shadow hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => handleAnimalClick(animal)}
    >
      <div className="relative h-40">
        {animal.imageUrl && (
          <img
            src={animal.imageUrl}
            alt={animal.title}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute top-2 left-2">
          <StatusBadge status={animal.caseStatus} type="protection" />
        </div>
      </div>

      <div className="p-3 h-[5.5rem] flex flex-col justify-between">
        <h3 className="text-sm text-gray-800 min-h-[2.5rem] line-clamp-2 text-center">
          {animal.title}
        </h3>
        <div className="flex justify-between items-center text-xs mt-1">
          <span className="text-orange-500">{animal.breed}</span>
          <span className="text-gray-400">{new Date(animal.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );

  const loadingComponent = (
    <div className="text-center py-4">
      <span className="text-gray-500">불러오는 중...</span>
    </div>
  );

  const endMessage = (
    <div className="text-center py-4">
      <span className="text-gray-500">모든 동물을 불러왔습니다.</span>
    </div>
  );

  const emptyComponent = (
    <div className="flex flex-col items-center justify-center h-64 p-4">
      <p className="text-gray-600 text-center">
        등록된 동물이 없습니다.
      </p>
    </div>
  );

  // 에러 처리
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 p-4">
        <p className="text-red-600 text-center">
          데이터를 불러오는 중 오류가 발생했습니다.
        </p>
        <button
          className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg"
          onClick={() => window.location.reload()}
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto bg-[#FFF5E6] min-h-screen p-3 relative pb-24">
      <div className="mb-6 bg-white rounded-xl p-4 shadow hover:shadow-md transition-shadow">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🐾</span>
          <div>
            <p className="text-sm text-gray-600 mt-1">
              총 <span className="text-orange-500 font-semibold">{totalElements}</span>마리의
              <span className="text-orange-400 font-semibold"> 귀여운 친구들</span>이 기다리고 있어요!
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <InfiniteScroll
          items={animals}
          hasMore={hasMore}
          loading={loading}
          loadMore={nextPage}
          renderItem={renderAnimal}
          loadingComponent={loadingComponent}
          emptyComponent={emptyComponent}
          endMessage={endMessage}
          className="grid grid-cols-2 gap-3 col-span-2"
        />
      </div>

      {/* 메뉴 버튼과 팝업 */}
      <div className="fixed bottom-20 right-4 z-50">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="bg-white rounded-full p-3 shadow-lg text-orange-400 hover:text-orange-500 transition-colors border-2 border-orange-100"
        >
          <Menu size={24} strokeWidth={2.5} />
        </button>

        {/* 팝업 메뉴 */}
        {isMenuOpen && (
          <div className="absolute bottom-16 right-0 w-40 bg-white rounded-lg shadow-lg overflow-hidden">
            <button
              className="w-full px-4 py-3 text-sm font-bold text-orange-400 text-left hover:bg-orange-50 text-gray-700 transition-colors border-b border-gray-100"
              onClick={() => {
                setIsMenuOpen(false);
                navigate('/register-animal'); // 동물 등록 페이지로 이동
              }}
            >
              동물 등록하기
            </button>
            <button
              className="w-full px-4 py-3 text-sm font-bold text-orange-400  text-left hover:bg-orange-50 text-gray-700 transition-colors border-b border-gray-100"
              onClick={() => {
                setIsMenuOpen(false);
                navigate('/my-register-animals'); // 등록한 동물 목록 페이지로 이동
              }}
            >
              내 동물 목록
            </button>
            <button
              className="w-full px-4 py-3 text-sm font-bold text-orange-400  text-left hover:bg-orange-50 text-gray-700 transition-colors"
              onClick={() => {
                setIsMenuOpen(false);
                navigate('/my-applications'); // 나의 신청 목록 페이지로 이동
              }}
            >
              나의 신청 목록
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Protection;