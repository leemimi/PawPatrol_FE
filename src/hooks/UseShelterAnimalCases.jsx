import { useState, useEffect, useCallback } from 'react';
import { ProtectionApiService } from '../api/ProtectionApiService';

export const useShelterAnimalCases = (shelterId, initialPage = 0, pageSize = 10) => {
    const [data, setData] = useState({
        shelterInfo: {
            shelterId: null,
            shelterName: '',
            shelterAddress: '',
            shelterTel: '',
            latitude: null,
            longitude: null,
            operatingHours: null,
            shelterMemberId: null
        },
        animalCases: {
            content: [],
            totalElements: 0,
            last: true,
            number: 0,
            totalPages: 0
        }
    });

    const [page, setPage] = useState(initialPage);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [initialized, setInitialized] = useState(false);

    // 데이터 가져오기
    const fetchData = useCallback(async (pageNumber = 0, reset = false) => {
        if (!shelterId) return;

        setLoading(true);
        setError(null);

        try {
            const responseData = await ProtectionApiService.fetchShelterAnimalCases(shelterId, pageNumber, pageSize);

            if (responseData) {
                const { animalCases, ...shelterInfo } = responseData;

                if (reset || pageNumber === 0) {
                    // 첫 페이지이거나 리셋 요청인 경우 데이터 교체
                    setData({
                        shelterInfo,
                        animalCases
                    });
                } else {
                    // 아니면 기존 content에 새 content 추가
                    setData(prevData => ({
                        shelterInfo,
                        animalCases: {
                            ...animalCases,
                            content: [...prevData.animalCases.content, ...animalCases.content]
                        }
                    }));
                }
            }

            setInitialized(true);
        } catch (err) {
            console.error('보호소 동물 목록 조회 실패:', err);
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [shelterId, pageSize]);

    // 초기 데이터 로드
    useEffect(() => {
        if (!initialized && shelterId) {
            fetchData(initialPage, true);
        }
    }, [initialized, shelterId, initialPage, fetchData]);

    // 페이지 변경 시 데이터 로드
    useEffect(() => {
        if (initialized && page > initialPage) {
            fetchData(page);
        }
    }, [page, initialPage, initialized, fetchData]);

    // 다음 페이지 로드
    const nextPage = useCallback(() => {
        if (!loading && !data.animalCases.last) {
            setPage(prevPage => prevPage + 1);
        }
    }, [loading, data.animalCases.last]);

    // 페이지 리셋
    const resetPage = useCallback(() => {
        setPage(initialPage);
        setInitialized(false);
    }, [initialPage]);

    // 데이터 새로고침
    const refresh = useCallback(() => {
        fetchData(initialPage, true);
    }, [initialPage, fetchData]);

    return {
        shelterInfo: data.shelterInfo,
        animalCases: data.animalCases,
        loading,
        error,
        nextPage,
        resetPage,
        refresh
    };
};

export default useShelterAnimalCases;