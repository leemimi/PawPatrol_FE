import React, { useState, useEffect } from 'react';
import { MapPin, X, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PetApiService } from '../api/PetApiService'; // 경로를 실제 구조에 맞게 조정해주세요

export const PetCard = ({ pet, onClose, isAnimalList = false, position, range }) => {
    const [petData, setPetData] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // 강력한 디버깅 로그
    console.log('%c === PetCard RENDER ===', 'background: #ff5733; color: white; padding: 2px;');
    console.log('Pet object:', pet);
    console.log('Pet foundId:', pet?.foundId);
    console.log('Pet id:', pet?.id);
    
    // 데이터 가져오기 로직
    useEffect(() => {
        const fetchPetsData = async () => {
            setLoading(true);
            try {
                const data = await PetApiService.fetchPetsByLocation(position, range);
                console.log('Fetched Pet Data:', data);
                setPetData(data);
            } catch (error) {
                console.error('Error fetching pet data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (position && range) {
            fetchPetsData();
        }
    }, [position, range]);

    const defaultPet = {
        animalType: '알 수 없음',
        breed: '알 수 없음',
        size: '알 수 없음',
        healthCondition: '정보 없음',
        feature: '특징 없음',
        estimatedAge: '정보 없음',
        imageUrl: '/api/placeholder/160/160',
        status: '정보 없음',
        location: '위치 정보 없음',
    };

    // 상세 페이지로 이동하는 함수 (단순화)
    const goToDetailPage = (e) => {
        if (e) e.stopPropagation();
        
        // API 응답에 foundId가, id가 모두 있는지 확인
        let postId = null;
        
        if (pet) {
            if (pet.foundId !== undefined) {
                postId = pet.foundId;
                console.log('Using foundId:', postId);
            } else if (pet.id !== undefined) {
                postId = pet.id;
                console.log('Using id:', postId);
            }
        }
        
        if (postId) {
            // 테스트를 위한 콘솔 로그와 alert
            console.log('Attempting to navigate to:', `/PetPostDetail/${postId}`);
            window.alert(`상세 페이지로 이동 시도: ID ${postId}`);
            
            // 실제 이동
            navigate(`/PetPostDetail/${postId}`);
        } else {
            console.error('유효한 ID가 없습니다:', pet);
            window.alert('오류: 게시물 ID를 찾을 수 없습니다');
        }
    };

    // PetCard 일반 모드
    if (!isAnimalList) {
        const petImage = pet?.image || defaultPet.imageUrl;
        const location = pet?.location || defaultPet.location;
        const time = pet?.time || '';
        const content = pet?.content || '';

        const getStatusText = (status) => {
            switch (status) {
                case 'FINDING': return '찾는중';
                case 'SIGHTED': return '목격';
                case 'SHELTER': return '보호중';
                default: return status;
            }
        };

        const displayStatusText = getStatusText(pet?.status || defaultPet.status);

        // JSX 바로 앞에 로그를 추가
        console.log('PetCard 일반 모드 렌더링 직전');

        return (
            <div className="flex flex-col items-start gap-4 relative bg-white p-4 rounded-lg shadow-sm border border-orange-200">
                <div className="flex items-start gap-4 w-full">
                    <div
                        className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-orange-100 cursor-pointer"
                        onClick={goToDetailPage}
                    >
                        <img src={petImage} alt="Pet" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <span
                                className={`text-sm px-3 py-1.5 rounded-full font-medium ${
                                    displayStatusText === '찾는중' ? 'bg-orange-100 text-orange-500' :
                                    displayStatusText === '목격' ? 'bg-red-100 text-red-500' :
                                    'bg-green-100 text-green-500'
                                }`}
                            >
                                {displayStatusText}
                            </span>
                            <span className="text-sm text-gray-500">{time}</span>
                        </div>
                        
                        {pet?.pet && (
                            <h3 className="text-lg font-bold text-orange-900 mb-1">
                                {pet.pet.animalType || defaultPet.animalType} / {pet.pet.breed || defaultPet.breed}
                                {pet.pet.gender ? ` / ${pet.pet.gender}` : ''}
                            </h3>
                        )}
                        
                        <div className="mt-2">
                            {location && (
                                <p className="text-sm text-orange-600 flex items-center gap-1 mb-2">
                                    <MapPin size={14} />
                                    {location}
                                </p>
                            )}
                            
                            {/* 분리된 상세 조회 버튼 - 항상 표시 */}
                            <div className="mt-3 mb-2">
                                <button
                                    onClick={goToDetailPage}
                                    className="inline-flex items-center px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-md hover:bg-orange-600 transition-colors shadow-md"
                                    style={{position: 'relative', zIndex: 50}}
                                >
                                    <ExternalLink size={16} className="mr-1" />
                                    상세 조회
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    {onClose && (
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                if (onClose) onClose();
                            }}
                            className="text-orange-300 hover:text-orange-400 transition-colors"
                        >
                            <X size={24} strokeWidth={2.5} />
                        </button>
                    )}
                </div>
                
                {content && (
                    <div
                        className="mt-2 w-full cursor-pointer"
                        onClick={goToDetailPage}
                    >
                        <p className="text-sm text-gray-700">{content}</p>
                    </div>
                )}
                
                {/* 디버깅용 상세 정보 */}
                <div className="mt-3 pt-3 border-t border-gray-200 w-full">
                    <p className="text-xs text-gray-500">
                        {pet?.foundId ? `foundId: ${pet.foundId}` : '(foundId 없음)'} | 
                        {pet?.id ? ` id: ${pet.id}` : ' (id 없음)'}
                    </p>
                </div>
            </div>
        );
    }

    // 동물 목록 모드
    console.log('PetCard 동물 목록 모드 렌더링 직전');
    console.log('petData length:', petData?.length || 0);
    
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {loading ? (
                <p className="text-center text-gray-500 col-span-full">동물 데이터를 불러오는 중...</p>
            ) : petData.length === 0 ? (
                <p className="text-center text-gray-500 col-span-full">표시할 데이터가 없습니다</p>
            ) : (
                petData.map((animal, index) => {
                    console.log(`Animal ${index}:`, animal);
                    console.log(`Animal ${index} foundId:`, animal.foundId);
                    console.log(`Animal ${index} id:`, animal.id);
                    
                    return (
                        <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden border border-orange-200 relative">
                            <div
                                className="relative h-48 cursor-pointer"
                                onClick={() => {
                                    // 단일 함수로 동일하게 처리
                                    let postId = null;
                                    if (animal.foundId !== undefined) {
                                        postId = animal.foundId;
                                    } else if (animal.id !== undefined) {
                                        postId = animal.id;
                                    }
                                    
                                    if (postId) {
                                        console.log('목록에서 상세페이지로 이동:', postId);
                                        navigate(`/PetPostDetail/${postId}`);
                                    } else {
                                        console.error('유효한 ID가 없습니다:', animal);
                                    }
                                }}
                            >
                                <img
                                    src={animal.image || defaultPet.imageUrl}
                                    alt={animal.breed || '동물 이미지'}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="p-4">
                                <h3
                                    className="font-bold text-lg text-orange-900 cursor-pointer hover:text-orange-700 transition-colors mb-3"
                                    onClick={() => {
                                        let postId = animal.foundId || animal.id;
                                        if (postId) navigate(`/PetPostDetail/${postId}`);
                                    }}
                                >
                                    {animal.content || '제목 없음'}
                                </h3>
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-gray-500">
                                        {animal.pet?.breed || animal.breed || '품종 정보 없음'}
                                    </p>
                                    
                                    {/* 직접 인라인 함수로 처리 */}
                                    <button
                                        onClick={() => {
                                            let postId = animal.foundId || animal.id;
                                            if (postId) {
                                                console.log('버튼 클릭, 이동:', postId);
                                                navigate(`/PetPostDetail/${postId}`);
                                            }
                                        }}
                                        className="inline-flex items-center px-3 py-1.5 bg-orange-500 text-white text-sm font-medium rounded-md hover:bg-orange-600 transition-colors shadow-md"
                                        style={{position: 'relative', zIndex: 50}}
                                    >
                                        <ExternalLink size={14} className="mr-1" />
                                        상세 조회
                                    </button>
                                </div>
                                
                                {/* 디버깅용 ID 정보 표시 */}
                                <p className="text-xs text-gray-400 mt-2">
                                    {animal.foundId ? `foundId: ${animal.foundId}` : '(foundId 없음)'} | 
                                    {animal.id ? ` id: ${animal.id}` : ' (id 없음)'}
                                </p>
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
};