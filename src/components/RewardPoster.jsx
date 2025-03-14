import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PetApiService } from '../api/PetApiService';
import { useNavigate } from 'react-router-dom';


// 이미지 import
import dogPosterImage from '../assets/images/LOSTDOG2.png';


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
const RewardPoster = ({
    posters: propPosters,
    initialIndex = 0,
    onClose,
    dontShowFor24Hours,
    setDontShowFor24Hours
}) => {
    // 배경 이미지는 항상 LOSTDOG2 사용
    const backgroundImage = dogPosterImage;
    const navigate = useNavigate();
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [imagesLoaded, setImagesLoaded] = useState({});
    const [templateLoaded, setTemplateLoaded] = useState(false);
    const [posters, setPosters] = useState(propPosters || []);
    const [loading, setLoading] = useState(!propPosters);
    const [error, setError] = useState(null);

    // 체크박스 상태 변경 핸들러
    const handleDontShowChange = (e) => {
        if (setDontShowFor24Hours) {
            setDontShowFor24Hours(e.target.checked);

            if (e.target.checked) {
                // 체크됐을 때 현재 시간을 localStorage에 저장
                localStorage.setItem('lastPosterHiddenTime', new Date().getTime().toString());
            } else {
                // 체크 해제됐을 때 localStorage에서 삭제
                localStorage.removeItem('lastPosterHiddenTime');
            }
        }
    };

    const handleClose = () => {
        // 닫을 때 체크박스 상태에 따라 처리
        if (dontShowFor24Hours) {
            localStorage.setItem('lastPosterHiddenTime', new Date().getTime().toString());
        }
        onClose();
    };


    const handleDetailNavigation = () => {
        const poster = posters[currentIndex];
        if (poster && poster.id) {
            console.log('상세 페이지로 이동:', poster.id);
            navigate(`/PetPostDetail/${poster.id}`);
            onClose(); // 포스터 창 닫기
        } else {
            console.error('유효한 게시물 ID가 없습니다:', poster);
        }
    };


    // API에서 보상금 게시글 데이터 가져오기
    useEffect(() => {
        // props로 포스터 데이터가 전달되었다면 API 호출 패스
        if (propPosters && propPosters.length > 0) {
            setPosters(propPosters);
            setLoading(false);
            return;
        }

        // props로 포스터 데이터가 전달되지 않았을 때만 API 호출
        const fetchRewardPosters = async () => {
            try {
                setLoading(true);
                const result = await PetApiService.fetchRewardPosts();

                if (result && result.content) {
                    // 보상금이 null이 아닌 게시글만 필터링
                    const filteredPosters = result.content.filter(post => post.reward !== null && post.reward > 0);

                    if (filteredPosters.length > 0) {
                        setPosters(filteredPosters);
                    } else {
                        // 보상금 게시글이 없을 때는 그냥 닫기
                        onClose();
                    }
                } else {
                    // 데이터 형식이 올바르지 않을 때도 그냥 닫기
                    onClose();
                }
            } catch (err) {
                console.error("보상금 게시글 로딩 실패:", err);
                // 에러 발생 시에도 그냥 닫기
                onClose();
            } finally {
                setLoading(false);
            }
        };

        fetchRewardPosters();
    }, [propPosters, onClose]);

    // 컴포넌트 마운트 시 템플릿 이미지 프리로드
    useEffect(() => {
        const loadTemplateAndBadges = async () => {
            try {
                // 템플릿 이미지 로드
                await preloadImage(backgroundImage);
                setTemplateLoaded(true);

            } catch (error) {
                console.error('템플릿 이미지 프리로드 실패:', error);
                // 에러가 발생해도 UI는 표시
                setTemplateLoaded(true);
            }
        };

        loadTemplateAndBadges();
    }, []);

    // 포스터 이미지 프리로드
    useEffect(() => {
        if (!posters || posters.length === 0) return;

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

    // 로딩 중이거나 포스터가 없는 경우 처리
    if (loading) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                <div className="bg-white p-8 rounded-lg shadow-lg">
                    <p className="text-lg text-gray-800">보상금 게시글을 불러오는 중...</p>
                </div>
            </div>
        );
    }

    if (error || !posters || posters.length === 0) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                <div className="bg-white p-8 rounded-lg shadow-lg">
                    <p className="text-lg text-gray-800">{error || "보상금이 설정된 게시글이 없습니다."}</p>
                    <button
                        onClick={onClose}
                        className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg"
                    >
                        닫기
                    </button>
                </div>
            </div>
        );
    }

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
                        onClick={handleClose}
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

                        {/* 변경: 이미지 클릭 시 상세 페이지로 이동 (전체 오버레이를 클릭 가능하게) */}
                        <div
                            className="absolute cursor-pointer"
                            style={{
                                width: imageConfig.width,
                                height: imageConfig.height,
                                top: imageConfig.top,
                                left: imageConfig.left,
                                transform: imageConfig.transform,
                            }}
                            onClick={handleDetailNavigation}
                        >
                            {/* 반려동물 이미지 오버레이 - 섬세하게 위치와 크기 조절 */}
                            <div
                                className="w-full h-full rounded-md overflow-hidden"
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
                    </div>

                    {/* 순위 배지 - 디자인 개선 */}
                    {posterRank <= 5 && (
                        <div className="absolute z-10 w-16 h-16" style={{ bottom: '125px', right: '10px' }}>
                            <div className={`w-full h-full flex items-center justify-center rounded-full shadow-xl 
        ${posterRank === 1
                                    ? 'bg-gradient-to-br from-yellow-300 to-yellow-500 border-2 border-yellow-200'
                                    : posterRank === 2
                                        ? 'bg-gradient-to-br from-gray-200 to-gray-400 border-2 border-gray-100'
                                        : posterRank === 3
                                            ? 'bg-gradient-to-br from-amber-500 to-amber-700 border-2 border-amber-400'
                                            : 'bg-gradient-to-br from-white to-gray-100 border-2 border-gray-200'}`}>
                                <div className="flex flex-col items-center justify-center relative">
                                    {posterRank === 1 && (
                                        <svg className="absolute top-0 left-0 w-full h-full text-yellow-200 opacity-30" viewBox="0 0 50 50" fill="currentColor">
                                            <path d="M25 0 L30 20 L50 20 L35 32 L42 50 L25 38 L8 50 L15 32 L0 20 L20 20 Z" />
                                        </svg>
                                    )}
                                    <span className={`font-bold text-lg drop-shadow-md
                    ${posterRank === 1
                                            ? 'text-yellow-900'
                                            : posterRank === 2
                                                ? 'text-gray-800'
                                                : posterRank === 3
                                                    ? 'text-amber-100'
                                                    : 'text-gray-700'}`}>
                                        {posterRank}위
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 이름과 현상금 정보 오버레이 (이미지 아래쪽) */}
                    <div className="absolute bottom-0 left-0 right-0 bg-white bg-opacity-100 p-4 pb-10 text-white">
                        <div className="flex flex-col">
                            {/* 반려동물 이름과 현상금을 한 줄에 양쪽 끝으로 배치 */}
                            <div className="flex items-center justify-between mb-2">
                                <div className="font-bold text-xl text-gray-900">{poster.petName || '이름 없음'}</div>
                                <div className="font-bold text-xl text-red-600">
                                    {poster.reward ? `${poster.reward.toLocaleString('ko-KR')}원` : ''}
                                </div>
                            </div>

                            {/* 위치 정보 */}
                            {poster.location && (
                                <div className="text-sm text-gray-700 flex items-center mb-1">
                                    <div className="flex-shrink-0 text-orange-500 mr-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <span className="truncate">
                                        {poster.location.split(' ').slice(0, 2).join(' ')}
                                    </span>
                                </div>
                            )}

                            {/* 시간 정보 */}
                            {poster.lostTime && (
                                <div className="text-sm text-gray-700 flex items-center">
                                    <div className="flex-shrink-0 text-orange-500 mr-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <span>
                                        {poster.lostTime?.includes('T')
                                            ? new Date(poster.lostTime).toLocaleDateString('ko-KR', {
                                                month: 'numeric',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })
                                            : poster.lostTime}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 페이지 인디케이터 */}
                    {posters.length > 1 && (
                        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1">
                            {posters.map((_, index) => (
                                <button
                                    key={index}
                                    className={`w-2 h-2 rounded-full transition-all ${index === currentIndex
                                        ? 'bg-orange-500 scale-125'
                                        : 'bg-gray-300'
                                        }`}
                                    onClick={() => setCurrentIndex(index)}
                                />
                            ))}
                        </div>
                    )}


                    <div className="absolute bottom-0 left-0 right-0 bg-white px-4 py-2 flex items-center text-xs">
                        <input
                            type="checkbox"
                            id="dontShowFor24Hours"
                            checked={dontShowFor24Hours}
                            onChange={handleDontShowChange}
                            className="mr-2"
                        />
                        <label htmlFor="dontShowFor24Hours" className="text-gray-700">
                            24시간 동안 표시하지 않기
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RewardPoster;