import React, { useState } from 'react';
import { MapPin, ChevronLeft, Search, List, X, ChevronUp, Dog, Heart } from 'lucide-react';

const MainMapView = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [selectedRange, setSelectedRange] = useState(3);
    const [viewMode, setViewMode] = useState('map');
    const [selectedPet, setSelectedPet] = useState(null);
    const [showList, setShowList] = useState(false);

    const lostPets = [
        { 
            id: 1, 
            breed: '말티즈', 
            age: 2, 
            gender: '수컷',
            status: '찾는중',
            image: '/api/placeholder/160/160', 
            distance: '500m',
            time: '1시간 전',
            location: '서울시 강남구 역삼동'
        },
        { 
            id: 2, 
            breed: '포메라니안', 
            age: 3, 
            gender: '암컷',
            status: '임시보호',
            image: '/api/placeholder/160/160', 
            distance: '1.2km',
            time: '2시간 전',
            location: '서울시 강남구 삼성동'
        },
    ];

    return (
        <div className="h-screen w-full bg-orange-50/30 relative overflow-hidden">
            {/* Header */}
            <div className="fixed top-0 left-0 right-0 z-20 bg-white px-4 py-3 flex items-center justify-between border-b border-orange-100">
                <button className="p-2 text-orange-400 hover:text-orange-500 transition-colors">
                    <ChevronLeft size={28} strokeWidth={2.5} />
                </button>
                <h1 className="text-lg font-bold text-orange-900 flex items-center gap-2">
                    <Dog className="text-orange-400" size={20} />
                    <span>주변의 귀여운 친구들</span>
                </h1>
                <button className="p-2 text-orange-400 hover:text-orange-500 transition-colors">
                    <Search size={24} strokeWidth={2.5} />
                </button>
            </div>

            {/* Main Map */}
            <div className="h-full pt-14">
                <div className="relative h-full">
                    <img src="/api/placeholder/600/800" alt="Map" className="w-full h-full object-cover" />
                    
                    {/* 반경 설정 */}
                    <div className="absolute top-4 left-4 right-4">
                        <div className="bg-white/95 rounded-3xl shadow-lg p-6 backdrop-blur-sm border-2 border-orange-100">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-sm text-orange-700 font-medium flex items-center gap-2">
                                    <Heart size={16} className="text-orange-400" />
                                    검색 반경
                                </p>
                                <p className="text-sm font-bold text-orange-500">{selectedRange}km</p>
                            </div>
                            <input
                                type="range"
                                min="1"
                                max="10"
                                value={selectedRange}
                                onChange={(e) => setSelectedRange(Number(e.target.value))}
                                className="w-full accent-orange-500"
                            />
                        </div>
                    </div>

                    {/* 마커들 */}
                    <div className="absolute inset-0 pointer-events-none">
                        <svg className="w-full h-full">
                            <circle
                                cx="50%"
                                cy="50%"
                                r={`${selectedRange * 20}px`}
                                fill="rgba(251, 146, 60, 0.15)"
                                stroke="rgba(251, 146, 60, 0.4)"
                                strokeWidth="3"
                                strokeDasharray="8,8"
                            />
                            {lostPets.map((pet, index) => (
                                <g
                                    key={pet.id}
                                    className="cursor-pointer transition-transform hover:scale-110"
                                    style={{ pointerEvents: 'auto' }}
                                    onClick={() => setSelectedPet(pet)}
                                    transform={`translate(${300 + index * 50}, ${400 + index * 30})`}
                                >
                                    <circle
                                        r="28"
                                        fill="white"
                                        stroke={pet.status === '찾는중' ? 'rgb(251, 146, 60)' : 'rgb(147, 197, 253)'}
                                        strokeWidth="3"
                                    />
                                    <Dog
                                        className={`${pet.status === '찾는중' ? 'text-orange-400' : 'text-blue-300'}`}
                                        size={24}
                                        x="-12"
                                        y="-12"
                                    />
                                </g>
                            ))}
                        </svg>
                    </div>

                    {/* 목록보기 버튼 */}
                    <button
                        onClick={() => setShowList(!showList)}
                        className="absolute bottom-4 right-4 bg-white rounded-full p-4 shadow-lg text-orange-400 hover:text-orange-500 transition-colors border-2 border-orange-100"
                    >
                        <List size={24} strokeWidth={2.5} />
                    </button>
                </div>
            </div>

            {/* 선택된 동물 미니 카드 */}
            {selectedPet && !showList && (
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white rounded-t-3xl shadow-lg border-t-2 border-orange-100">
                    <div className="flex items-start gap-4">
                        <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-orange-100">
                            <img src={selectedPet.image} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <span className={`text-sm px-3 py-1.5 rounded-full font-medium ${
                                    selectedPet.status === '찾는중' ? 'bg-orange-100 text-orange-500' : 'bg-blue-100 text-blue-500'
                                }`}>
                                    {selectedPet.status}
                                </span>
                                <span className="text-sm text-gray-500">{selectedPet.time}</span>
                            </div>
                            <h3 className="text-lg font-bold text-orange-900 mb-1">
                                {selectedPet.breed} / {selectedPet.age}세 / {selectedPet.gender}
                            </h3>
                            <p className="text-sm text-orange-600 flex items-center gap-1">
                                <MapPin size={14} />
                                {selectedPet.location}
                            </p>
                        </div>
                        <button onClick={() => setSelectedPet(null)} className="text-orange-300 hover:text-orange-400 transition-colors">
                            <X size={24} strokeWidth={2.5} />
                        </button>
                    </div>
                </div>
            )}

            {/* 전체 목록 */}
            {showList && (
                <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-lg z-20 border-t-2 border-orange-100">
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-orange-900 flex items-center gap-2">
                                <Heart size={20} className="text-orange-400" />
                                귀여운 친구들
                            </h3>
                            <button onClick={() => setShowList(false)} className="text-orange-300 hover:text-orange-400 transition-colors">
                                <ChevronUp size={24} strokeWidth={2.5} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            {lostPets.map((pet) => (
                                <div 
                                    key={pet.id}
                                    className="flex items-start gap-4 p-4 bg-orange-50/50 rounded-2xl border-2 border-orange-100 cursor-pointer hover:bg-orange-50 transition-colors"
                                    onClick={() => {
                                        setSelectedPet(pet);
                                        setShowList(false);
                                    }}
                                >
                                    <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-orange-100">
                                        <img src={pet.image} alt="" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`text-sm px-3 py-1.5 rounded-full font-medium ${
                                                pet.status === '찾는중' ? 'bg-orange-100 text-orange-500' : 'bg-blue-100 text-blue-500'
                                            }`}>
                                                {pet.status}
                                            </span>
                                            <span className="text-sm text-gray-500">{pet.time}</span>
                                        </div>
                                        <h3 className="text-lg font-bold text-orange-900 mb-1">
                                            {pet.breed} / {pet.age}세 / {pet.gender}
                                        </h3>
                                        <p className="text-sm text-orange-600 flex items-center gap-1">
                                            <MapPin size={14} />
                                            {pet.location}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MainMapView;