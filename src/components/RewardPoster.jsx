import React from 'react';

// 이미지 import
import dogPosterImage from '../assets/images/LOSTDOG.jpg';
import catPosterImage from '../assets/images/LOSTCAT.jpg';
import defaultPosterImage from '../assets/images/LOSTDOG2.png';

// 오버레이 없이 사진 크기만 조절한 현상금 전단지 컴포넌트
const RewardPoster = ({ poster, onClose }) => {
    if (!poster) return null;

    // 포스터 스타일에 따라 다른 템플릿 사용
    const getPosterTemplate = () => {
        // 포스터 타입에 따른 배경 이미지 선택
        let templateImage;
        switch (poster.templateType) {
            case 'DOG':
                templateImage = defaultPosterImage;
                break;
            case 'CAT':
                templateImage = catPosterImage;
                break;
            default:
                templateImage = defaultPosterImage;
        }

        return (
            <div className="relative w-full max-w-xs mx-auto rounded-lg shadow-lg">
                {/* 템플릿 이미지 */}
                <img
                    src={templateImage}
                    alt="poster template"
                    className="w-full h-auto"
                />

                {/* 닫기 버튼 - 이미지 하단에 배치 */}
                <div className="flex justify-center my-2">
                    <button
                        onClick={onClose}
                        className="bg-gray-500 text-white px-4 py-2 rounded-md"
                    >
                        닫기
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="relative max-w-sm w-full">
                {getPosterTemplate()}
            </div>
        </div>
    );
};

export default RewardPoster;