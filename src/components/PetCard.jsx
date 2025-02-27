import React from 'react';
import { MapPin, X } from 'lucide-react'; //여기서 상세 조회되도록 
import { useNavigate } from 'react-router-dom'; // Import useNavigate

export const PetCard = ({ pet, onClose }) => {
      // Initialize useNavigate hook
      const navigate = useNavigate();
    // 데이터 디버깅을 위한 콘솔 로그
    console.log('PetCard received:', pet);
    
    // 상태 텍스트 변환
    const getStatusText = (status) => {
        switch(status) {
            case 'FINDING':
                return '찾는중';
            case 'SIGHTING':
                return '목격';
            case 'SHELTER':
                return '보호중';
            default:
                return status;
        }
    };
    
    // 안전하게 데이터 접근
    const statusText = getStatusText(pet?.status);
    const petImage = pet?.image || '/api/placeholder/160/160';
    const location = pet?.location || '위치 정보 없음';
    const time = pet?.time || '';
    const content = pet?.content || '';

     // Handle image click to navigate to PetPostDetail
     const handleImageClick = () => {
        console.log('Pet ID:', pet?.id); // Add this to check if pet.id is available
        if (pet?.id) {
            navigate(`/PetPostDetail/${pet.id}`);
        }
    };
    
    // 동물 정보 (있을 경우)
    const petInfo = pet?.pet ? (
        <h3 className="text-lg font-bold text-orange-900 mb-1">
            {pet.pet.animalType || ''} / {pet.pet.name || ''} 
            {pet.pet.gender ? ` / ${pet.pet.gender}` : ''}
        </h3>
    ) : null;
    
    return (
        <div className="flex flex-col items-start gap-4">
            <div className="flex items-start gap-4 w-full">
                <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-orange-100">
                <img 
                        src={petImage} 
                        alt="" 
                        className="w-full h-full object-cover cursor-pointer" // Add cursor-pointer for better UX
                        onClick={handleImageClick} // Handle image click
                    />
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
};