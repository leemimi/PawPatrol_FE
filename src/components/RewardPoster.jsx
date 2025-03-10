import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// 이미지 import
import dogPosterImage from '../assets/images/LOSTDOG2.png';
import rank1 from '../assets/images/rank1.png';
import rank2 from '../assets/images/rank2.png';
import rank3 from '../assets/images/rank3.png';

// 이미지 프리로더 함수
const preloadImage = (src) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = src;
        img.onload = resolve;
        img.onerror = reject;
    });
};

// DOG 타입만 사용하는 현상금 전단지 컴포넌트
const RewardPoster = ({ posters, initialIndex = 0, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [imagesLoaded, setImagesLoaded] = useState({});
    const [templateLoaded, setTemplateLoaded] = useState(false);
    const [badgesLoaded, setBadgesLoaded] = useState(false);

    if (!posters || posters.length === 0) return null;

    const poster = posters[currentIndex];

    // 현상금 금액 기준으로 정렬된 포스터 배열 (변경하지 않고 새 배열 생성)
    const sortedPosters = [...posters].sort((a, b) => (b.reward || 0) - (a.reward || 0));

    // 현재 포스터의 순위 확인 (정렬된 배열에서의 인덱스 + 1)
    const posterRank = sortedPosters.findIndex(p => p.id === poster.id) + 1;

    // 이미지 크기와 위치 설정
    const imageConfig = {
        width: '90%',      // 이미지 너비 (백분율)
        height: '62%',     // 이미지 높이 (백분율)
        top: '50%',        // 상단에서 위치 (백분율)
        left: '50%',       // 왼쪽에서 위치 (백분율)
        transform: 'translate(-50%, -50%)', // 중앙 정렬
    };

    // 배경 이미지는 항상 LOSTDOG2 사용
    const backgroundImage = dogPosterImage;

    // 순위에 따른 뱃지 이미지 선택
    const getRankBadge = (rank) => {
        if (rank === 1) return rank1;
        if (rank === 2) return rank2;
        if (rank === 3) return rank3;
        return null;
    };

    // 컴포넌트 마운트 시 템플릿 이미지와 뱃지 이미지 프리로드
    useEffect(() => {
        const loadTemplateAndBadges = async () => {
            try {
                // 템플릿 이미지 로드
                await preloadImage(backgroundImage);
                setTemplateLoaded(true);

                // 뱃지 이미지 로드
                await Promise.all([
                    preloadImage(rank1),
                    preloadImage(rank2),
                    preloadImage(rank3)
                ]);
                setBadgesLoaded(true);
            } catch (error) {
                console.error('템플릿/뱃지 이미지 프리로드 실패:', error);
                // 에러가 발생해도 UI는 표시
                setTemplateLoaded(true);
                setBadgesLoaded(true);
            }
        };

        loadTemplateAndBadges();
    }, []);

    // 포스터 이미지 프리로드
    useEffect(() => {
        const loadPosterImages = async () => {
            try {
                // 각 포스터 이미지 로드 상태 추적
                const imageLoadPromises = posters.map(async (p, idx) => {
                    if (!p.imageUrl) return;

                    try {
                        await preloadImage(p.imageUrl);
                        setImagesLoaded(prev => ({
                            ...prev,
                            [idx]: true
                        }));
                    } catch (error) {
                        console.error(`포스터 이미지 ${idx} 로드 실패:`, error);
                        setImagesLoaded(prev => ({
                            ...prev,
                            [idx]: true // 에러 시에도 로드된 것으로 처리
                        }));
                    }
                });

                await Promise.all(imageLoadPromises);
            } catch (error) {
                console.error('이미지 프리로드 실패:', error);
            }
        };

        loadPosterImages();
    }, [posters]);

    const nextPoster = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === posters.length - 1 ? 0 : prevIndex + 1
        );
    };

    const prevPoster = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === 0 ? posters.length - 1 : prevIndex - 1
        );
    };

    // 현재 이미지가 로드되었는지 확인
    const isCurrentImageLoaded = imagesLoaded[currentIndex];

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

                    {/* 좌측 이동 버튼 */}
                    {posters.length > 1 && (
                        <button
                            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-60 p-1 rounded-full shadow-md hover:bg-opacity-90 z-10 transition-all"
                            onClick={prevPoster}
                        >
                            <ChevronLeft size={24} className="text-gray-800" />
                        </button>
                    )}

                    {/* 우측 이동 버튼 */}
                    {posters.length > 1 && (
                        <button
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-60 p-1 rounded-full shadow-md hover:bg-opacity-90 z-10 transition-all"
                            onClick={nextPoster}
                        >
                            <ChevronRight size={24} className="text-gray-800" />
                        </button>
                    )}

                    {/* 템플릿 배경 이미지 */}
                    <div className="relative">
                        {!templateLoaded ? (
                            <div className="w-full h-96 bg-gray-200 animate-pulse flex items-center justify-center">
                                <span className="text-gray-400">템플릿 로딩 중...</span>
                            </div>
                        ) : (
                            <img
                                src={backgroundImage}
                                alt="poster template"
                                className="w-full h-auto"
                            />
                        )}

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
                                <>
                                    {!isCurrentImageLoaded && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 animate-pulse">
                                            <span className="text-gray-400">이미지 로딩 중...</span>
                                        </div>
                                    )}
                                    <img
                                        src={poster.imageUrl}
                                        alt={poster.petName}
                                        className={`w-full h-full object-cover transition-opacity duration-300 ${isCurrentImageLoaded ? 'opacity-100' : 'opacity-0'}`}
                                        onLoad={() => {
                                            if (!imagesLoaded[currentIndex]) {
                                                setImagesLoaded(prev => ({
                                                    ...prev,
                                                    [currentIndex]: true
                                                }));
                                            }
                                        }}
                                    />
                                </>
                            ) : (
                                <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                                    <span>이미지 없음</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {posterRank <= 3 && (
                        <div className="absolute z-10 w-16 h-16" style={{ top: '370px', left: '220px' }}>
                            <img
                                src={getRankBadge(posterRank)}
                                alt={`${posterRank}등`}
                                className="w-full h-full object-contain"
                            />
                        </div>
                    )}

                    {/* 이름과 현상금 정보 오버레이 (이미지 아래쪽) */}
                    <div
                        className="absolute bottom-0 left-0 right-0 bg-white bg-opacity-100 p-8 text-white"
                    >
                        <div className="flex flex-col gap-2">
                            <div className="font-bold text-xl text-gray-900">{poster.petName}</div>
                            <div className="flex items-center">
                                <div className="font-bold text-xl text-red-600">
                                    {poster.reward ? `${poster.reward.toLocaleString()}원` : ''}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 페이지 인디케이터 */}
                    {posters.length > 1 && (
                        <div className="absolute bottom-24 left-0 right-0 flex justify-center gap-1">
                            {posters.map((_, index) => (
                                <button
                                    key={index}
                                    className={`w-2 h-2 rounded-full transition-all ${index === currentIndex
                                        ? 'bg-gray-800 scale-125'
                                        : 'bg-gray-400 bg-opacity-60'
                                        }`}
                                    onClick={() => setCurrentIndex(index)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RewardPoster;