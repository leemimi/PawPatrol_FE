import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Home, Clock } from 'lucide-react';
import ApplicationsModal from '../../components/ApplicationsModal';
import StatusBadge from '../../components/StatusBadge';
import InfiniteScroll from '../../components/InfiniteScroll';
import { useMyRegisteredAnimals, useProtectionApplication } from '../../hooks/useProtections';

const MyRegisteredAnimals = () => {
    const navigate = useNavigate();
    const [selectedAnimal, setSelectedAnimal] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // 훅 사용
    const {
        data,
        loading,
        error,
        nextPage,
        resetPage,
        refresh
    } = useMyRegisteredAnimals(0, 10);

    // 기존 상태와 매핑 - 새로운 데이터 구조에 맞게 수정
    const animals = data.content;
    const totalCount = data.totalElements;
    const hasMore = !data.last;

    // 상태별 개수는 API에서 제공
    const memberRole = data.memberRole;
    const waitingCount = data.waitingCount || 0;
    const protectingCount = data.protectingCount || 0;
    const shelterCount = data.shelterCount || 0;

    // 신청 승인/거절 훅
    const {
        approveProtection,
        rejectProtection,
        loading: actionLoading
    } = useProtectionApplication();

    // 페이지 로드 시 스크롤을 최상단으로 이동
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // 보호 유형에 따른 배지 생성
    const getProtectionTypeBadge = (type) => {
        if (type === 'ADOPTION') {
            return (
                <div className="flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-600 rounded-full text-xs">
                    <Home size={12} />
                    <span>입양</span>
                </div>
            );
        } else {
            return (
                <div className="flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-600 rounded-full text-xs">
                    <Clock size={12} />
                    <span>임시보호</span>
                </div>
            );
        }
    };

    // 신청 목록 모달 열기
    const openApplicationsModal = (animal, e) => {
        e.stopPropagation(); // 상위 요소 클릭 이벤트 전파 방지
        setSelectedAnimal(animal);
        setIsModalOpen(true);
    };

    // 임시보호 신청 승인
    const handleApproveProtection = async (protectionId) => {
        try {
            await approveProtection(protectionId);
            alert('신청이 승인되었습니다.');

            // 승인 후 첫 페이지부터 다시 데이터 로드
            resetPage();
            setIsModalOpen(false); // 모달 닫기
        } catch (error) {
            console.error('승인 오류:', error);
            alert('승인 중 오류가 발생했습니다.');
        }
    };

    // 임시보호 신청 거절
    const handleRejectProtection = async (protectionId) => {
        const rejectReason = prompt('거절 사유를 입력해주세요');
        if (rejectReason === null) return; // 취소 버튼 누른 경우

        try {
            await rejectProtection(protectionId, rejectReason);
            alert('신청이 거절되었습니다.');

            // 거절 후 첫 페이지부터 다시 데이터 로드
            resetPage();
            setIsModalOpen(false); // 모달 닫기
        } catch (error) {
            console.error('거절 오류:', error);
            alert('거절 중 오류가 발생했습니다.');
        }
    };

    // 동물 카드 렌더링 함수
    const renderAnimal = (animal, index) => (
        <div
            className="bg-white rounded-xl overflow-hidden shadow hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate(`/protection/${animal.animalCaseId}`)}
        >
            <div className="flex p-3">
                {/* 이미지 */}
                <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                    {animal.imageUrl && (
                        <img
                            src={animal.imageUrl}
                            alt={animal.animalName || animal.title}
                            className="w-full h-full object-cover"
                        />
                    )}
                </div>

                {/* 정보 */}
                <div className="ml-3 flex-1 flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start">
                            <h3 className="text-sm font-medium text-gray-800 line-clamp-1">
                                {animal.animalName || "이름 미정"}
                            </h3>
                            <div
                                className="flex items-center"
                                onClick={(e) => animal.pendingApplicationsCount > 0 ? openApplicationsModal(animal, e) : null}
                            >
                                <span className={`ml-2 px-2 py-1 rounded-full text-xs ${animal.pendingApplicationsCount > 0 ? 'bg-orange-100 text-orange-600 cursor-pointer' : 'bg-gray-100 text-gray-600'}`}>
                                    신청 [{animal.pendingApplicationsCount || 0}]
                                </span>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {animal.title || "제목 없음"}
                        </p>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                        <StatusBadge status={animal.caseStatus} type="protection" />
                        <span className="text-xs text-gray-400">
                            {new Date(animal.createdAt).toLocaleDateString()}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );

    // 로딩 컴포넌트
    const loadingComponent = (
        <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-orange-500"></div>
            <span className="ml-2 text-gray-500">불러오는 중...</span>
        </div>
    );

    // 빈 상태 컴포넌트
    const emptyComponent = (
        <div className="flex flex-col items-center justify-center h-64 p-4">
            <p className="text-gray-600 text-center">
                등록한 동물이 없습니다.
            </p>
            <button
                className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
                onClick={() => navigate('/register-animal')}
            >
                동물 등록하기
            </button>
        </div>
    );

    // 끝 메시지 컴포넌트
    const endMessage = (
        <div className="text-center py-4">
            <span className="text-gray-500">모든 동물을 불러왔습니다.</span>
        </div>
    );

    // 에러 처리
    if (error) {
        return (
            <div className="max-w-lg mx-auto bg-[#FFF5E6] min-h-screen">
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
                                내 동물 목록
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
                            onClick={refresh}
                        >
                            다시 시도
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="max-w-lg mx-auto bg-[#FFF5E6] min-h-screen">
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
                            내 동물 목록
                        </h1>
                    </div>
                </div>
            </header>

            <main className="pt-20 pb-20 px-4">
                {/* 상단 알림 카드 */}
                <div className="mb-6 bg-white rounded-xl p-4 shadow hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">🐾</span>
                        <div>
                            <p className="text-sm text-gray-600 mt-1">
                                총 <span className="text-orange-500 font-semibold">{totalCount}</span>마리의
                                <span className="text-orange-400 font-semibold"> 소중한 친구들</span>을 보호하고 있어요!
                            </p>
                        </div>
                    </div>
                </div>

                {/* 상태 카운트 카드 */}
                <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
                    <div className="flex justify-between">
                        {/* 일반 사용자 (ROLE_USER) 또는 관리자 (ROLE_ADMIN)인 경우 */}
                        {(data.memberRole === 'ROLE_USER' || data.memberRole === 'ROLE_ADMIN') && (
                            <>
                                {/* 신청가능 카운트 */}
                                <div className="flex-1 text-center">
                                    <div className="bg-orange-50 rounded-lg p-2">
                                        <span className="text-sm text-gray-500">신청가능</span>
                                        <p className="text-lg font-semibold text-orange-500">{waitingCount}</p>
                                    </div>
                                </div>

                                <div className="w-4"></div> {/* 간격용 */}

                                {/* 임보중 카운트 */}
                                <div className="flex-1 text-center">
                                    <div className="bg-red-50 rounded-lg p-2">
                                        <span className="text-sm text-gray-500">임보중</span>
                                        <p className="text-lg font-semibold text-red-500">{protectingCount}</p>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* 보호소 (ROLE_SHELTER)인 경우 */}
                        {data.memberRole === 'ROLE_SHELTER' && (
                            <div className="flex-1 text-center">
                                <div className="bg-blue-50 rounded-lg p-2">
                                    <span className="text-sm text-gray-500">보호소</span>
                                    <p className="text-lg font-semibold text-blue-500">{shelterCount}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {loading && animals.length === 0 ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
                    </div>
                ) : (
                    <InfiniteScroll
                        items={animals}
                        hasMore={hasMore}
                        loading={loading && animals.length > 0}
                        loadMore={nextPage}
                        renderItem={renderAnimal}
                        loadingComponent={loadingComponent}
                        emptyComponent={emptyComponent}
                        endMessage={endMessage}
                    />
                )}
            </main>

            {/* 신청 목록 모달 */}
            <ApplicationsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                applications={selectedAnimal?.pendingProtections || []}
                onApprove={handleApproveProtection}
                onReject={handleRejectProtection}
                title={`대기 중인 신청`}
            />
        </div>
    );
};

export default MyRegisteredAnimals;