import React, { useState, useEffect } from 'react';
import { Menu, Search, X, MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '../../components/StatusBadge';
import InfiniteScroll from '../../components/InfiniteScroll';
import { useProtections } from '../../hooks/useProtections';

const Protection = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [animalType, setAnimalType] = useState(null); // DOG, CAT, null(모두)
  const [location, setLocation] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(true);

  // 수정된 커스텀 훅 사용
  const {
    data,
    loading,
    error,
    nextPage,
    resetPage,
    refresh
  } = useProtections(0, 10, animalType, location);

  // 훅에서 누적된 데이터 사용
  const animals = data.content;
  const totalElements = data.totalElements;
  const hasMore = !data.last;

  // 필터 적용
  const applyFilters = () => {
    setLocation(searchQuery);
    resetPage();
    refresh();
    setShowFilters(false);
  };

  // 필터 초기화
  const resetFilters = () => {
    setAnimalType(null);
    setSearchQuery('');
    setLocation('');
    resetPage();
    refresh();
  };

  // 동물 종류 변경
  const handleAnimalTypeChange = (type) => {
    setAnimalType(type === animalType ? null : type);
    resetPage();
    refresh();
  };

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

      <div className="p-3 h-[6.5rem] flex flex-col justify-between">
        <h3 className="text-sm text-gray-800 min-h-[2.5rem] line-clamp-2 text-center">
          {animal.title}
        </h3>
        {animal.location && (
          <div className="flex items-center justify-start text-xs text-gray-400 mt-1">
            <MapPin size={12} className="mr-1" />
            <span className="truncate">{animal.location}</span>
          </div>
        )}
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
      <div className="mb-4 bg-white rounded-xl p-4 shadow hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🐾</span>
            <p className="text-sm text-gray-600">
              총 <span className="text-orange-500 font-semibold">{totalElements}</span>마리의
              <span className="text-orange-400 font-semibold"> 귀여운 친구들</span>이 기다리고 있어요!
            </p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="text-orange-500 flex items-center"
          >
            {showFilters ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>

        {showFilters && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2">
              {/* 동물 유형 필터 버튼 */}
              <button
                onClick={() => handleAnimalTypeChange('DOG')}
                className={`px-3 py-1.5 rounded-full text-xs ${animalType === 'DOG'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-600'
                  }`}
              >
                강아지
              </button>
              <button
                onClick={() => handleAnimalTypeChange('CAT')}
                className={`px-3 py-1.5 rounded-full text-xs ${animalType === 'CAT'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-600'
                  }`}
              >
                고양이
              </button>

              {/* 검색 입력 필드 */}
              <div className="flex-1 flex items-center ml-2 bg-gray-100 rounded-full overflow-hidden">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="지역 검색"
                  className="flex-1 px-3 py-1.5 text-xs bg-transparent focus:outline-none"
                  onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                />
                <button
                  onClick={applyFilters}
                  className="px-3 py-1.5 text-orange-500 hover:text-orange-600 transition-colors"
                >
                  <Search size={14} />
                </button>
              </div>

              {/* 초기화 버튼 - X 아이콘만 */}
              {(animalType || location) && (
                <button
                  onClick={resetFilters}
                  className="p-1.5 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <InfiniteScroll
          items={animals}
          hasMore={hasMore}
          loading={loading}
          loadMore={nextPage}
          renderItem={renderAnimal}
          loadingComponent={<div className="text-center py-4"><span className="text-gray-500">불러오는 중...</span></div>}
          emptyComponent={
            <div className="flex flex-col items-center justify-center h-64 p-4 col-span-2">
              <p className="text-gray-600 text-center">
                {animalType || location
                  ? '검색 결과가 없습니다.'
                  : '등록된 동물이 없습니다.'}
              </p>
              {(animalType || location) && (
                <button
                  onClick={resetFilters}
                  className="mt-2 px-3 py-1 bg-orange-100 text-orange-500 rounded-full text-sm"
                >
                  필터 초기화
                </button>
              )}
            </div>
          }
          endMessage={<div className="text-center py-4"><span className="text-gray-500">모든 동물을 불러왔습니다.</span></div>}
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