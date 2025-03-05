import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, ArrowLeft, Edit2, Trash2, Home, Clock, ChevronLeft, ChevronRight, X } from 'lucide-react';
import axios from 'axios';
import ApplicationsModal from '../../components/ApplicationsModal';

const AnimalDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [animalData, setAnimalData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [applyReason, setApplyReason] = useState('');
    const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
    const [applicationType, setApplicationType] = useState('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Image gallery state
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);

    // 페이지 로드 시 스크롤을 최상단으로 이동
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        const fetchAnimalDetail = async () => {
            try {
                setLoading(true);
                const response = await axios.get(
                    `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/protections/${id}`,
                    {
                        withCredentials: true,
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }
                );

                if (response.status === 200) {
                    console.log("상세 정보:", response.data);
                    if (response.data.resultCode === "200") {
                        setAnimalData(response.data.data);
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

    const nextImage = () => {
        if (animalData && animalData.images) {
            setCurrentImageIndex((prevIndex) =>
                prevIndex === animalData.images.length - 1 ? 0 : prevIndex + 1
            );
        }
    };

    const prevImage = () => {
        if (animalData && animalData.images) {
            setCurrentImageIndex((prevIndex) =>
                prevIndex === 0 ? animalData.images.length - 1 : prevIndex - 1
            );
        }
    };

    const openGallery = (index) => {
        setCurrentImageIndex(index);
        setIsGalleryOpen(true);
    };

    const getSizeText = (size) => {
        switch (size) {
            case 'SMALL': return '소형';
            case 'MEDIUM': return '중형';
            case 'LARGE': return '대형';
            default: return size;
        }
    };

    const handleApplyClick = (type) => {
        setApplicationType(type);
        setIsApplyModalOpen(true);
    };

    const handleCancelApply = () => {
        setIsApplyModalOpen(false);
        setApplyReason('');
        setApplicationType('');
    };

    const handleEditClick = () => {
        navigate(`/edit-animal/${id}`);
    };

    const handleDeleteClick = () => {
        setIsDeleteModalOpen(true);
    };

    const handleCancelDelete = () => {
        setIsDeleteModalOpen(false);
    };

    const handleConfirmDelete = async () => {
        try {
            setIsSubmitting(true);
            const response = await axios.patch(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/protections/${id}`,
                {},
                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.status === 200) {
                if (response.data.resultCode === "200") {
                    alert('삭제되었습니다.');
                    navigate('/my-cases');
                } else {
                    alert('삭제 중 오류가 발생했습니다: ' + response.data.message);
                }
            } else {
                alert('삭제 중 오류가 발생했습니다.');
            }
        } catch (error) {
            console.error('삭제 오류:', error);
            alert('삭제 중 오류가 발생했습니다.');
        } finally {
            setIsSubmitting(false);
            setIsDeleteModalOpen(false);
        }
    };

    const handleSubmitApply = async () => {
        if (!applyReason.trim()) {
            alert('신청 사유를 입력해주세요.');
            return;
        }

        try {
            setIsSubmitting(true);

            const response = await axios.post(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/protections/${id}/apply`,
                {
                    reason: applyReason,
                    protectionType: applicationType === 'adoption' ? 'ADOPTION' : 'TEMP_PROTECTION'
                },
                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.status === 200) {
                if (response.data.resultCode === "200") {
                    alert(applicationType === 'adoption' ? '입양 신청이 완료되었습니다.' : '임시보호 신청이 완료되었습니다.');
                    navigate('/my-applications');
                } else {
                    alert('신청 중 오류가 발생했습니다: ' + response.data.message);
                }
            } else {
                alert('신청 중 오류가 발생했습니다.');
            }
        } catch (error) {
            console.error('신청 오류:', error);
            alert('신청 중 오류가 발생했습니다.');
        } finally {
            setIsSubmitting(false);
            setIsApplyModalOpen(false);
            setApplyReason('');
            setApplicationType('');
        }
    };

    const handleApproveProtection = async (protectionId) => {
        try {
            const response = await axios.patch(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/protections/${protectionId}/accept`,
                {},
                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.status === 200) {
                if (response.data.resultCode === "200") {
                    alert('신청이 승인되었습니다.');
                    window.location.reload();
                } else {
                    alert('승인 중 오류가 발생했습니다: ' + response.data.message);
                }
            } else {
                alert('승인 중 오류가 발생했습니다.');
            }
        } catch (error) {
            console.error('승인 오류:', error);
            alert('승인 중 오류가 발생했습니다.');
        }
    };

    const handleRejectProtection = async (protectionId) => {
        const rejectReason = prompt('거절 사유를 입력해주세요');
        if (rejectReason === null) return;

        try {
            const response = await axios.patch(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/protections/${protectionId}/reject`,
                {
                    rejectReason: rejectReason
                },
                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.status === 200) {
                if (response.data.resultCode === "200") {
                    alert('신청이 거절되었습니다.');
                    window.location.reload();
                } else {
                    alert('거절 중 오류가 발생했습니다: ' + response.data.message);
                }
            } else {
                alert('거절 중 오류가 발생했습니다.');
            }
        } catch (error) {
            console.error('거절 오류:', error);
            alert('거절 중 오류가 발생했습니다.');
        }
    };

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

    return (
        <div className="max-w-lg mx-auto bg-[#FFF5E6] min-h-screen">
            <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-10">
                <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-1 text-orange-400 hover:text-orange-500 transition-colors"
                        >
                            <ArrowLeft size={24} strokeWidth={2.5} />
                        </button>
                        <h1 className="text-lg font-bold text-orange-900">
                            상세 정보
                        </h1>
                    </div>
                </div>
            </header>

            <main className="pt-20 pb-20 px-4">
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
                    </div>
                ) : animalData ? (
                    <div className="bg-white rounded-xl overflow-hidden shadow-md">
                        {/* 헤더 섹션 */}
                        <div className="p-4 flex justify-between items-center border-b border-gray-100">
                            <h2 className="text-lg font-bold text-orange-900">기본 정보</h2>
                            <div className="flex items-center">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium mr-2 ${animalData.animalCaseDetail.caseStatus === 'PROTECT_WAITING'
                                    ? 'bg-yellow-400 text-white'
                                    : animalData.animalCaseDetail.caseStatus === 'SHELTER_PROTECTING'
                                        ? 'bg-blue-400 text-white'
                                        : animalData.animalCaseDetail.caseStatus === 'MY_PET'
                                            ? 'bg-purple-400 text-white'
                                            : 'bg-orange-300 text-white'
                                    }`}>
                                    {animalData.animalCaseDetail.caseStatus === 'PROTECT_WAITING'
                                        ? '신청가능'
                                        : animalData.animalCaseDetail.caseStatus === 'SHELTER_PROTECTING'
                                            ? '보호소 보호중'
                                            : animalData.animalCaseDetail.caseStatus === 'MY_PET'
                                                ? 'My Pet'
                                                : '임보중'}
                                </span>

                                {/* 수정/삭제 버튼 - 내가 등록한 경우에만 표시 */}
                                {animalData.isOwner && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleEditClick}
                                            className="p-1 text-blue-500 hover:text-blue-600 transition-colors"
                                            title="수정"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={handleDeleteClick}
                                            className="p-1 text-red-500 hover:text-red-600 transition-colors"
                                            title="삭제"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 사진 영역 - 메인 이미지와 갤러리 기능 추가 */}
                        <div className="relative">
                            <div className="h-80 overflow-hidden relative">
                                {animalData.images && animalData.images.length > 0 ? (
                                    <>
                                        <img
                                            src={animalData.images[currentImageIndex].path}
                                            alt={`동물 사진 ${currentImageIndex + 1}`}
                                            className="w-full h-full object-cover"
                                            onClick={() => openGallery(currentImageIndex)}
                                        />

                                        {/* Image navigation */}
                                        {animalData.images.length > 1 && (
                                            <>
                                                <button
                                                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-60 p-1 rounded-full shadow-md hover:bg-opacity-90 transition-all"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        prevImage();
                                                    }}
                                                >
                                                    <ChevronLeft size={24} className="text-gray-800" />
                                                </button>
                                                <button
                                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-60 p-1 rounded-full shadow-md hover:bg-opacity-90 transition-all"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        nextImage();
                                                    }}
                                                >
                                                    <ChevronRight size={24} className="text-gray-800" />
                                                </button>
                                                <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
                                                    {animalData.images.map((_, index) => (
                                                        <button
                                                            key={index}
                                                            className={`w-2 h-2 rounded-full transition-all ${index === currentImageIndex
                                                                ? 'bg-white scale-125'
                                                                : 'bg-white bg-opacity-60'
                                                                }`}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setCurrentImageIndex(index);
                                                            }}
                                                        />
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </>
                                ) : animalData.animalCaseDetail.animalInfo.imageUrl && (
                                    <img
                                        src={animalData.animalCaseDetail.animalInfo.imageUrl}
                                        alt="동물 사진"
                                        className="w-full h-full object-cover"
                                    />
                                )}
                            </div>

                            {/* 썸네일 갤러리 */}
                            {animalData.images && animalData.images.length > 1 && (
                                <div className="px-4 py-2 overflow-x-auto bg-gray-50">
                                    <div className="flex gap-2">
                                        {animalData.images.map((image, index) => (
                                            <button
                                                key={index}
                                                className={`flex-shrink-0 h-16 w-16 rounded-md overflow-hidden border-2 transition-all ${index === currentImageIndex
                                                    ? 'border-orange-500 shadow-md scale-105'
                                                    : 'border-transparent hover:border-orange-300'
                                                    }`}
                                                onClick={() => setCurrentImageIndex(index)}
                                            >
                                                <img
                                                    src={image.path}
                                                    alt={`썸네일 ${index + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
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

                            {/* 상세 설명 영역 - 제목과 설명이 있을 때만 표시 */}
                            {(animalData.animalCaseDetail.title || animalData.animalCaseDetail.description) && (
                                <div className="bg-green-50 rounded-lg p-4">
                                    {animalData.animalCaseDetail.title && (
                                        <div className="mb-2">
                                            <h3 className="text-green-700 text-sm font-medium">{animalData.animalCaseDetail.title}</h3>
                                        </div>
                                    )}
                                    {animalData.animalCaseDetail.description && (
                                        <p className="text-gray-700 text-sm whitespace-pre-line">
                                            {(() => {
                                                const desc = animalData.animalCaseDetail.description;
                                                // YouTube 링크 찾기
                                                if (desc.includes('영상 링크 :')) {
                                                    const parts = desc.split('영상 링크 :');
                                                    const beforeLink = parts[0];
                                                    const afterLinkParts = parts[1].split(' ');
                                                    const link = afterLinkParts[1];
                                                    const remainingText = afterLinkParts.slice(2).join(' ');

                                                    return (
                                                        <>
                                                            {beforeLink}영상 링크 : <a
                                                                href={link}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-blue-500 hover:underline"
                                                            >
                                                                {link}
                                                            </a>{remainingText}
                                                        </>
                                                    );
                                                }
                                                return desc;
                                            })()}
                                        </p>
                                    )}
                                </div>
                            )}

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
                                <div className="flex justify-between items-center">
                                    <h2 className="text-sm font-medium text-gray-700">대기 중인 신청</h2>
                                    <button
                                        className="text-blue-500 text-xs font-medium"
                                        onClick={() => setIsModalOpen(true)}
                                    >
                                        모든 신청 보기
                                    </button>
                                </div>
                                <div className="mt-3 space-y-3">
                                    {/* 첫 2개만 미리보기로 표시 */}
                                    {animalData.pendingProtections.slice(0, 2).map((application, index) => (
                                        <div
                                            key={index}
                                            className={`border border-gray-100 p-3 rounded-lg shadow-sm ${application.protectionType === 'ADOPTION'
                                                ? 'bg-gray-50'
                                                : 'bg-gray-50'
                                                }`}
                                        >
                                            <div className="flex justify-between items-center mb-2">
                                                <div className="flex items-center gap-2">
                                                    {/* Protection type badge next to applicant name */}
                                                    {application.protectionType === 'ADOPTION' ? (
                                                        <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 border border-blue-200 text-blue-900 rounded-full text-xs font-medium">
                                                            <Home size={12} />
                                                            <span>입양</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 border border-yellow-200 text-yellow-900 rounded-full text-xs font-medium">
                                                            <Clock size={12} />
                                                            <span>임시보호</span>
                                                        </div>
                                                    )}
                                                    <span className="font-medium text-gray-800">{application.applicantName}</span>
                                                </div>
                                                <span className="text-xs text-gray-500">
                                                    {new Date(application.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                    {animalData.pendingProtections.length > 2 && (
                                        <div className="text-center text-xs text-gray-500">
                                            외 {animalData.pendingProtections.length - 2}건의 신청이 있습니다.
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <ApplicationsModal
                            isOpen={isModalOpen}
                            onClose={() => setIsModalOpen(false)}
                            applications={animalData?.pendingProtections || []}
                            onApprove={handleApproveProtection}
                            onReject={handleRejectProtection}
                            title="대기 중인 신청"
                        />

                        {/* 임시보호/입양 신청 버튼 - 내가 소유자가 아닐 때만 표시 */}
                        {!animalData.isOwner && (animalData.animalCaseDetail.caseStatus === 'PROTECT_WAITING' || animalData.animalCaseDetail.caseStatus === 'SHELTER_PROTECTING') && (
                            <div className="p-5 border-t border-gray-100 space-y-3">
                                <button
                                    className="w-full py-3 flex justify-center items-center gap-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors"
                                    onClick={() => handleApplyClick('tempProtection')}
                                >
                                    <Clock size={18} />
                                    임시보호 신청하기
                                </button>
                                <button
                                    className="w-full py-3 flex justify-center items-center gap-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                                    onClick={() => handleApplyClick('adoption')}
                                >
                                    <Home size={18} />
                                    입양 신청하기
                                </button>
                            </div>
                        )}
                    </div>

                ) : (
                    <div className="flex flex-col items-center justify-center h-64 p-4">
                        <p className="text-gray-600 text-center">
                            동물 정보를 찾을 수 없습니다.
                        </p>
                    </div>
                )}

                {/* 신청 모달 */}
                {isApplyModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl p-5 w-full max-w-md">
                            <h3 className="text-lg font-medium mb-1">
                                {applicationType === 'adoption' ? '입양 신청하기' : '임시보호 신청하기'}
                            </h3>

                            {/* 신청 유형 배지 */}
                            <div className="mb-4">
                                {applicationType === 'adoption'
                                    ? getProtectionTypeBadge('ADOPTION')
                                    : getProtectionTypeBadge('TEMP_PROTECTION')
                                }
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-medium mb-2">
                                    신청 사유
                                </label>
                                <textarea
                                    className="w-full border border-gray-300 rounded-lg p-3 text-sm resize-none h-32"
                                    placeholder="신청 사유를 입력해주세요"
                                    value={applyReason}
                                    onChange={(e) => setApplyReason(e.target.value)}
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium"
                                    onClick={handleCancelApply}
                                    disabled={isSubmitting}
                                >
                                    취소
                                </button>
                                <button
                                    className={`px-4 py-2 text-white rounded-lg text-sm font-medium
                                        ${applicationType === 'adoption'
                                            ? 'bg-indigo-500 hover:bg-indigo-600'
                                            : 'bg-amber-500 hover:bg-amber-600'}`}
                                    onClick={handleSubmitApply}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? '제출 중...' : '신청하기'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 삭제 확인 모달 */}
                {isDeleteModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl p-5 w-full max-w-md">
                            <h3 className="text-lg font-medium mb-4">삭제 확인</h3>
                            <p className="mb-4 text-gray-700">
                                정말로 이 동물 정보를 삭제하시겠습니까?
                            </p>
                            <div className="flex justify-end gap-2">
                                <button
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium"
                                    onClick={handleCancelDelete}
                                    disabled={isSubmitting}
                                >
                                    취소
                                </button>
                                <button
                                    className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium"
                                    onClick={handleConfirmDelete}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? '삭제 중...' : '삭제하기'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 전체화면 이미지 갤러리 모달 */}
                {isGalleryOpen && animalData.images && (
                    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
                        <button
                            className="absolute top-4 right-4 text-white p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 transition-colors"
                            onClick={() => setIsGalleryOpen(false)}
                        >
                            <X size={24} />
                        </button>

                        <button
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 transition-colors"
                            onClick={prevImage}
                        >
                            <ChevronLeft size={32} />
                        </button>

                        <div className="w-full max-w-3xl max-h-[80vh] flex items-center justify-center">
                            <img
                                src={animalData.images[currentImageIndex].path}
                                alt={`동물 사진 ${currentImageIndex + 1}`}
                                className="max-w-full max-h-[80vh] object-contain"
                            />
                        </div>

                        <button
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 transition-colors"
                            onClick={nextImage}
                        >
                            <ChevronRight size={32} />
                        </button>

                        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                            {animalData.images.map((_, index) => (
                                <button
                                    key={index}
                                    className={`w-3 h-3 rounded-full transition-all ${index === currentImageIndex
                                        ? 'bg-white scale-125'
                                        : 'bg-white bg-opacity-60 hover:bg-opacity-100'
                                        }`}
                                    onClick={() => setCurrentImageIndex(index)}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AnimalDetail;