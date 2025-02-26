// useGeolocation.js - 위치 관련 훅
import { useState, useCallback } from 'react';
import { LocationService } from '../api/LocationService';

export const useGeolocation = (map, circleRef, onPositionChange) => {
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState(null);

  // 현재 위치 가져오기
  const getCurrentLocation = useCallback(async () => {
    setIsLocating(true);
    setError(null);
    
    try {
      const position = await LocationService.getCurrentPosition();
      
      // 지도 이동
      LocationService.moveMapToPosition(map, circleRef, position);
      
      // 위치 변경 콜백 호출
      if (onPositionChange) {
        onPositionChange(position);
      }
      
      return position;
    } catch (err) {
      setError(err);
      return null;
    } finally {
      setIsLocating(false);
    }
  }, [map, circleRef, onPositionChange]);

  return {
    getCurrentLocation,
    isLocating,
    error
  };
};