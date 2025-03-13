import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, MapPin, Phone, ChevronLeft, MessageCircle } from 'lucide-react';
import AnimalCaseList from '../components/AnimalCaseList';
import useShelterAnimalCases from '../hooks/UseShelterAnimalCases';
import axios from 'axios';

const ShelterAnimalList = () => {
    const { shelterId } = useParams();
    const navigate = useNavigate();
    const [currentUserId, setCurrentUserId] = useState(null);
    const [isShelterManager, setIsShelterManager] = useState(false);

    const {
        shelterInfo,
        animalCases,
        loading,
        error,
        nextPage
    } = useShelterAnimalCases(shelterId);

    // 현재 유저 정보 가져오기
    useEffect(() => {
        if (!shelterId) return;

        const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {};
        if (userInfo.email) {
            axios.get(`${import.meta.env.VITE_CORE_API_BASE_URL}/api/v2/auth/me`, { withCredentials: true })
                .then(response => {
                    if (response.data?.data) {
                        const userId = response.data.data.id;
                        setCurrentUserId(userId);
                    }
                })
                .catch(error => console.error("Error fetching current user data:", error));
        }
    }, [shelterId]);

    // 현재 로그인한 사용자가 보호소 관리자인지 확인
    useEffect(() => {
        if (shelterInfo && currentUserId !== null) {
            setIsShelterManager(Number(shelterInfo.shelterMemberId) === Number(currentUserId));
        }
    }, [shelterInfo, currentUserId]);

    // 채팅 시작 핸들러
    const handleStartChat = () => {
        if (!shelterInfo || !shelterInfo.shelterName) {
            alert('보호소 정보를 불러올 수 없습니다.');
            return;
        }

        sessionStorage.setItem('chatTarget', JSON.stringify({
            userId: shelterInfo.shelterMemberId,
            nickname: shelterInfo.shelterName,
            postId: shelterId,
            postTitle: `${shelterInfo.shelterName} 보호소 문의`,
            type: 'LOSTFOUND'
        }));

        navigate('/chat');
    };

    // 페이지 로드 시 스크롤을 최상단으로 이동
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // 에러 처리
    if (error) {
        return (
            <div className="max-w-lg mx-auto bg-orange-100 min-h-screen">
                <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-10">
                    <div className="flex items-center justify-between px-4 py-3">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => navigate(-1)}
                                className="p-1 text-orange-400 hover:text-orange-500 transition-colors"
                            >
                                <ChevronLeft size={24} strokeWidth={2.5} />
                            </button>
                            <h1 className="text-lg font-bold text-orange-900">
                                보호소 동물 목록
                            </h1>
                        </div>
                    </div>
                </header>

                <main className="pt-20 pb-20 px-4">
                    <div className="flex flex-col items-center justify-center h-64 p-4">
                        <p className="text-red-600 text-center">
                            데이터를 불러오는 중 오류가 발생했습니다.
                        </p>
                        <button
                            className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg"
                            onClick={() => window.location.reload()}
                        >
                            다시 시도
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="max-w-lg mx-auto bg-orange-100 min-h-screen">
            {/* 헤더 */}
            <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-10">
                <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-1 text-orange-400 hover:text-orange-500 transition-colors"
                        >
                            <ChevronLeft size={24} strokeWidth={2.5} />
                        </button>
                        <h1 className="text-lg font-bold text-orange-900">
                            보호소 동물 목록
                        </h1>
                    </div>
                </div>
            </header>

            <main className="pt-20 pb-20 px-4">
                {/* 보호소 정보 카드 */}
                <div className="mb-4 bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow">
                    {loading && !shelterInfo.shelterName ? (
                        <div className="animate-pulse flex flex-col gap-2">
                            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-4 bg-gray-200 rounded w-full"></div>
                            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                            <div className="h-16 bg-gray-200 rounded w-full mt-2"></div>
                        </div>
                    ) : (
                        <>
                            <h1 className="text-xl font-bold text-amber-800 mb-2">{shelterInfo.shelterName}</h1>

                            <div className="flex flex-col gap-2 text-amber-700">
                                {shelterInfo.shelterAddress && (
                                    <div className="flex items-start gap-2">
                                        <MapPin size={18} className="text-amber-600 mt-0.5" />
                                        <span>{shelterInfo.shelterAddress}</span>
                                    </div>
                                )}

                                {shelterInfo.shelterTel && (
                                    <div className="flex items-start gap-2">
                                        <Phone size={18} className="text-amber-600 mt-0.5" />
                                        <span>{shelterInfo.shelterTel}</span>
                                    </div>
                                )}

                                {shelterInfo.operatingHours && shelterInfo.operatingHours.weekdayTime && (
                                    <div className="flex items-start gap-2">
                                        <Clock size={18} className="text-amber-600 mt-0.5" />
                                        <span>{shelterInfo.operatingHours.weekdayTime}</span>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                <div className="flex flex-col text-amber-700 pb-4">
                    {/* 채팅 버튼 - 보호소 관리자가 아닌 경우에만 표시 */}
                    {!isShelterManager && currentUserId && (
                        <button
                            onClick={handleStartChat}
                            className="w-full mt-4 py-2 bg-orange-500 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-orange-600 transition-colors"
                        >
                            <MessageCircle size={20} />
                            <span>보호소에 문의하기</span>
                        </button>
                    )}
                </div>

                {/* 동물 목록 - 공통 컴포넌트 사용 */}
                <div className="grid grid-cols-2 gap-3">
                    <AnimalCaseList
                        animals={animalCases.content || []}
                        hasMore={!animalCases.last}
                        loading={loading}
                        nextPage={nextPage}
                        detailPath="/protection"
                        emptyMessage="이 보호소에 등록된 동물이 없습니다."
                    />
                </div>
            </main>
        </div>
    );
};

export default ShelterAnimalList;