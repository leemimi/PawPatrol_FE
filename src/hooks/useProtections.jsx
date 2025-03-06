import { useState, useEffect, useCallback } from 'react';
import { ProtectionApiService } from '../api/ProtectionApiService';

// 보호 동물 목록 조회 훅 (무한 스크롤용으로 수정)
export const useProtections = (initialPage = 0, initialSize = 10) => {
    // 누적 컨텐츠 배열 추가
    const [accumulatedContent, setAccumulatedContent] = useState([]);
    const [data, setData] = useState({ content: [], totalElements: 0, last: true });
    const [page, setPage] = useState(initialPage);
    const [size, setSize] = useState(initialSize);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchProtections = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await ProtectionApiService.fetchProtections(page, size);

            // 원본 데이터 저장
            setData(result);

            // 누적 컨텐츠 업데이트
            if (page === 0) {
                // 첫 페이지면 데이터 초기화
                setAccumulatedContent(result.content);
            } else {
                // 아니면 기존 데이터에 추가
                setAccumulatedContent(prev => {
                    // 중복 ID 제거 로직
                    const existingIds = new Set(prev.map(item => item.animalCaseId));
                    const uniqueNewContent = result.content.filter(
                        item => !existingIds.has(item.animalCaseId)
                    );
                    return [...prev, ...uniqueNewContent];
                });
            }
        } catch (err) {
            setError(err);
            console.error('보호 동물 목록 조회 중 오류 발생:', err);
        } finally {
            setLoading(false);
        }
    }, [page, size]);

    useEffect(() => {
        fetchProtections();
    }, [fetchProtections]);

    const nextPage = () => {
        if (!data.last) {
            setPage(prevPage => prevPage + 1);
        }
    };

    const prevPage = () => {
        if (page > 0) {
            setPage(prevPage => prevPage - 1);
        }
    };

    const resetPage = () => {
        setPage(0);
        setAccumulatedContent([]);
    };

    const changeSize = (newSize) => {
        setSize(newSize);
        setPage(0);
        setAccumulatedContent([]);
    };

    return {
        // 원본 데이터와 누적 데이터 모두 제공
        data: {
            ...data,
            // content 대신 누적된 컨텐츠 제공
            content: accumulatedContent
        },
        loading,
        error,
        page,
        size,
        nextPage,
        prevPage,
        resetPage,
        changeSize,
        refresh: () => {
            resetPage();
            fetchProtections();
        }
    };
};

// 다른 훅들도 비슷한 방식으로 수정 필요...
// 예시: useMyRegisteredAnimals, useMyApplications
export const useMyRegisteredAnimals = (initialPage = 0, initialSize = 10) => {
    const [accumulatedContent, setAccumulatedContent] = useState([]);
    const [data, setData] = useState({ content: [], totalElements: 0, last: true });
    const [page, setPage] = useState(initialPage);
    const [size, setSize] = useState(initialSize);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchMyAnimals = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await ProtectionApiService.fetchMyRegisteredAnimals(page, size);

            // 원본 데이터 저장
            setData(result);

            // 누적 컨텐츠 업데이트 
            if (page === 0) {
                setAccumulatedContent(result.content);
            } else {
                setAccumulatedContent(prev => {
                    const existingIds = new Set(prev.map(item => item.animalCaseId));
                    const uniqueNewContent = result.content.filter(
                        item => !existingIds.has(item.animalCaseId)
                    );
                    return [...prev, ...uniqueNewContent];
                });
            }
        } catch (err) {
            setError(err);
            console.error('내 등록 동물 목록 조회 중 오류 발생:', err);
        } finally {
            setLoading(false);
        }
    }, [page, size]);

    useEffect(() => {
        fetchMyAnimals();
    }, [fetchMyAnimals]);

    const nextPage = () => {
        if (!data.last) {
            setPage(prevPage => prevPage + 1);
        }
    };

    const prevPage = () => {
        if (page > 0) {
            setPage(prevPage => prevPage - 1);
        }
    };

    const resetPage = () => {
        setPage(0);
        setAccumulatedContent([]);
    };

    return {
        data: {
            ...data,
            content: accumulatedContent
        },
        loading,
        error,
        page,
        size,
        nextPage,
        prevPage,
        resetPage,
        refresh: () => {
            resetPage();
            fetchMyAnimals();
        }
    };
};

export const useMyApplications = (initialPage = 0, initialSize = 10) => {
    const [accumulatedContent, setAccumulatedContent] = useState([]);
    const [data, setData] = useState({ content: [], totalElements: 0, last: true });
    const [page, setPage] = useState(initialPage);
    const [size, setSize] = useState(initialSize);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchMyApplications = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await ProtectionApiService.fetchMyApplications(page, size);

            // 원본 데이터 저장
            setData(result);

            // 누적 컨텐츠 업데이트
            if (page === 0) {
                setAccumulatedContent(result.content);
            } else {
                setAccumulatedContent(prev => {
                    const existingIds = new Set(prev.map(item => item.protectionId));
                    const uniqueNewContent = result.content.filter(
                        item => !existingIds.has(item.protectionId)
                    );
                    return [...prev, ...uniqueNewContent];
                });
            }
        } catch (err) {
            setError(err);
            console.error('내 신청 목록 조회 중 오류 발생:', err);
        } finally {
            setLoading(false);
        }
    }, [page, size]);

    useEffect(() => {
        fetchMyApplications();
    }, [fetchMyApplications]);

    const nextPage = () => {
        if (!data.last) {
            setPage(prevPage => prevPage + 1);
        }
    };

    const prevPage = () => {
        if (page > 0) {
            setPage(prevPage => prevPage - 1);
        }
    };

    const resetPage = () => {
        setPage(0);
        setAccumulatedContent([]);
    };

    return {
        data: {
            ...data,
            content: accumulatedContent
        },
        loading,
        error,
        page,
        size,
        nextPage,
        prevPage,
        resetPage,
        refresh: () => {
            resetPage();
            fetchMyApplications();
        }
    };
};