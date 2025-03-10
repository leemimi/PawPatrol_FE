import { useState, useCallback, useEffect } from 'react';
import _ from 'lodash';
import { ShelterAnimalsApiService } from '../api/ShelterAnimalsApiService';

export const useShelterAnimalsData = (initialPosition, initialRange) => {
    const [shelters, setShelters] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // 데이터 가져오기 함수
    const fetchShelters = useCallback(async (position, range) => {
        setIsLoading(true);
        setError(null);

        try {
            const data = await ShelterAnimalsApiService.fetchShelters(position, range);
            setShelters(data);
            return data;
        } catch (err) {
            console.error("보호소 데이터 조회 오류:", err);
            setError(err);
            return [];
        } finally {
            setIsLoading(false);
        }
    }, []);

    // 드래그용 디바운스 함수
    const debouncedFetchShelters = useCallback(
        _.debounce((position, range) => {
            fetchShelters(position, range);
        }, 500),
        [fetchShelters]
    );

    // 초기 데이터 로딩
    useEffect(() => {
        if (initialPosition && initialRange) {
            fetchShelters(initialPosition, initialRange);
        }
    }, [initialPosition, initialRange, fetchShelters]);

    return {
        shelters,
        isLoading,
        error,
        fetchShelters,
        debouncedFetchShelters
    };
};