import React from 'react';
import { MapPin, Hospital, X } from 'lucide-react';

// 공통 리스트 컴포넌트
export const CommonList = ({ items, type, onItemClick, onClose }) => {
    const titleMap = {
        pet: '발견된 반려동물',
        facility: '주변 보호소/병원'
    };

    return (
        <div className="bg-white rounded-t-3xl shadow-lg border-t-2 border-orange-100 z-50 transition-all duration-300 ease-in-out">
            <div className="p-4 border-b border-orange-100 flex justify-between items-center">
                <h3 className="font-semibold text-lg text-orange-900">
                    {titleMap[type] || '목록'}
                </h3>
                <button
                    onClick={onClose}
                    className="text-orange-300 hover:text-orange-400 transition-colors"
                >
                    <X size={24} strokeWidth={2.5} />
                </button>
            </div>
            <div className="max-h-[50vh] overflow-y-auto">
                {items.length > 0 ? (
                    items.map(item => (
                        <CommonListItem
                            key={item.id}
                            item={item}
                            type={type}
                            onClick={() => onItemClick(item)}
                        />
                    ))
                ) : (
                    <div className="p-8 text-center text-gray-500">
                        {type === 'pet'
                            ? '현재 반경 내에 발견된 반려동물이 없습니다.'
                            : '현재 반경 내에 보호소/병원이 없습니다.'}
                    </div>
                )}
            </div>
        </div>
    );
};

// 공통 리스트 아이템 컴포넌트
const CommonListItem = ({ item, type, onClick }) => {
    // 상태 값에 따른 스타일 및 텍스트 매핑 (반려동물)
    const getPetStatusInfo = (status) => {
        switch (status) {
            case 'FINDING':
                return {
                    text: '찾는중',
                    style: 'bg-orange-100 text-orange-500'
                };
            case 'SIGHTING':
                return {
                    text: '목격',
                    style: 'bg-red-100 text-red-500'
                };
            case 'SHELTER':
                return {
                    text: '보호중',
                    style: 'bg-green-100 text-green-500'
                };
            case 'SHELTER_ANIMAL':
                return {
                    text: '보호소',
                    style: 'bg-blue-100 text-blue-500'
                };
            default:
                return {
                    text: '상태 미정',
                    style: 'bg-gray-100 text-gray-500'
                };
        }
    };

    // 시간 포맷팅 함수
    const formatTime = (timeString) => {
        if (!timeString) return '시간 정보 없음';

        try {
            const date = new Date(timeString);
            if (isNaN(date)) return '유효하지 않은 날짜';

            return date.toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            console.error('날짜 변환 오류:', error);
            return '날짜 변환 오류';
        }
    };

    // 거리 포맷팅 함수
    const formatDistance = (distance) => {
        return distance ? `${distance.toFixed(1)}km` : '거리 정보 없음';
    };

    // 타입에 따른 동적 렌더링
    if (type === 'pet') {
        const statusInfo = getPetStatusInfo(item.status);
        const petInfo = item.pet || {}; // pet 객체가 없을 경우 대비

        return (
            <div
                onClick={onClick}
                className="p-4 border-b border-orange-100 hover:bg-orange-50 cursor-pointer"
            >
                <div className="flex gap-4 items-center">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-orange-100">
                        <img
                            src={item.image || '/api/placeholder/96/96'}
                            alt={petInfo.name || '반려동물'}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/api/placeholder/96/96';
                            }}
                        />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <span className={`text-sm px-3 py-1.5 rounded-full font-medium ${statusInfo.style}`}>
                                {statusInfo.text}
                            </span>
                            <span className="text-sm text-gray-500">
                                {formatTime(item.time)}
                            </span>
                        </div>

                        <h3 className="text-lg font-bold text-orange-900 mb-1">
                            {petInfo.name && petInfo.name.trim() ? petInfo.name : '이름 없음'}
                            {petInfo.breed && ` / ${petInfo.breed}`}
                            {petInfo.estimatedAge && ` / ${petInfo.estimatedAge}세`}
                            {petInfo.gender && ` / ${petInfo.gender === 'M' ? '남' : petInfo.gender === 'F' ? '여' : petInfo.gender}`}
                        </h3>

                        <p className="text-sm text-orange-600 flex items-center gap-1">
                            <MapPin size={14} />
                            {item.location || '위치 정보 없음'}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // 시설 타입 렌더링
    if (type === 'facility') {
        return (
            <div
                onClick={onClick}
                className="p-4 border-b border-orange-100 hover:bg-orange-50 cursor-pointer"
            >
                <div className="flex gap-4 items-center">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-orange-100 bg-orange-50 flex items-center justify-center">
                        <Hospital size={48} className="text-orange-400" />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm px-3 py-1.5 rounded-full font-medium bg-green-100 text-green-500">
                                운영중
                            </span>
                            <span className="text-sm text-gray-500">
                                {formatDistance(item.distanceFromCenter)}
                            </span>
                        </div>

                        <h3 className="text-lg font-bold text-orange-900 mb-1">
                            {item.name}
                        </h3>

                        <p className="text-sm text-orange-600 flex items-center gap-1">
                            <Hospital size={14} />
                            {item.address || '주소 정보 없음'}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // 기본 렌더링 (타입이 지정되지 않은 경우)
    return null;
};