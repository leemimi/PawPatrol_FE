import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';

const AnimalDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [animalData, setAnimalData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);

    useEffect(() => {
        const fetchAnimalDetail = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/v1/protections/${id}`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log("상세 정보:", data);
                    if (data.resultCode === "200") {
                        setAnimalData(data.data);
                    }
                }
            } catch (error) {
                console.error('상세 정보 로드 오류:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnimalDetail();
    }, [id]);

    const getSizeText = (size) => {
        switch (size) {
            case 'SMALL': return '소형';
            case 'MEDIUM': return '중형';
            case 'LARGE': return '대형';
            default: return size;
        }
    };

    return (
        <div className="max-w-lg mx-auto bg-[#FFF5E6] min-h-screen">
            {/* 뒤로가기 헤더 */}
            <div className="bg-[#FFF5E6] p-4 border-b border-orange-100 flex items-center">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-orange-500 hover:text-orange-600 transition-colors"
                >
                    <ArrowLeft size={18} />
                    <span className="ml-2">돌아가기</span>
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
                </div>
            ) : animalData ? (
                <div className="p-4">
                    <div className="bg-white rounded-xl overflow-hidden shadow-md">
                        {/* 헤더 섹션 */}
                        <div className="p-4 flex justify-between items-center border-b border-gray-100">
                            <h2 className="text-lg font-medium text-gray-800">기본 정보</h2>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${animalData.animalCaseDetail.caseStatus === 'PROTECT_WAITING'
                                ? 'bg-yellow-400 text-white'
                                : 'bg-orange-300 text-white'
                                }`}>
                                {animalData.animalCaseDetail.caseStatus === 'PROTECT_WAITING' ? '신청가능' : '임보중'}
                            </span>
                        </div>

                        {/* 사진 영역 */}
                        <div className="relative">
                            <div className="h-80 overflow-hidden">
                                {animalData.animalCaseDetail.animalInfo.imageUrl && (
                                    <img
                                        src={`https://kr.object.ncloudstorage.com/paw-patrol/protection/${animalData.animalCaseDetail.animalInfo.imageUrl}`}
                                        alt="동물 사진"
                                        className="w-full h-full object-cover"
                                    />
                                )}
                            </div>
                        </div>

                        {/* 주요 정보 섹션 */}
                        <div className="p-5 space-y-4">
                            {/* 주요 정보 - 오렌지색 배경 적용 */}
                            <div className="bg-orange-50 rounded-lg p-4 space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-orange-500 text-sm">이름</span>
                                    <span className="text-gray-800 text-sm">
                                        {animalData.animalCaseDetail.animalInfo.name || "미정"}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-orange-500 text-sm">품종</span>
                                    <span className="text-gray-800 text-sm">{animalData.animalCaseDetail.animalInfo.breed}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-orange-500 text-sm">나이</span>
                                    <span className="text-gray-800 text-sm">{animalData.animalCaseDetail.animalInfo.age}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-orange-500 text-sm">크기</span>
                                    <span className="text-gray-800 text-sm">{getSizeText(animalData.animalCaseDetail.animalInfo.size)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-orange-500 text-sm">성별</span>
                                    <span className="text-gray-800 text-sm">
                                        {animalData.animalCaseDetail.animalInfo.gender === 'M' ? '남아' : '여아'}
                                    </span>
                                </div>
                            </div>

                            {/* 건강 상태 - 파란색 배경 적용 */}
                            <div className="bg-blue-50 rounded-lg p-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-blue-500 text-sm">건강상태</span>
                                    <span className="text-gray-800 text-sm">{animalData.animalCaseDetail.animalInfo.healthCondition}</span>
                                </div>
                            </div>

                            {/* 특징 태그 영역 */}
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {animalData.animalCaseDetail.animalInfo.feature.split(',').map((feature, index) => (
                                        <span
                                            key={index}
                                            className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-xs"
                                        >
                                            {feature.trim()}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* 현재 보호자 정보 */}
                        {animalData.animalCaseDetail.currentFosterName && (
                            <div className="px-5 py-3 flex justify-between items-center border-t border-gray-100">
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-600 text-sm">보호자</span>
                                    <span className="text-blue-500 text-sm">
                                        {animalData.animalCaseDetail.currentFosterName}
                                    </span>
                                </div>
                                <span className="text-gray-500 text-xs">
                                    {new Date(animalData.animalCaseDetail.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        )}

                        {/* 보호 이력 - 토글 가능 */}
                        <div className="px-5 py-3 border-t border-gray-100">
                            <div
                                className="flex justify-between items-center cursor-pointer"
                                onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                            >
                                <h2 className="text-sm font-medium text-gray-700">보호 이력</h2>
                                <button className="text-gray-500 hover:text-gray-700 transition-colors">
                                    {isHistoryOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </button>
                            </div>

                            {isHistoryOpen && (
                                <div className="mt-3 space-y-2">
                                    {animalData.animalCaseDetail.caseHistoryList.map((history, index) => (
                                        <div
                                            key={index}
                                            className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                                        >
                                            <span className="text-gray-700 text-sm">{history.statusDescription}</span>
                                            <span className="text-gray-500 text-xs">
                                                {new Date(history.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* 신청 관리 섹션 - 보호자인 경우에만 표시 */}
                        {animalData.isOwner && animalData.pendingProtections && animalData.pendingProtections.length > 0 && (
                            <div className="px-5 py-3 border-t border-gray-100">
                                <h2 className="text-sm font-medium text-gray-700 mb-3">대기 중인 신청</h2>
                                <div className="space-y-3">
                                    {animalData.pendingProtections.map((application, index) => (
                                        <div key={index} className="bg-orange-50 p-3 rounded-lg">
                                            <div className="flex justify-between">
                                                <span className="font-medium text-gray-700">{application.applicantName}</span>
                                                <span className="text-xs text-gray-500">
                                                    {new Date(application.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1">{application.reason}</p>
                                            <div className="flex gap-2 mt-2">
                                                <button className="px-3 py-1 bg-green-500 text-white text-xs rounded-md">
                                                    수락
                                                </button>
                                                <button className="px-3 py-1 bg-red-500 text-white text-xs rounded-md">
                                                    거절
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 임시보호/입양 신청 버튼 - 내가 소유자가 아닐 때만 표시 */}
                        {!animalData.isOwner && animalData.animalCaseDetail.caseStatus === 'PROTECT_WAITING' && (
                            <div className="p-5 border-t border-gray-100 space-y-3">
                                <button
                                    className="w-full py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
                                    onClick={() => {/* 신청 기능 구현 예정 */ }}
                                >
                                    임시보호 신청하기
                                </button>
                                <button
                                    className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                                    onClick={() => {/* 입양 신청 기능 구현 예정 */ }}
                                >
                                    입양 신청하기
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-64 p-4">
                    <p className="text-gray-600 text-center">
                        동물 정보를 찾을 수 없습니다.
                    </p>
                </div>
            )}
        </div>
    );
};

export default AnimalDetail;