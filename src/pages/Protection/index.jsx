import React, { useState, useEffect } from 'react';
import { Menu, Search, X, ChevronDown, ChevronUp, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProtections } from '../../hooks/useProtections';
import AnimalCaseList from '../../components/AnimalCaseList';
import AnimalSelectionModal from '../../components/AnimalSelectionModal';

const Protection = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [animalType, setAnimalType] = useState(null); // DOG, CAT, null(모두)
  const [location, setLocation] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(true);
  const [showAnimalTypeModal, setShowAnimalTypeModal] = useState(false);
  const [selectedAnimalType, setSelectedAnimalType] = useState(null);

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
    <div className="max-w-lg mx-auto bg-orange-100 min-h-screen p-3 relative pb-24">
      <div className="mb-4 bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🐾</span>
            <div className="text-base">
              <p className="text-amber-800 leading-relaxed">
                총 <span className="text-amber-600 font-bold text-lg">{totalElements}</span>마리의
                <span className="text-amber-700 font-bold"> 귀여운 친구들</span>이
                <br />기다리고 있어요!
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="text-amber-600 hover:text-amber-700 flex items-center gap-1 bg-orange-50 px-3 py-1.5 rounded-full transition-all duration-200"
          >
            <Filter size={16} className={`transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
            <span className="text-sm font-medium">필터</span>
            {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-amber-100">
            <div className="flex items-center gap-3">
              {/* 동물 유형 필터 버튼 */}
              <button
                onClick={() => handleAnimalTypeChange('DOG')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${animalType === 'DOG'
                  ? 'bg-amber-500 text-white shadow-md'
                  : 'bg-orange-50 text-amber-700 hover:bg-amber-100'
                  }`}
              >
                강아지
              </button>
              <button
                onClick={() => handleAnimalTypeChange('CAT')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${animalType === 'CAT'
                  ? 'bg-amber-500 text-white shadow-md'
                  : 'bg-orange-50 text-amber-700 hover:bg-amber-100'
                  }`}
              >
                고양이
              </button>

              {/* 검색 입력 필드 */}
              <div className="flex-1 flex items-center ml-2 bg-orange-50 rounded-full overflow-hidden shadow-sm">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="지역 검색"
                  className="flex-1 px-4 py-2 text-sm bg-transparent focus:outline-none text-amber-800 placeholder-amber-600"
                  onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                />
                <button
                  onClick={applyFilters}
                  className="px-4 py-2 text-amber-600 hover:text-amber-700 transition-colors"
                >
                  <Search size={16} />
                </button>
              </div>

              {/* 초기화 버튼 */}
              {(animalType || location) && (
                <button
                  onClick={resetFilters}
                  className="p-2 rounded-full bg-amber-100 text-amber-600 hover:bg-amber-200 transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* AnimalCaseList 컴포넌트 사용 */}
        <AnimalCaseList
          animals={animals}
          hasMore={hasMore}
          loading={loading}
          nextPage={nextPage}
          detailPath="/protection"
          emptyMessage={animalType || location ? '검색 결과가 없습니다.' : '등록된 동물이 없습니다.'}
          emptyAction={
            (animalType || location) ? (
              <button
                onClick={resetFilters}
                className="mt-2 px-3 py-1 bg-orange-100 text-orange-500 rounded-full text-sm"
              >
                필터 초기화
              </button>
            ) : null
          }
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
                setShowAnimalTypeModal(true);
              }}
            >
              동물 등록하기
            </button>
            <button
              className="w-full px-4 py-3 text-sm font-bold text-orange-400  text-left hover:bg-orange-50 text-gray-700 transition-colors border-b border-gray-100"
              onClick={() => {
                setIsMenuOpen(false);
                navigate('/my-register-animals');
              }}
            >
              내 동물 목록
            </button>
            <button
              className="w-full px-4 py-3 text-sm font-bold text-orange-400  text-left hover:bg-orange-50 text-gray-700 transition-colors"
              onClick={() => {
                setIsMenuOpen(false);
                navigate('/my-applications');
              }}
            >
              나의 신청 목록
            </button>
          </div>
        )}
      </div>

      <AnimalSelectionModal
        isOpen={showAnimalTypeModal}
        onClose={() => setShowAnimalTypeModal(false)}
        onSelect={setSelectedAnimalType}
        selectedAnimalType={selectedAnimalType}
        title="어떤 동물을 등록하시나요?"
        confirmButtonText="동물 등록하기"
        onConfirm={() => {
          setShowAnimalTypeModal(false);
          navigate("/register-animal", {
            state: {
              animalType: selectedAnimalType
            }
          });
        }}
      />
    </div>
  );
};

export default Protection;