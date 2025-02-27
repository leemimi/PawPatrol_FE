import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const MyApplications = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('ALL');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMyApplications = async () => {
            try {
                setLoading(true);
                // API URL은 백엔드 API 명세에 맞게 수정 필요
                const response = await fetch('/api/v1/protections/my-applications', {
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

        fetchMyApplications();
    }, []);

    // 필터링된 신청 목록
    const filteredApplications = applications.filter(app => {
        if (activeTab === 'ALL') return true;
        return app.status === activeTab;
    });

    const getStatusText = (status) => {
        switch (status) {
            case 'WAITING':
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
            case 'WAITING':
                return 'bg-yellow-100 text-yellow-600';
            case 'APPROVED':
                return 'bg-green-100 text-green-600';
            case 'REJECTED':
                return 'bg-red-100 text-red-600';
            default:
                return 'bg-gray-100 text-gray-600';
        }
    };

    return (
        <div className="max-w-lg mx-auto bg-[#FFF5E6] min-h-screen p-3">
            {/* 헤더 */}
            <div className="bg-[#FFF5E6] p-4 border-b border-orange-100 flex items-center mb-4">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-orange-500 hover:text-orange-600 transition-colors"
                >
                    <ArrowLeft size={18} />
                    <span className="ml-2">돌아가기</span>
                </button>
                <h1 className="text-lg font-medium ml-4">나의 신청 목록</h1>
            </div>

            {/* 탭 필터 */}
            <div className="flex bg-white rounded-full p-1 mb-4 shadow-sm">
                {[
                    { id: 'ALL', text: '전체' },
                    { id: 'WAITING', text: '대기중' },
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
                            key={application.id}
                            className="bg-white rounded-xl overflow-hidden shadow hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => navigate(`/protection/${application.animalCaseId}`)}
                        >
                            <div className="flex p-3">
                                {/* 이미지 */}
                                <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                                    {application.animal?.imageUrl && (
                                        <img
                                            src={`https://kr.object.ncloudstorage.com/paw-patrol/protection/${application.animal.imageUrl}`}
                                            alt={application.animal.title}
                                            className="w-full h-full object-cover"
                                        />
                                    )}
                                </div>

                                {/* 정보 */}
                                <div className="ml-3 flex-1 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start">
                                            <h3 className="text-sm font-medium text-gray-800 line-clamp-1">
                                                {application.animal?.title || "제목 없음"}
                                            </h3>
                                            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(application.status)}`}>
                                                {getStatusText(application.status)}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                            {application.reason || "사유 없음"}
                                        </p>
                                    </div>
                                    <div className="flex justify-between items-center mt-2">
                                        <span className="text-xs text-orange-500">
                                            {application.animal?.breed || "품종 미상"}
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
        </div>
    );
};

export default MyApplications;