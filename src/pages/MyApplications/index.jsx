import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, X } from 'lucide-react';

const MyApplications = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('ALL');
    const navigate = useNavigate();
    const [cancelLoading, setCancelLoading] = useState(false);

    const fetchMyApplications = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/v1/protections/my-protections', {
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
                    setApplications(data.data.content || data.data);
                }
            }
        } catch (error) {
            console.error('데이터 로드 오류:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyApplications();
    }, []);

    // 필터링된 신청 목록
    const filteredApplications = applications.filter(app => {
        if (activeTab === 'ALL') return true;
        return app.protectionStatus === activeTab;
    });

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
                        // 데이터 다시 불러오기
                        fetchMyApplications();
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
                        { id: 'ALL', text: '전체' },
                        { id: 'PENDING', text: '대기중' },
                        { id: 'APPROVED', text: '승인됨' },
                        { id: 'REJECTED', text: '거절됨' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            className={`flex-1 py-2 text-sm rounded-full ${activeTab === tab.id
                                ? 'bg-orange-500 text-white'
                                : 'text-gray-700'
                                }`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {tab.text}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
                    </div>
                ) : filteredApplications.length > 0 ? (
                    <div className="space-y-3">
                        {filteredApplications.map((application) => (
                            <div
                                key={application.protectionId}
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
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-64 p-4">
                        <p className="text-gray-600 text-center">
                            {activeTab === 'ALL'
                                ? '신청 내역이 없습니다.'
                                : `${getStatusText(activeTab)} 상태인 신청 내역이 없습니다.`}
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