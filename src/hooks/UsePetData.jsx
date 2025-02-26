// usePetData.js - 펫 데이터 관리 훅
import { useState, useCallback, useEffect } from 'react';
import _ from 'lodash';
import { PetApiService } from '../api/PetApiService';

export const usePetData = (initialPosition, initialRange) => {
  const [pets, setPets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // 데이터 가져오기 함수
  const fetchPets = useCallback(async (position, range) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await PetApiService.fetchPetsByLocation(position, range);
      setPets(data);
      return data;
    } catch (err) {
      setError(err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 드래그용 디바운스 함수
  const debouncedFetchPets = useCallback(
    _.debounce((position, range) => {
      fetchPets(position, range);
    }, 500),
    [fetchPets]
  );

  // 초기 데이터 로딩
  useEffect(() => {
    if (initialPosition && initialRange) {
      fetchPets(initialPosition, initialRange);
    }
  }, [initialPosition, initialRange, fetchPets]);

  return {
    pets,
    isLoading,
    error,
    fetchPets,
    debouncedFetchPets
  };
};
