import React from 'react';
import { MapPin, Hospital, X, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CommonCard = ({ item, type, onClose }) => {
    const navigate = useNavigate();
    console.log('item.animalType:', item.animalType);
console.log('item.pet.animalType:', item.pet.animalType);








    // 반려동물 상태 텍스트 변환
    const getStatusText = (status) => {
        switch(status) {
            case 'FINDING': return '찾는중';
            case 'SIGHTING': return '목격';
            case 'SIGHTED': return '목격';  // API 응답에 따라 SIGHTING 또는 SIGHTED로 올 수 있음
            case 'SHELTER': return '보호중';
            default: return status;
        }
    };

    // 동물 타입 텍스트 변환
    const getAnimalTypeText = (animalType) => {
        if (!animalType) return ''; // If animalType is null or undefined, return empty string
        switch (animalType) {
            case 'DOG': return '강아지';
            case 'CAT': return '고양이';
            default: return animalType; // Return the animal type or empty string if it's invalid
        }
    };
    

    // 상세 페이지로 이동하는 함수
    const handleDetailNavigation = (e) => {
        if (e) e.stopPropagation();
        
        if (type !== 'pet') return;
        
        // ID 가져오기 (foundId 우선, id는 차선)
        let postId = null;
        if (item?.foundId !== undefined) {
            postId = item.foundId;
        } else if (item?.id !== undefined) {
            postId = item.id;
        }
        
        if (postId) {
            console.log('상세 페이지로 이동:', postId);
            navigate(`/PetPostDetail/${postId}`);
        } else {
            console.error('유효한 게시물 ID가 없습니다:', item);
        }
    };

    // 타입에 따른 동적 렌더링
    if (type === 'pet') {
        const statusText = getStatusText(item?.status);
        const petImage = item?.image || '/api/placeholder/160/160';
        const location = item?.location || '위치 정보 없음';
        const time = item?.time || '';
        const content = item?.content || '';
        
        const petInfo = item?.pet ? (
            <h3 className="text-lg font-bold text-orange-900 mb-1">
                {getAnimalTypeText(item.animalType)}  / {getAnimalTypeText(item.pet.animalType)}
                / {item.pet.name || item.pet.breed || ''} 
                {item.pet.gender ? ` / ${item.pet.gender}` : ''}
            </h3>
        ) : null;
        
        // 이미지 경로 처리
        const imageUrl = item?.image || '/api/placeholder/160/160';










        return (
            <div className="flex flex-col items-start gap-4 bg-white p-4 rounded-lg border border-orange-200">
                <div className="flex items-start gap-4 w-full">
                    <div 
                        className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-orange-100 cursor-pointer"
                        onClick={handleDetailNavigation}
                    >
                        {/* 이미지 URL 적용 */}
                        <img src={imageUrl} alt="pet" className="w-full h-full object-cover" />

                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <span className={`text-sm px-3 py-1.5 rounded-full font-medium ${
                                statusText === '찾는중' ? 'bg-orange-100 text-orange-500' :
                                statusText === '목격' ? 'bg-red-100 text-red-500' :
                                'bg-green-100 text-green-500'
                            }`}>
                                {statusText}
                            </span>
                            <span className="text-sm text-gray-500">{time}</span>
                        </div>
                        {petInfo}
                        <div className="mt-2">
                            {location && (
                                <p className="text-sm text-orange-600 flex items-center gap-1 mb-2">
                                    <MapPin size={14} />
                                    {location}
                                </p>
                            )}
                            
                            {/* 상세 조회 버튼 추가 */}
                            <div className="mt-3">
                                <button
                                    onClick={handleDetailNavigation}
                                    className="inline-flex items-center px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-md hover:bg-orange-600 transition-colors shadow-md"
                                    style={{position: 'relative', zIndex: 50}}
                                >
                                    <ExternalLink size={16} className="mr-1" />
                                    상세 조회
                                </button>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-orange-300 hover:text-orange-400 transition-colors">
                        <X size={24} strokeWidth={2.5} />
                    </button>
                </div>

                {/* 내용 섹션 추가 */}
                {content && (
                    <div 
                        className="mt-2 w-full cursor-pointer"
                        onClick={handleDetailNavigation}
                    >
                        <p className="text-sm text-gray-700">{content}</p>
                    </div>
                )}
                
                {/* 디버깅용 ID 정보 (개발 중에만 표시) */}
                {process.env.NODE_ENV === 'development' && (
                    <div className="mt-2 pt-2 border-t border-gray-200 w-full">
                        <p className="text-xs text-gray-400">
                            {item?.foundId ? `foundId: ${item.foundId}` : '(foundId 없음)'} | 
                            {item?.id ? ` id: ${item.id}` : ' (id 없음)'}
                        </p>
                    </div>
                )}
            </div>
        );
    }

    // 시설 타입 렌더링
    if (type === 'facility') {
        const facilityImage = item?.image || '/api/placeholder/160/160';
        const address = item?.address || '주소 정보 없음';
        const tel = item?.tel || '연락처 없음';
        const operatingHours = item?.operatingHours || '영업시간 정보 없음';

        return (
            <div className="flex flex-col items-start gap-4 bg-white p-4 rounded-lg border border-green-200">
                <div className="flex items-start gap-4 w-full">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-green-100 bg-green-50 flex items-center justify-center">
                        <img 
                            src={facilityImage} 
                            alt="" 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/api/placeholder/160/160';
                            }}
                        />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm px-3 py-1.5 rounded-full font-medium bg-green-100 text-green-500">
                                운영중
                            </span>
                        </div>
                        
                        <h3 className="text-lg font-bold text-green-900 mb-1">
                            {item.name}
                        </h3>
                        
                        <p className="text-sm text-green-600 flex items-center gap-1">
                            <Hospital size={14} />
                            {address}
                        </p>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="text-green-300 hover:text-green-400 transition-colors"
                    >
                        <X size={24} strokeWidth={2.5} />
                    </button>
                </div>

                {/* 추가 정보 섹션 */}
                <div className="mt-2 w-full space-y-2">
                    <div>
                        <p className="text-sm text-gray-600 font-medium">연락처</p>
                        <p className="text-sm text-gray-700">{tel}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600 font-medium">영업시간</p>
                        <p className="text-sm text-gray-700">{operatingHours}</p>
                    </div>
                </div>
            </div>
        );
    }

    // 기본 렌더링 (타입이 지정되지 않은 경우)
    return null;
};
