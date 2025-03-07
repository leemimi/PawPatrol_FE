import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Header from './components/Header';
import AnimalInfo from './components/AnimalInfo';
import HistorySection from './components/HistorySection';
import ApplicationManagement from './components/ApplicationManagement';
import ApplicationsModal from '../../components/ApplicationsModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import ApplyModal from './components/ApplyModal';
import ImageGallery from './components/ImageGallery';
import ActionButtons from './components/ActionButtons';
import { useProtectionDetail, useAnimalDeletion, useProtectionApplication } from '../../hooks/useProtections';

const AnimalDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // 상세 정보 조회 훅
    const { data: animalData, loading, error, refresh } = useProtectionDetail(id);

    // 동물 삭제 훅
    const { loading: deleteLoading, deleteAnimal } = useAnimalDeletion();

    // 보호/입양 신청 관련 훅
    const {
        loading: applicationLoading,
        applyForProtection,
        approveProtection,
        rejectProtection
    } = useProtectionApplication();

    // 로컬 상태 관리
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [applyReason, setApplyReason] = useState('');
    const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
    const [applicationType, setApplicationType] = useState('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);

    // Scroll to top on page load
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

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
            await deleteAnimal(id);
            alert('삭제되었습니다.');
            navigate('/my-register-animals');
        } catch (error) {
            console.error('삭제 오류:', error);
            alert('삭제 중 오류가 발생했습니다.');
        } finally {
            setIsDeleteModalOpen(false);
        }
    };

    const handleSubmitApply = async () => {
        if (!applyReason.trim()) {
            alert('신청 사유를 입력해주세요.');
            return;
        }

        try {
            await applyForProtection(id, {
                reason: applyReason,
                protectionType: applicationType === 'adoption' ? 'ADOPTION' : 'TEMP_PROTECTION'
            });

            alert(applicationType === 'adoption' ? '입양 신청이 완료되었습니다.' : '임시보호 신청이 완료되었습니다.');
            navigate('/my-applications');
        } catch (error) {
            console.error('신청 오류:', error);
            alert('신청 중 오류가 발생했습니다.');
        } finally {
            setIsApplyModalOpen(false);
            setApplyReason('');
            setApplicationType('');
        }
    };

    const handleApproveProtection = async (protectionId) => {
        try {
            await approveProtection(protectionId);
            alert('신청이 승인되었습니다.');
            refresh(); // 데이터 새로고침
        } catch (error) {
            console.error('승인 오류:', error);
            alert('승인 중 오류가 발생했습니다.');
        }
    };

    const handleRejectProtection = async (protectionId) => {
        const rejectReason = prompt('거절 사유를 입력해주세요');
        if (rejectReason === null) return;

        try {
            await rejectProtection(protectionId, rejectReason);
            alert('신청이 거절되었습니다.');
            refresh(); // 데이터 새로고침
        } catch (error) {
            console.error('거절 오류:', error);
            alert('거절 중 오류가 발생했습니다.');
        }
    };

    // 오류 처리
    if (error) {
        return (
            <div className="max-w-lg mx-auto bg-[#FFF5E6] min-h-screen">
                <Header navigate={navigate} />
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
                        isSubmitting={applicationLoading}
                        handleCancel={handleCancelApply}
                        handleSubmit={handleSubmitApply}
                    />
                )}

                {isDeleteModalOpen && (
                    <DeleteConfirmModal
                        isOpen={isDeleteModalOpen}
                        isSubmitting={deleteLoading}
                        handleCancel={handleCancelDelete}
                        handleConfirm={handleConfirmDelete}
                    />
                )}

                {isGalleryOpen && animalData && animalData.images && (
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