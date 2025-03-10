import React from 'react';

// 이미지 import
import dogPosterImage from '../assets/images/LOSTDOG2.png';

// DOG 타입만 사용하는 현상금 전단지 컴포넌트
const RewardPoster = ({ poster, onClose }) => {
    if (!poster) return null;

    // 이미지 크기와 위치 설정
    const imageConfig = {
        width: '90%',      // 이미지 너비 (백분율)
        height: '62%',     // 이미지 높이 (백분율)
        top: '50%',        // 상단에서 위치 (백분율)
        left: '50%',       // 왼쪽에서 위치 (백분율)
        transform: 'translate(-50%, -50%)', // 중앙 정렬
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="relative max-w-sm w-full">
                <div className="relative w-full max-w-xs mx-auto rounded-lg shadow-lg overflow-hidden">
                    {/* 닫기 버튼 - 오른쪽 상단에 X 표시 */}
                    <button
                        onClick={onClose}
                        className="absolute top-2 right-2 z-10 bg-gray-800 bg-opacity-50 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-700 transition-colors"
                        aria-label="닫기"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>

                    {/* 템플릿 배경 이미지 */}
                    <div className="relative">
                        <img
                            src={dogPosterImage}
                            alt="poster template"
                            className="w-full h-auto"
                        />

                        {/* 반려동물 이미지 오버레이 - 섬세하게 위치와 크기 조절 */}
                        <div
                            className="absolute rounded-md overflow-hidden"
                            style={{
                                width: imageConfig.width,
                                height: imageConfig.height,
                                top: imageConfig.top,
                                left: imageConfig.left,
                                transform: imageConfig.transform,
                            }}
                        >
                            {poster.imageUrl ? (
                                <img
                                    src={poster.imageUrl}
                                    alt={poster.petName}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                                    <span>이미지 없음</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 이름과 현상금 정보 오버레이 (이미지 아래쪽) */}
                    <div className="absolute bottom-0 left-0 right-0 bg-white bg-opacity-100 p-10 text-white">
                        <div className="flex justify-between items-center">
                            <div className="font-bold text-xl text-gray-900">{poster.petName}</div>
                            <div className="font-bold text-xl text-red-600">
                                {poster.reward ? `${poster.reward.toLocaleString()}원` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RewardPoster;