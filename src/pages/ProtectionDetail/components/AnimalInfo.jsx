import React from 'react';
import { Edit2, Trash2, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import StatusBadge from '../../../components/StatusBadge';
import ImageCarousel from './ImageCarousel';

const AnimalInfo = ({
    animalData,
    handleEditClick,
    handleDeleteClick,
    currentImageIndex,
    setCurrentImageIndex,
    openGallery
}) => {
    const getSizeText = (size) => {
        switch (size) {
            case 'SMALL': return '소형';
            case 'MEDIUM': return '중형';
            case 'LARGE': return '대형';
            default: return size;
        }
    };

    return (
        <>
            {/* Header Section */}
            <div className="p-4 flex justify-between items-center border-b border-gray-100">
                <h2 className="text-lg font-bold text-orange-900">기본 정보</h2>
                <div className="flex items-center">
                    <StatusBadge status={animalData.animalCaseDetail.caseStatus} type="protection" />

                    {/* Edit/Delete buttons - only show if owner */}
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

            {/* Image Carousel */}
            <ImageCarousel
                images={animalData.images}
                imageUrl={animalData.animalCaseDetail.animalInfo.imageUrl}
                currentImageIndex={currentImageIndex}
                setCurrentImageIndex={setCurrentImageIndex}
                openGallery={openGallery}
            />

            {/* Main Information Section */}
            <div className="p-5 space-y-4">
                {/* Main Info - Orange background */}
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
                    {animalData.animalCaseDetail.animalInfo.registrationNo && (
                        <div className="flex justify-between items-center">
                            <span className="text-orange-500 text-sm">동물등록번호</span>
                            <span className="text-gray-800 text-sm">{animalData.animalCaseDetail.animalInfo.registrationNo}</span>
                        </div>
                    )}
                </div>

                {/* Health Status - Blue background */}
                <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-blue-500 text-sm">건강상태</span>
                        <span className="text-gray-800 text-sm">{animalData.animalCaseDetail.animalInfo.healthCondition}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-blue-500 text-sm">위치</span>
                        <div className="flex items-center">
                            <MapPin size={16} className="mr-1" />
                            <span className="text-gray-800 text-sm">{animalData.animalCaseDetail.location || '위치 정보 없음'}</span>
                        </div>
                    </div>
                </div>

                {/* Description - Green background */}
                {(animalData.animalCaseDetail.title || animalData.animalCaseDetail.description) && (
                    <div className="bg-green-50 rounded-lg p-4">
                        {animalData.animalCaseDetail.title && (
                            <div className="mb-2">
                                <h3 className="text-green-700 text-sm font-medium">{animalData.animalCaseDetail.title}</h3>
                            </div>
                        )}
                        {animalData.animalCaseDetail.description && (
                            <p className="text-gray-700 text-sm whitespace-pre-line">
                                {renderDescription(animalData.animalCaseDetail.description)}
                            </p>
                        )}
                    </div>
                )}

                {/* Feature Tags */}
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

            {/* Current Foster Info */}
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
        </>
    );
};

// Helper function to render description with hyperlinks
const renderDescription = (desc) => {
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
};

export default AnimalInfo;