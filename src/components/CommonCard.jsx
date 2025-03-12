import React from 'react';
import { MapPin, Hospital, X, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CommonCard = ({ item, type, onClose }) => {
    const navigate = useNavigate();
    // 반려동물 상태 텍스트 변환 수정 
    const getStatusText = (status) => {
        switch (status) {
            case 'FINDING': return '찾는중';
            case 'FOSTERING': return '임보 중';
            case 'SIGHTED': return '목격';  // API 응답에 따라 SIGHTING 또는 SIGHTED로 올 수 있음
            case 'SHELTER': return '보호중';
            case 'SHELTER_ANIMAL': return '보호소';
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
        console.log("item", item);
        if (type !== 'pet') return;
        console.log('item?.pet?.imageUrl:', item?.pet?.imageUrl);
        console.log('item?.image:', item?.image);

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
            <div className="mb-2">
                <div className="flex items-center flex-wrap gap-2">
                    <h3 className="text-lg font-bold text-orange-900 truncate max-w-[200px]" title={item.pet.name || item.pet.breed || ''}>
                        {item.pet.name || item.pet.breed || ''}
                    </h3>
                    {item.pet.gender && (
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${item.pet.gender === 'M'
                            ? 'bg-blue-100 text-blue-600'
                            : 'bg-pink-100 text-pink-600'
                            }`}>
                            {item.pet.gender === 'M' ? '남아' : '여아'}
                        </span>
                    )}
                    {item.pet.animalType && (
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getAnimalTypeText(item.pet.animalType) === '강아지'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-green-100 text-green-700'
                            }`}>
                            {getAnimalTypeText(item.pet.animalType)}
                        </span>
                    )}
                </div>
            </div>
        ) : null;



        // 이미지 경로 처리
        const imageUrl = item?.pet?.imageUrl || petImage;  // imageUrl이 없으면 item?.image 사용
        const imageUrl1 = item?.image || petImage;  // item?.image가 없으면 기본 이미지 사용


        return (
            <div className="flex flex-col items-start gap-4 bg-white p-4 rounded-lg border border-orange-200">
                <div className="flex items-start gap-4 w-full">
                    {/* 이미지 URL 적용 */}
                    <div className="flex gap-4">
                        {/* 이미지 칸 */}
                        <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-orange-100 cursor-pointer" onClick={handleDetailNavigation}>
                            <img
                                src={imageUrl}
                                alt={item?.pet?.name || '반려동물'}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = '/api/placeholder/160/160';
                                }}
                            />
                        </div>
                    </div>

                    <div className="flex-1">
                        <div className="flex flex-col gap-2 mb-2">
                            <div>
                                <span className={`text-sm px-3 py-1.5 rounded-full font-medium ${statusText === '찾는중' ? 'bg-orange-100 text-amber-600' :
                                    statusText === '목격' ? 'bg-red-100 text-red-500' :
                                        'bg-green-100 text-green-500'
                                    }`}>
                                    {statusText}
                                </span>
                            </div>

                            <div>
                                <span className="text-sm text-amber-700">
                                    {time ? new Date(time).toLocaleString('ko-KR', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        hour12: true
                                    }) : ''}
                                </span>
                            </div>
                        </div>
                        {petInfo}
                    </div>
                    <button onClick={onClose} className="text-orange-300 hover:text-orange-400 transition-colors">
                        <X size={24} strokeWidth={2.5} />
                    </button>
                </div>

                {/* 내용 섹션 추가 - 글자 수 제한 */}
                {content && (
                    <div
                        className="mt-2 w-full cursor-pointer"
                        onClick={handleDetailNavigation}
                    >
                        <p className="text-sm text-amber-700 line-clamp-2 overflow-hidden">
                            {content}
                        </p>
                    </div>
                )}

                <div className="mt-2">
                    {location && (
                        <p className="text-sm text-orange-600 flex items-center gap-1 mb-2">
                            <MapPin size={14} />
                            {location}
                        </p>
                    )}
                </div>

                {/* 상세 조회 버튼 추가 - 가운데 정렬 */}
                <div className="mt-3 w-full flex justify-center">
                    <button
                        onClick={handleDetailNavigation}
                        className="inline-flex items-center px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-md hover:bg-orange-600 transition-colors shadow-md"
                        style={{ position: 'relative', zIndex: 50 }}
                    >
                        <ExternalLink size={16} className="mr-1" />
                        상세 조회
                    </button>
                </div>

                {/* 디버깅용 ID 정보 (개발 중에만 표시) */}
                {process.env.NODE_ENV === 'development' && (
                    <div className="mt-2 pt-2 border-t border-gray-200 w-full">
                        <p className="text-xs text-gray-400">
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
            <div className="flex flex-col items-start gap-4 bg-white p-4 rounded-lg border border-orange-200">
                <div className="flex items-start gap-4 w-full">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-orange-100 bg-orange-50 flex items-center justify-center">
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

                        <h3 className="text-lg font-bold text-orange-900 mb-1">
                            {item.name}
                        </h3>

                        <p className="text-sm text-orange-600 flex items-center gap-1">
                            <Hospital size={14} />
                            {address}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-orange-300 hover:text-orange-400 transition-colors"
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
