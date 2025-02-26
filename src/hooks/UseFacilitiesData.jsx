import { useState, useCallback, useEffect } from 'react';
import { FacilitiesApiService } from '../api/FacilityApiService';

export const useFacilitiesData = (initialPosition, initialRange) => {
    const [facilities, setFacilities] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // 시설 데이터 가져오기 함수
    const fetchFacilities = useCallback(async (position, range) => {
        setIsLoading(true);
        setError(null);
        try {
            const fetchedFacilities = await FacilitiesApiService.fetchFacilitiesByLocation(
                position, 
                range
            );
            setFacilities(fetchedFacilities);
        } catch (err) {
            console.error('Failed to fetch facilities:', err);
            setError(err);
            setFacilities([]);
        } finally {
            setIsLoading(false);
        }
    }, []); // Add proper dependencies if needed

    // Stable debounce function reference
    const debounceRef = useCallback((func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }, []);

    // Create debouncedFetchFacilities with proper memoization
    const debouncedFetchFacilities = useCallback(
        debounceRef(fetchFacilities, 300),
        [fetchFacilities, debounceRef]
    );

    return {
        facilities,
        fetchFacilities,
        debouncedFetchFacilities,
        isLoading,
        error
    };
};