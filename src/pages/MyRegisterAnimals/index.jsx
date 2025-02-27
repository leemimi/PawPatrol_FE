import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const MyRegisteredAnimals = () => {
    const [animals, setAnimals] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMyRegisteredAnimals = async () => {
            try {
                setLoading(true);
                // API URL은 백엔드 API 명세에 맞게 수정 필요
                const response = await fetch('/api/v1/protections/my-registered', {
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
                return 'bg-orange-300 text-white';
            case 'PROTECTION_POSSIBLE':
                return 'bg-red-400 text-white';
            default:
                return 'bg-gray-400 text-white';
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
                <h1 className="text-lg font-medium ml-4">내가 등록한 동물</h1>
            </div>

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
                                            src={`https://kr.object.ncloudstorage.com/paw-patrol/protection/${animal.imageUrl}`}
                                            alt={animal.title}
                                            className="w-full h-full object-cover"
                                        />
                                    )}
                                </div>

                                {/* 정보 */}
                                <div className="ml-3 flex-1 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start">
                                            <h3 className="text-sm font-medium text-gray-800 line-clamp-1">
                                                {animal.title}
                                            </h3>
                                            <div className="flex items-center">
                                                <span className="ml-2 px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-600">
                                                    신청 [{animal.pendingCount || 0}]
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                            {animal.breed || "품종 미상"}
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
        </div>
    );
};

export default MyRegisteredAnimals;