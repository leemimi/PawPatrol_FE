import React from 'react';
import { X, MapPin } from 'lucide-react'; //조회

const PetList = ({ pets, onPetClick, onClose }) => {
    return (
        <div className="bg-white rounded-t-3xl shadow-lg border-t-2 border-orange-100 z-50 transition-all duration-300 ease-in-out">
            <div className="p-4 border-b border-orange-100 flex justify-between items-center">
                <h3 className="font-semibold text-lg text-orange-900">발견된 반려동물</h3>
                <button
                    onClick={onClose}
                    className="text-orange-300 hover:text-orange-400 transition-colors"
                >
                    <X size={24} strokeWidth={2.5} />
                </button>
            </div>
            <div className="max-h-[50vh] overflow-y-auto">
                {pets.length > 0 ? (
                    pets.map(pet => (
                        <PetListItem
                            key={pet.id}
                            pet={pet}
                            onClick={() => onPetClick(pet)}
                        />
                    ))
                ) : (
                    <div className="p-8 text-center text-gray-500">
                        현재 반경 내에 발견된 반려동물이 없습니다.
                    </div>
                )}
            </div>
        </div>
    );
};

const PetListItem = ({ pet, onClick }) => {
    // 상태 값에 따른 스타일 및 텍스트 매핑
    const getStatusInfo = (status) => {
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
            // isNaN(date) 체크는 유효하지 않은 날짜인지 확인
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

    const statusInfo = getStatusInfo(pet.status);
    const petInfo = pet.pet || {}; // pet 객체가 없을 경우 대비

    return (
        <div
            onClick={onClick}
            className="p-4 border-b border-orange-100 hover:bg-orange-50 cursor-pointer"
        >
            <div className="flex gap-4 items-center">
                <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-orange-100">
                    <img
                        src={pet.image || '/api/placeholder/96/96'}
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
                            {formatTime(pet.time)}
                        </span>
                    </div>

                    {/* 반려동물 정보 표시 */}
                    <h3 className="text-lg font-bold text-orange-900 mb-1">
                        {petInfo.name && petInfo.name.trim() ? petInfo.name : '이름 없음'}
                        {petInfo.breed && ` / ${petInfo.breed}`}
                        {petInfo.estimatedAge && ` / ${petInfo.estimatedAge}세`}
                        {petInfo.gender && ` / ${petInfo.gender === 'M' ? '남' : petInfo.gender === 'F' ? '여' : petInfo.gender}`}
                    </h3>

                    <p className="text-sm text-orange-600 flex items-center gap-1">
                        <MapPin size={14} />
                        {pet.location || '위치 정보 없음'}
                    </p>

                    {/* 간단한 설명 추가 */}
                    {pet.content && (
                        <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                            {pet.content}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PetList;