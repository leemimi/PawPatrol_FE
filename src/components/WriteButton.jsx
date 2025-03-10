import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Search, Eye, X, ArrowRight, Check, Dog, Cat } from 'lucide-react';
import dogLogo from '../assets/images/dog.png';
import catLogo from '../assets/images/cat.png';
import { useNavigate } from 'react-router-dom'; // Import useNavigate hook
import AnimalSelectionModal from '../components/AnimalSelectionModal';


const WriteButton = ({ onSelectMissingPost, onSelectReportPost }) => {
  const [showPostTypeMenu, setShowPostTypeMenu] = useState(false);
  const [showPetSelector, setShowPetSelector] = useState(false);
  const [myPets, setMyPets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPet, setSelectedPet] = useState(null);
  const [showAnimalTypeSelector, setShowAnimalTypeSelector] = useState(false);
  const [selectedAnimalType, setSelectedAnimalType] = useState(null);

  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const petSelectorRef = useRef(null);

  const navigate = useNavigate(); // Declare navigate function from useNavigate hook

  // 제보글 작성 버튼 클릭 핸들러
  const handleReportPostClick = () => {
    setShowPostTypeMenu(false);
    setShowAnimalTypeSelector(true);
    setSelectedAnimalType(null);
  };

  // 동물 종류 선택 핸들러
  const handleAnimalTypeSelect = (type) => {
    setSelectedAnimalType(type);
  };



  // 제보글 다음 단계로 진행 핸들러
  const handleReportNextStep = () => {
    if (selectedAnimalType) {
      setShowAnimalTypeSelector(false);
      onSelectReportPost && onSelectReportPost(selectedAnimalType);
      // '제보글 작성하기' 버튼 클릭 시 리디렉션
      // Sending selected animal type to the backend when navigating
      navigate("/find-pet-report", { state: { animalType: selectedAnimalType } });
    }
  };

  // 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target) &&
        buttonRef.current && !buttonRef.current.contains(event.target)) {
        setShowPostTypeMenu(false);
      }

      if (petSelectorRef.current && !petSelectorRef.current.contains(event.target)) {
        setShowPetSelector(false);
        setSelectedPet(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuRef, buttonRef, petSelectorRef]);

  // 반려동물 목록 가져오기
  const fetchMyPets = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // API 주소를 절대 경로에서 상대 경로로 변경
      const response = await fetch('/api/v2/members/pets', {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        credentials: 'include' // 쿠키 포함
      });

      if (!response.ok) {
        throw new Error(`반려동물 정보를 가져오는데 실패했습니다. 상태 코드: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('서버에서 JSON 형식의 응답을 받지 못했습니다');
      }

      const result = await response.json();
      if (result.statusCode === 200 && result.data) {
        setMyPets(result.data);
      } else {
        throw new Error(result.message || '데이터를 불러오는데 문제가 발생했습니다.');
      }
    } catch (err) {
      console.error('반려동물 정보 로딩 에러:', err);
      setError(err.message);

      // 개발 편의를 위한 임시 데이터 (실제 배포 시 제거)
      if (process.env.NODE_ENV === 'development') {
        console.log('개발 환경에서 샘플 데이터 사용');
        setMyPets([
          {
            id: 13,
            name: "마토마토",
            breed: "포메라니안",
            birthDate: null,
            characteristics: "사람을 경계해요.",
            size: "SMALL",
            registrationNumber: null,
            imageUrl: "https://kr.object.ncloudstorage.com/paw-patrol/petRegister/1cb11d288-cd0a-4b75-a7aa-5ec60aee9f56"
          },
          {
            id: 14,
            name: "초코",
            breed: "말티즈",
            birthDate: null,
            characteristics: "활발해요",
            size: "SMALL",
            registrationNumber: null,
            imageUrl: null
          }
        ]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 실종글 작성 버튼 클릭 핸들러
  const handleMissingPostClick = () => {
    setShowPostTypeMenu(false);
    fetchMyPets();
    setShowPetSelector(true);
    setSelectedPet(null);
    // Redirect to lost pet registration page
    navigate('/lost-pet-registration');
  };

  // 반려동물 선택 핸들러
  const handlePetSelect = (pet) => {
    setSelectedPet(pet);
  };

  // 다음 단계로 진행 핸들러
  const handleNextStep = () => {
    if (selectedPet) {
      setShowPetSelector(false);
      onSelectMissingPost && onSelectMissingPost(selectedPet);
    }
  };



  return (
    <>
      {/* 오버레이 - 메뉴가 열릴 때만 보임 */}
      {(showPostTypeMenu || showPetSelector) && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => {
            setShowPostTypeMenu(false);
            setShowPetSelector(false);
            setSelectedPet(null);
          }}
        />
      )}

      {/* 글쓰기 버튼 */}
      <div className="fixed bottom-20 right-6 z-50">
        <button
          ref={buttonRef}
          onClick={() => setShowPostTypeMenu(!showPostTypeMenu)}
          className="flex items-center gap-2 px-4 py-2 rounded-full shadow-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors"
        >
          <span className="font-small">+ 글쓰기</span>
        </button>

        {/* 실종/제보 선택 메뉴 */}
        {showPostTypeMenu && (
          <div
            ref={menuRef}
            className="absolute bottom-14 right-0 bg-white rounded-lg shadow-lg w-64 overflow-hidden z-50"
          >
            <div className="p-2">
              <button
                onClick={handleMissingPostClick}
                className="w-full flex items-center p-3 rounded-lg hover:bg-orange-50 transition-colors"
              >
                <div className="bg-orange-100 p-1.5 rounded-full mr-2">
                  <Search size={18} className="text-orange-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900 text-sm">실종글 작성</p>
                </div>
              </button>

              <button
                onClick={handleReportPostClick}
                className="w-full flex items-center p-3 rounded-lg hover:bg-orange-50 transition-colors"
              >
                <div className="bg-orange-100 p-1.5 rounded-full mr-2">
                  <Eye size={18} className="text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900 text-sm">제보글 작성</p>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 동물 종류 선택 모달 (제보글) */}
      <AnimalSelectionModal
        isOpen={showAnimalTypeSelector}
        onClose={() => {
          setShowAnimalTypeSelector(false);
          setSelectedAnimalType(null);
        }}
        onSelect={handleAnimalTypeSelect}
        selectedAnimalType={selectedAnimalType}
        onConfirm={handleReportNextStep}
        title="어떤 동물을 제보하시나요?"
        confirmButtonText="제보글 작성하기"
      />

      {/* 반려동물 선택 모달 */}
      {showPetSelector && (
        <div
          ref={petSelectorRef}
          className="fixed bottom-1/2 transform translate-y-1/2 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-xl w-4/5 max-w-md overflow-hidden z-50"
        >
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">실종된 반려동물 선택</h3>
            <button
              onClick={() => {
                setShowPetSelector(false);
                setSelectedPet(null);
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-4 max-h-80 overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              </div>
            ) : error ? (
              <div className="text-red-500 py-4 space-y-2">
                <p className="text-center">{error}</p>
                <button
                  onClick={() => setShowPetSelector(false)}
                  className="w-full py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                >
                  닫기
                </button>
              </div>
            ) : myPets.length === 0 ? (
              <div className="text-center py-4 space-y-4">
                <p className="text-gray-500">등록된 반려동물이 없습니다.</p>
                <button
                  onClick={() => {
                    // 반려동물 등록 페이지로 이동하는 로직
                    setShowPetSelector(false);
                    // window.location.href = '/my-pets/register';
                  }}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                >
                  반려동물 등록하러 가기
                </button>
              </div>
            ) : (
              <>
                <ul className="space-y-3">
                  {myPets.map((pet) => (
                    <li key={pet.id}>
                      <label
                        className={`w-full flex items-center p-3 rounded-lg transition-colors border ${selectedPet && selectedPet.id === pet.id
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:bg-gray-50'
                          }`}
                      >
                        <input
                          type="radio"
                          name="petSelection"
                          value={pet.id}
                          checked={selectedPet && selectedPet.id === pet.id}
                          onChange={() => handlePetSelect(pet)}
                          className="sr-only" // 실제 라디오 버튼은 숨김
                        />
                        <div className={`w-5 h-5 rounded-full mr-3 flex items-center justify-center ${selectedPet && selectedPet.id === pet.id
                          ? 'bg-orange-500 text-white'
                          : 'border border-gray-300'
                          }`}>
                          {selectedPet && selectedPet.id === pet.id && <Check size={12} />}
                        </div>
                        <div className="w-12 h-12 rounded-full overflow-hidden mr-3 flex-shrink-0 bg-gray-100">
                          {pet.imageUrl ? (
                            <img
                              src={pet.imageUrl}
                              alt={pet.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://via.placeholder.com/60';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-orange-100 text-orange-500">
                              {pet.name.substring(0, 1)}
                            </div>
                          )}
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-gray-900">{pet.name}</p>
                          <p className="text-sm text-gray-500">
                            {pet.breed || '등록된 품종 없음'} • {pet.size || '크기 미등록'}
                          </p>
                        </div>
                      </label>
                    </li>
                  ))}
                </ul>

                <div className="mt-6">
                  <button
                    onClick={handleNextStep}
                    disabled={!selectedPet}
                    className={`w-full py-3 rounded-lg flex items-center justify-center gap-2 ${selectedPet
                      ? 'bg-orange-500 text-white hover:bg-orange-600'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                  >
                    <span>제보글 작성하기</span>
                    <ArrowRight size={16} />
                  </button>
                </div>

              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

WriteButton.propTypes = {
  onSelectMissingPost: PropTypes.func,
  onSelectReportPost: PropTypes.func
};

export default WriteButton;