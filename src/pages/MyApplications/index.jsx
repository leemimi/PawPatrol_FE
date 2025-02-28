import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, X } from 'lucide-react';

const MyApplications = () => {
    const [applications, setApplications] = useState([]);
    const [allApplications, setAllApplications] = useState([]); // 전체 신청 데이터 저장
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('PENDING'); // 기본값을 대기중으로 변경
    const navigate = useNavigate();
    const [cancelLoading, setCancelLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const observerRef = useRef();
    const [pendingCount, setPendingCount] = useState(0);
    const [approvedCount, setApprovedCount] = useState(0);
    const [rejectedCount, setRejectedCount] = useState(0);

    // 마지막 아이템 참조 콜백
    const lastApplicationRef = useCallback(node => {
        if (loading) return;
        if (observerRef.current) observerRef.current.disconnect();

        observerRef.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                console.log(`마지막 아이템에 도달했습니다. 페이지 ${page + 1} 로드 시작`);
                setPage(prevPage => prevPage + 1);
            }
        });

        if (node) observerRef.current.observe(node);
    }, [loading, hasMore]);

    // 탭 변경 시 필터링된 데이터 설정
    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        // 탭 변경 시 현재 로드된 전체 데이터에서 필터링만 수행
        filterApplicationsByTab(tabId);
    };

    // 상태별로 데이터 필터링
    const filterApplicationsByTab = (tabId) => {
        if (allApplications.length === 0) return;

        const filtered = allApplications.filter(app => app.protectionStatus === tabId);
        setApplications(filtered);
        setHasMore(false); // 필터링된 데이터는 이미 모두 불러온 상태이므로 더 로드할 필요 없음
    };

    const fetchMyApplications = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/v1/protections/my-protections?page=${page}&size=10`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log('내 신청 목록 데이터:', data);
                if (data.resultCode === "200") {
                    const newApplications = data.data.content || [];

                    // 데이터가 없으면 더 이상 불러올 항목이 없음
                    if (newApplications.length === 0) {
                        setHasMore(false);
                        console.log('더 이상 로드할 데이터가 없습니다');
                        return;
                    }

                    // 전체 데이터 관리
                    if (page === 0) {
                        setAllApplications(newApplications);
                    } else {
                        setAllApplications(prev => [...prev, ...newApplications]);
                    }

                    // 현재 탭에 맞는 필터링된 데이터 설정
                    const updatedAllApplications = page === 0
                        ? newApplications
                        : [...allApplications, ...newApplications];

                    // 각 상태별 항목 수 계산
                    calculateStatusCounts(updatedAllApplications);

                    // 현재 활성 탭에 맞는 데이터만 필터링
                    const filteredApps = updatedAllApplications.filter(
                        app => app.protectionStatus === activeTab
                    );

                    // 필터링된 데이터 설정
                    if (page === 0) {
                        setApplications(filteredApps);
                    } else {
                        // 이미 필터링된 데이터에 새로운 필터링된 데이터 추가
                        const existingIds = new Set(applications.map(app => app.protectionId));
                        const newFilteredApps = filteredApps.filter(
                            app => !existingIds.has(app.protectionId)
                        );
                        setApplications(prev => [...prev, ...newFilteredApps]);
                    }

                    // 더 로드할 데이터가 있는지 확인
                    const isLastPage = data.data.last || newApplications.length < 10;
                    setHasMore(!isLastPage);
                }
            }
        } catch (error) {
            console.error('데이터 로드 오류:', error);
        } finally {
            setLoading(false);
        }
    };

    // 각 상태별 개수 계산
    const calculateStatusCounts = (apps) => {
        const pending = apps.filter(app => app.protectionStatus === 'PENDING').length;
        const approved = apps.filter(app => app.protectionStatus === 'APPROVED').length;
        const rejected = apps.filter(app => app.protectionStatus === 'REJECTED').length;

        setPendingCount(pending);
        setApprovedCount(approved);
        setRejectedCount(rejected);
    };

    // 페이지 로드 시 스크롤을 최상단으로 이동
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // 페이지가 변경될 때마다 데이터 가져오기
    useEffect(() => {
        fetchMyApplications();
    }, [page]);

    const getStatusText = (status) => {
        switch (status) {
            case 'PENDING':
                return '대기중';
            case 'APPROVED':
                return '승인됨';
            case 'REJECTED':
                return '거절됨';
            default:
                return status;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-600';
            case 'APPROVED':
                return 'bg-green-100 text-green-600';
            case 'REJECTED':
                return 'bg-red-100 text-red-600';
            default:
                return 'bg-gray-100 text-gray-600';
        }
    };

    const handleCancelApplication = async (e, protectionId) => {
        e.stopPropagation(); // 상위 요소 클릭 이벤트 전파 방지

        if (window.confirm('신청을 취소하시겠습니까?')) {
            try {
                setCancelLoading(true);
                const response = await fetch(`/api/v1/protections/${protectionId}`, {
                    method: 'DELETE',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.resultCode === "200") {
                        alert('신청이 취소되었습니다.');
                        // 데이터 다시 불러오기 (첫 페이지부터)
                        setPage(0);
                        setApplications([]);
                        setAllApplications([]);
                        setHasMore(true);
                    } else {
                        alert('취소 중 오류가 발생했습니다: ' + data.message);
                    }
                } else {
                    alert('취소 중 오류가 발생했습니다.');
                }
            } catch (error) {
                console.error('취소 오류:', error);
                alert('취소 중 오류가 발생했습니다.');
            } finally {
                setCancelLoading(false);
            }
        }
    };

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
                            나의 신청 목록
                        </h1>
                    </div>
                </div>
            </header>

            <main className="pt-20 pb-20 px-4">
                {/* 탭 필터 */}
                <div className="flex bg-white rounded-full p-1 mb-4 shadow-sm">
                    {[
                        { id: 'PENDING', text: `대기중 (${pendingCount})` },
                        { id: 'APPROVED', text: `승인됨 (${approvedCount})` },
                        { id: 'REJECTED', text: `거절됨 (${rejectedCount})` }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            className={`flex-1 py-2 text-sm rounded-full ${activeTab === tab.id
                                ? 'bg-orange-500 text-white'
                                : 'text-gray-700'
                                }`}
                            onClick={() => handleTabChange(tab.id)}
                        >
                            {tab.text}
                        </button>
                    ))}
                </div>

                {loading && page === 0 ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
                    </div>
                ) : applications.length > 0 ? (
                    <div className="space-y-3">
                        {applications.map((application, index) => (
                            <div
                                key={application.protectionId}
                                ref={index === applications.length - 1 ? lastApplicationRef : null}
                                className="bg-white rounded-xl overflow-hidden shadow hover:shadow-md transition-shadow cursor-pointer"
                                onClick={() => navigate(`/protection/${application.animalCaseId}`)}
                            >
                                <div className="flex p-3">
                                    {/* 이미지 */}
                                    <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 mr-3">
                                        {application.imageUrl && (
                                            <img
                                                src={application.imageUrl}
                                                alt={application.animalName}
                                                className="w-full h-full object-cover"
                                            />
                                        )}
                                    </div>

                                    {/* 정보 */}
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start">
                                                <h3 className="text-sm font-medium text-gray-800 line-clamp-1">
                                                    {application.animalName || "이름 없음"}
                                                </h3>
                                                <div className="flex items-center gap-2">
                                                    {application.protectionStatus === 'PENDING' && (
                                                        <button
                                                            className="flex items-center gap-1 px-2 py-1 bg-red-500 text-white text-xs rounded-full hover:bg-red-600 transition-colors"
                                                            onClick={(e) => handleCancelApplication(e, application.protectionId)}
                                                            disabled={cancelLoading}
                                                        >
                                                            <X size={12} />
                                                            취소
                                                        </button>
                                                    )}
                                                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(application.protectionStatus)}`}>
                                                        {getStatusText(application.protectionStatus)}
                                                    </span>
                                                </div>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                                {application.reason || "사유 없음"}
                                            </p>
                                            {application.rejectReason && (
                                                <p className="text-xs text-red-500 mt-1 line-clamp-2">
                                                    거절 사유: {application.rejectReason}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex justify-between items-center mt-2">
                                            <span className="text-xs text-orange-500">
                                                신청자: {application.applicantName || "이름 없음"}
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                {new Date(application.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* 로딩 인디케이터 (첫 페이지 로딩이 아닌 경우) */}
                        {loading && page > 0 && (
                            <div className="text-center py-4">
                                <div className="inline-block animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-orange-500"></div>
                                <span className="ml-2 text-gray-500">불러오는 중...</span>
                            </div>
                        )}

                        {/* 더 이상 데이터가 없는 경우 */}
                        {!hasMore && applications.length > 0 && (
                            <div className="text-center py-4">
                                <span className="text-gray-500">모든 신청 내역을 불러왔습니다.</span>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-64 p-4">
                        <p className="text-gray-600 text-center">
                            {`${getStatusText(activeTab)} 상태인 신청 내역이 없습니다.`}
                        </p>
                        <button
                            className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
                            onClick={() => navigate('/protection')}
                        >
                            동물 목록 보기
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default MyApplications;