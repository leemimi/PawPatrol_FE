import { MapPin, Hospital, X } from 'lucide-react';

export const CommonCard = ({ item, type, onClose }) => {
    // 반려동물 상태 텍스트 변환
    const getStatusText = (status) => {
        switch(status) {
            case 'FINDING': return '찾는중';
            case 'SIGHTING': return '목격';
            case 'SHELTER': return '보호중';
            default: return status;
        }
    };

    // 타입에 따른 동적 렌더링
    if (type === 'pet') {
        const statusText = getStatusText(item?.status);
        const petImage = item?.image || '/api/placeholder/160/160';
        const location = item?.location || '위치 정보 없음';
        const time = item?.time || '';
        const content = item?.content || '';

        // 동물 정보 (있을 경우)
        const petInfo = item?.pet ? (
            <h3 className="text-lg font-bold text-orange-900 mb-1">
                {item.pet.animalType || ''} / {item.pet.name || ''}
                {item.pet.gender ? ` / ${item.pet.gender}` : ''}
            </h3>
        ) : null;

        return (
            <div className="flex flex-col items-start gap-4">
                <div className="flex items-start gap-4 w-full">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-orange-100">
                        <img src={petImage} alt="" className="w-full h-full object-cover" />
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
                        {location && (
                            <p className="text-sm text-orange-600 flex items-center gap-1">
                                <MapPin size={14} />
                                {location}
                            </p>
                        )}
                    </div>
                    <button onClick={onClose} className="text-orange-300 hover:text-orange-400 transition-colors">
                        <X size={24} strokeWidth={2.5} />
                    </button>
                </div>

                {/* 내용 섹션 추가 */}
                {content && (
                    <div className="mt-2 w-full">
                        <p className="text-sm text-gray-700">{content}</p>
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
            <div className="flex flex-col items-start gap-4">
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
