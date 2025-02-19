import React, { useState } from 'react';
import { MapPin, ChevronLeft, Search, MessageSquare, Share, Dog, Menu, X, ArrowRight } from 'lucide-react';

const MainMapView = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [selectedRange, setSelectedRange] = useState(3); // km 단위
    const [viewMode, setViewMode] = useState('map'); // 'map' or 'similar'
    const [selectedPet, setSelectedPet] = useState(null);
    const [showReportDetail, setShowReportDetail] = useState(false);

    // 샘플 데이터
    const similarPets = [
        { id: 1, similarity: 95, image: '/api/placeholder/120/120', location: '서울시 강남구', date: '2024.02.19' },
        { id: 2, similarity: 88, image: '/api/placeholder/120/120', location: '서울시 서초구', date: '2024.02.18' },
        { id: 3, similarity: 82, image: '/api/placeholder/120/120', location: '서울시 송파구', date: '2024.02.17' },
    ];

    const recentReports = [
        { id: 1, type: '목격', location: '카페 앞', time: '10분 전', description: '리드줄 착용' },
        { id: 2, type: '목격', location: '공원', time: '1시간 전', description: '주민이 임시보호 중' },
        { id: 3, type: '실종', location: '아파트 단지', time: '2시간 전', description: '초기 실종 신고' },
    ];

    return (
        <div className="h-screen w-full bg-white relative overflow-hidden">
            {/* Header */}
            <div className="fixed top-0 left-0 right-0 z-20 bg-white px-4 py-3 flex items-center justify-between border-b">
                <button onClick={() => setIsMenuOpen(true)} className="p-2">
                    <Menu size={24} />
                </button>
                <div className="flex gap-4">
                    <button 
                        onClick={() => setViewMode('map')}
                        className={`text-sm font-medium ${viewMode === 'map' ? 'text-orange-500' : 'text-gray-400'}`}
                    >
                        지도로 보기
                    </button>
                    <button 
                        onClick={() => setViewMode('similar')}
                        className={`text-sm font-medium ${viewMode === 'similar' ? 'text-orange-500' : 'text-gray-400'}`}
                    >
                        유사한 강아지
                    </button>
                </div>
                <button className="p-2">
                    <Search size={24} />
                </button>
            </div>

            {/* Main Content */}
            <div className="pt-14 h-full">
                {viewMode === 'map' ? (
                    /* 지도 뷰 */
                    <div className="relative h-full">
                        <img src="/api/placeholder/600/800" alt="Map" className="w-full h-full object-cover" />
                        
                        {/* 범위 설정 */}
                        <div className="absolute top-4 left-4 right-4 bg-white rounded-lg shadow-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-500">검색 반경</p>
                                <p className="text-sm font-medium">{selectedRange}km</p>
                            </div>
                            <input
                                type="range"
                                min="1"
                                max="10"
                                value={selectedRange}
                                onChange={(e) => setSelectedRange(Number(e.target.value))}
                                className="w-full"
                            />
                        </div>

                        {/* 실종 동물 목록 */}
                        <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-lg">
                            <div className="p-4 border-b">
                                <h3 className="font-medium">현재 위치 기준 {selectedRange}km 이내 실종 동물</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <div className="flex p-4 gap-4">
                                    {[1,2,3,4].map((item) => (
                                        <div 
                                            key={item}
                                            className="flex-shrink-0 w-40 cursor-pointer"
                                            onClick={() => setSelectedPet(item)}
                                        >
                                            <div className="w-40 h-40 rounded-lg overflow-hidden mb-2">
                                                <img 
                                                    src="/api/placeholder/160/160" 
                                                    alt="" 
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <p className="text-sm font-medium">말티즈 / 2세</p>
                                            <p className="text-xs text-gray-500">500m • 1시간 전</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* 유사도 기반 검색 결과 */
                    <div className="p-4">
                        <div className="mb-6">
                            <h3 className="font-medium mb-2">내 강아지와 유사한 실종 동물</h3>
                            <p className="text-sm text-gray-500">AI가 분석한 이미지 유사도 기준</p>
                        </div>
                        <div className="space-y-4">
                            {similarPets.map((pet) => (
                                <div key={pet.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                                    <div className="w-20 h-20 rounded-lg overflow-hidden">
                                        <img src={pet.image} alt="" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-orange-500 font-medium">{pet.similarity}% 일치</span>
                                            <span className="text-sm text-gray-500">{pet.date}</span>
                                        </div>
                                        <p className="text-sm">{pet.location}</p>
                                    </div>
                                    <ArrowRight size={20} className="text-gray-400" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* 실종견 상세 보고 모달 */}
            {selectedPet && (
                <div className="fixed inset-0 bg-black/50 z-30">
                    <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl">
                        <div className="p-4 border-b">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-medium">실종견 상세 정보</h3>
                                <button onClick={() => setSelectedPet(null)}>
                                    <X size={24} />
                                </button>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-24 h-24 rounded-lg overflow-hidden">
                                    <img src="/api/placeholder/96/96" alt="" className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <h4 className="font-medium mb-1">말티즈 / 2세 / 수컷</h4>
                                    <p className="text-sm text-gray-500">실종 위치: 서울시 강남구</p>
                                    <p className="text-sm text-gray-500">실종 시간: 2024.02.19 14:30</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-4">
                            <h4 className="font-medium mb-3">최근 제보 내역</h4>
                            <div className="space-y-3">
                                {recentReports.map((report) => (
                                    <div key={report.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <div className="w-2 h-2 bg-orange-500 rounded-full" />
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-sm font-medium">{report.type}</span>
                                                <span className="text-xs text-gray-500">{report.time}</span>
                                            </div>
                                            <p className="text-sm text-gray-600">{report.location} • {report.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MainMapView;