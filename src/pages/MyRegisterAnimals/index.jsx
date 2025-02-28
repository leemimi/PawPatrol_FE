import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, X, Check } from 'lucide-react';

const MyRegisteredAnimals = () => {
    const [animals, setAnimals] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [selectedAnimal, setSelectedAnimal] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchMyRegisteredAnimals = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/v1/protections/my-cases', {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log('내가 등록한 동물 데이터:', data);
                    if (data.resultCode === "200") {
                        setAnimals(data.data.content || data.data);
                    }
                }
            } catch (error) {
                console.error('데이터 로드 오류:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMyRegisteredAnimals();
    }, []);

    const getStatusText = (status) => {
        switch (status) {
            case 'PROTECT_WAITING':
                return '신청가능';
            case 'TEMP_PROTECTING':
                return '임보중';
            default:
                return status;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'PROTECT_WAITING':
                return 'bg-yellow-400 text-white';
            case 'TEMP_PROTECTING':
                return 'bg-red-400 text-white';
            case 'PROTECTION_POSSIBLE':
                return 'bg-red-400 text-white';
            default:
                return 'bg-gray-400 text-white';
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
            const response = await fetch(`/api/v1/protections/${protectionId}/accept`, {
                method: 'PATCH',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.resultCode === "200") {
                    alert('신청이 승인되었습니다.');

                    // 승인 후 동물 목록 다시 불러오기
                    const updatedResponse = await fetch('/api/v1/protections/my-cases', {
                        method: 'GET',
                        credentials: 'include',
                        headers: {
                            'Content-Type': 'application/json',
                        }
                    });

                    if (updatedResponse.ok) {
                        const updatedData = await updatedResponse.json();
                        if (updatedData.resultCode === "200") {
                            setAnimals(updatedData.data.content || updatedData.data);
                        }
                    }

                    setIsModalOpen(false); // 모달 닫기
                } else {
                    alert('승인 중 오류가 발생했습니다: ' + data.message);
                }
            } else {
                alert('승인 중 오류가 발생했습니다.');
            }
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
            const response = await fetch(`/api/v1/protections/${protectionId}/reject`, {
                method: 'PATCH',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    rejectReason: rejectReason
                })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.resultCode === "200") {
                    alert('신청이 거절되었습니다.');

                    // 거절 후 동물 목록 다시 불러오기
                    const updatedResponse = await fetch('/api/v1/protections/my-cases', {
                        method: 'GET',
                        credentials: 'include',
                        headers: {
                            'Content-Type': 'application/json',
                        }
                    });

                    if (updatedResponse.ok) {
                        const updatedData = await updatedResponse.json();
                        if (updatedData.resultCode === "200") {
                            setAnimals(updatedData.data.content || updatedData.data);
                        }
                    }

                    setIsModalOpen(false); // 모달 닫기
                } else {
                    alert('거절 중 오류가 발생했습니다: ' + data.message);
                }
            } else {
                alert('거절 중 오류가 발생했습니다.');
            }
        } catch (error) {
            console.error('거절 오류:', error);
            alert('거절 중 오류가 발생했습니다.');
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
                            내 동물 목록
                        </h1>
                    </div>
                </div>
            </header>

            <main className="pt-20 pb-20 px-4">
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
                    </div>
                ) : animals.length > 0 ? (
                    <div className="space-y-3">
                        {animals.map((animal) => (
                            <div
                                key={animal.animalCaseId}
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
                                            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(animal.caseStatus)}`}>
                                                {getStatusText(animal.caseStatus)}
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                {new Date(animal.createdAt).toLocaleDateString()}
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
                            등록한 동물이 없습니다.
                        </p>
                        <button
                            className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
                            onClick={() => navigate('/register-animal')}
                        >
                            동물 등록하기
                        </button>
                    </div>
                )}
            </main>

            {/* 신청 목록 모달 */}
            {isModalOpen && selectedAnimal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-5 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium">신청 목록</h3>
                            <button
                                className="text-gray-500 hover:text-gray-700"
                                onClick={() => setIsModalOpen(false)}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {selectedAnimal.pendingProtections && selectedAnimal.pendingProtections.length > 0 ? (
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {selectedAnimal.pendingProtections.map((application, index) => (
                                    <div key={index} className="bg-orange-50 p-3 rounded-lg">
                                        <div className="flex justify-between">
                                            <span className="font-medium text-gray-700">{application.applicantName}</span>
                                            <span className="text-xs text-gray-500">
                                                {new Date(application.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1">{application.reason}</p>
                                        <div className="flex gap-2 mt-2">
                                            <button
                                                className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white text-xs rounded-md hover:bg-green-600 transition-colors"
                                                onClick={() => handleApproveProtection(application.protectionId)}
                                            >
                                                <Check size={14} />
                                                수락
                                            </button>
                                            <button
                                                className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white text-xs rounded-md hover:bg-red-600 transition-colors"
                                                onClick={() => handleRejectProtection(application.protectionId)}
                                            >
                                                <X size={14} />
                                                거절
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-gray-500 py-4">신청 내역이 없습니다.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyRegisteredAnimals;