import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import axios from 'axios';
import Header from './components/Header';
import AnimalInfo from './components/AnimalInfo';
import HistorySection from './components/HistorySection';
import ApplicationManagement from './components/ApplicationManagement';
import ApplicationsModal from '../../components/ApplicationsModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import ApplyModal from './components/ApplyModal';
import ImageGallery from './components/ImageGallery';
import ActionButtons from './components/ActionButtons';

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

    // Scroll to top on page load
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

    return (
        <div className="max-w-lg mx-auto bg-[#FFF5E6] min-h-screen">
            <Header navigate={navigate} />

            <main className="pt-20 pb-20 px-4">
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
                    </div>
                ) : animalData ? (
                    <div className="bg-white rounded-xl overflow-hidden shadow-md">
                        <AnimalInfo
                            animalData={animalData}
                            handleEditClick={handleEditClick}
                            handleDeleteClick={handleDeleteClick}
                            currentImageIndex={currentImageIndex}
                            setCurrentImageIndex={setCurrentImageIndex}
                            openGallery={() => setIsGalleryOpen(true)}
                        />

                        <HistorySection
                            animalCaseDetail={animalData.animalCaseDetail}
                            isHistoryOpen={isHistoryOpen}
                            setIsHistoryOpen={setIsHistoryOpen}
                        />

                        {animalData.isOwner && animalData.pendingProtections && animalData.pendingProtections.length > 0 && (
                            <ApplicationManagement
                                pendingProtections={animalData.pendingProtections}
                                openModal={() => setIsModalOpen(true)}
                            />
                        )}

                        {!animalData.isOwner &&
                            (animalData.animalCaseDetail.caseStatus === 'PROTECT_WAITING' ||
                                animalData.animalCaseDetail.caseStatus === 'SHELTER_PROTECTING') && (
                                <ActionButtons handleApplyClick={handleApplyClick} />
                            )}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-64 p-4">
                        <p className="text-gray-600 text-center">
                            동물 정보를 찾을 수 없습니다.
                        </p>
                    </div>
                )}

                {isApplyModalOpen && (
                    <ApplyModal
                        isOpen={isApplyModalOpen}
                        applicationType={applicationType}
                        applyReason={applyReason}
                        setApplyReason={setApplyReason}
                        isSubmitting={isSubmitting}
                        handleCancel={handleCancelApply}
                        handleSubmit={handleSubmitApply}
                    />
                )}

                {isDeleteModalOpen && (
                    <DeleteConfirmModal
                        isOpen={isDeleteModalOpen}
                        isSubmitting={isSubmitting}
                        handleCancel={handleCancelDelete}
                        handleConfirm={handleConfirmDelete}
                    />
                )}

                {isGalleryOpen && animalData.images && (
                    <ImageGallery
                        images={animalData.images}
                        currentIndex={currentImageIndex}
                        setCurrentIndex={setCurrentImageIndex}
                        closeGallery={() => setIsGalleryOpen(false)}
                    />
                )}

                <ApplicationsModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    applications={animalData?.pendingProtections || []}
                    onApprove={handleApproveProtection}
                    onReject={handleRejectProtection}
                    title="대기 중인 신청"
                />
            </main>
        </div>
    );
};

export default AnimalDetail;