import { useState } from 'react';
import { MapPin, ChevronRight, Search, MessageSquare, ChevronDown, Share, Dog, Cat, ChevronLeft, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import defaultImage from '../assets/images/default.png';
import { useAuthStore } from '../stores/useAuthStore';
import { lostPets, petSightings, petStatistics } from './petMockData';

const getProfileImage = (userInfo) => {
    if (!userInfo) return defaultImage;
    if (!userInfo.profileImageUrl) return defaultImage;

    if (userInfo.profileImageUrl.startsWith('https://')) {
        return userInfo.profileImageUrl;
    }

    return `${import.meta.env.VITE_NCP_STORAGE_URL}/${userInfo.profileImageUrl}`;
};

const Main = () => {
    const navigate = useNavigate();
    const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
    const userInfo = useAuthStore((state) => state.userInfo?.data);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    const currentPet = lostPets[0];
    const notifications = petSightings.map(sight => sight.location);

    return (
        <div className="h-screen w-full bg-dark text-white relative overflow-hidden">
            {/* Top Navigation */}
            <div className="fixed top-0 left-0 right-0 z-20 bg-zinc-900 px-4 py-3 flex items-center justify-between">
                <button onClick={() => setIsMenuOpen(true)} className="p-2">
                    <Menu size={24} />
                </button>
                <h1 className="text-lg font-semibold">실종 반려동물</h1>
                <button className="p-2">
                    <Search size={24} />
                </button>
            </div>

            {/* Slide-in Menu */}
            <div className={`fixed inset-0 z-30 transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}>
                <div className="w-4/5 h-full bg-zinc-900 p-6">
                    <div className="flex items-center gap-3 mb-8">
                        {isLoggedIn && userInfo ? (
                            <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden">
                                <img
                                    src={getProfileImage(userInfo)}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ) : (
                            <button
                                onClick={() => navigate('/login')}
                                className="w-10 h-10 rounded-full bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors"
                            >
                                로그인
                            </button>
                        )}
                        <h2 className="text-xl font-semibold">실종 반려동물</h2>
                        <button onClick={() => setIsMenuOpen(false)} className="ml-auto p-2">
                            <X size={24} />
                        </button>
                    </div>

                    <nav className="space-y-6">
                        <div className="space-y-2">
                            <button className="w-full flex items-center gap-3 p-3 bg-zinc-800 rounded-lg">
                                <MapPin size={20} />
                                <span>위치</span>
                                <ChevronRight className="ml-auto" size={18} />
                            </button>
                            <button className="w-full flex items-center gap-3 p-3 text-gray-400">
                                <MessageSquare size={20} />
                                <span>신고하기</span>
                            </button>
                            <button className="w-full flex items-center gap-3 p-3 text-gray-400">
                                <MessageSquare size={20} />
                                <span>제보하기</span>
                            </button>
                            <button className="w-full flex items-center gap-3 p-3 text-gray-400">
                                <MessageSquare size={20} />
                                <span>반려동물 등록</span>
                            </button>
                            <button className="w-full flex items-center gap-3 p-3 text-gray-400">
                                <MessageSquare size={20} />
                                <span>이동 경로</span>
                            </button>
                        </div>

                        <div className="space-y-2">
                            <button className="w-full flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                                <span>목격 신고 정렬</span>
                                <ChevronDown size={18} />
                            </button>
                            <div className="ml-4 flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full overflow-hidden">
                                    <img src="/api/placeholder/32/32" alt="Profile" className="w-full h-full object-cover" />
                                </div>
                                <div className="text-sm">
                                    <p>김철수님의</p>
                                    <p className="text-gray-400">목격 제보</p>
                                </div>
                            </div>
                        </div>
                    </nav>
                </div>
                <div className="w-1/5 h-full bg-black/50" onClick={() => setIsMenuOpen(false)} />
            </div>

            {/* 나머지 코드는 동일하게 유지 */}
            {/* Main Map Area */}
            <div className="h-full w-full bg-gray-900 pt-16">
                {/* Map Overlay */}
                <div className="absolute top-20 left-4 z-10 bg-dark-light/90 p-4 rounded-xl max-w-md">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden">
                            <img src="/api/placeholder/40/40" alt="" className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">찾는 중</p>
                            <div className="flex items-center gap-2">
                                <span className="text-primary">{petStatistics.totalCases}</span>
                                <h2 className="text-xl font-bold">실종 반려동물</h2>
                            </div>
                        </div>
                    </div>
                </div>
                <img src="/api/placeholder/600/800" alt="Map" className="w-full h-full object-cover" />
            </div>

            {/* Bottom Info Panel */}
            <div className="fixed bottom-0 left-0 right-0 bg-zinc-900 p-4 rounded-t-3xl">
                <div className="flex justify-between items-center mb-4">
                    {/* User Info */}
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-700 overflow-hidden">
                            <img src={getProfileImage(userInfo)} alt="사용자" className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">{userInfo?.nickname || '사용자'}</p>
                            <p className="font-bold">실종견 보호자</p>
                        </div>
                    </div>

                    {/* Pet Info */}
                    <button
                        className="flex items-center gap-3"
                        onClick={() => setIsDetailOpen(true)}
                    >
                        <div className="w-8 h-8 rounded-full bg-gray-700 overflow-hidden">
                            <img src="/api/placeholder/32/32" alt="반려동물" className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">{currentPet.name}</p>
                            <p className="font-bold">{currentPet.breed} {currentPet.age}세</p>
                        </div>
                    </button>
                </div>

                <button className="w-full bg-orange-500 hover:bg-orange-600 py-3 rounded-lg font-medium transition-colors">
                    긴급 제보하기
                </button>
            </div>

            {/* Detail Slide-up Panel */}
            <div className={`fixed inset-0 z-40 transform ${isDetailOpen ? 'translate-y-0' : 'translate-y-full'} transition-transform duration-300 ease-in-out`}>
                <div className="absolute inset-0 bg-zinc-900">
                    <div className="flex items-center justify-between p-4 border-b border-gray-800">
                        <button onClick={() => setIsDetailOpen(false)}>
                            <ChevronLeft size={24} />
                        </button>
                        <h2 className="text-lg font-semibold">실종 상세정보</h2>
                        <button>
                            <Share size={24} />
                        </button>
                    </div>

                    <div className="p-4 space-y-6 overflow-y-auto h-[calc(100%-64px)]">
                        <div className="bg-white rounded-xl p-4 text-black">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold">실종 반려동물</h3>
                                    <p className="text-sm text-orange-500">{currentPet.status}</p>
                                </div>
                                <div className="w-10 h-10 bg-orange-400 rounded-full flex items-center justify-center">
                                    {currentPet.type === '강아지' ? (
                                        <Dog size={20} className="text-white" />
                                    ) : (
                                        <Cat size={20} className="text-white" />
                                    )}
                                </div>
                            </div>
                            <div className="mt-2 text-sm text-gray-600">
                                <p>{currentPet.lastSeen.location} 인근 목격 제보</p>
                                <p>실종시각: {currentPet.lastSeen.time}</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            {petSightings.map((sight) => (
                                <div key={sight.id} className="p-3 bg-zinc-800 rounded-lg flex items-center gap-2">
                                    <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                                    <span className="text-sm">{sight.location}</span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 aspect-square bg-orange-100 rounded-xl overflow-hidden">
                            <img src="/api/placeholder/320/320" alt="실종된 반려동물" className="w-full h-full object-cover" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Main;