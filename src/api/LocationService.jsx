// location.service.js - 위치 관련 기능 분리 
export const LocationService = {
  // 현재 위치 가져오기
  getCurrentPosition() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser.'));
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Geolocation failed:', error);
          reject(error);
        }
      );
    });
  },
  
  // 지도 중심 위치로 이동 및 마커 업데이트
  moveMapToPosition(map, circleRef, position, updateCenterMarker) {
    if (!map) return;
    
    const moveLatLon = new window.kakao.maps.LatLng(position.lat, position.lng);
    map.setCenter(moveLatLon);
    
    if (circleRef.current) {
      circleRef.current.setPosition(moveLatLon);
    }

    // 현재 위치 마커 업데이트 로직 추가
    if (updateCenterMarker && typeof updateCenterMarker === 'function') {
      updateCenterMarker(position);
    }
  }
};