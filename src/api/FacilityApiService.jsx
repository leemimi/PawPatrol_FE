import axios from 'axios';

export const FacilitiesApiService = {
  // 위치 기반 시설 데이터 조회
  async fetchFacilitiesByLocation(position, range) {
    const apiUrl = 'http://localhost:8090/api/v1/facilities/map';

    try {
      const response = await axios.get(apiUrl, {
        params: {
          latitude: position.lat,
          longitude: position.lng,
          radius: range
        },
        credentials: 'include',
      });

      if (response.data.resultCode === "200") {
        return response.data.data.map(facility => {
          // Placeholder image or default image logic
          const imageUrl = facility.images && facility.images.length > 0 
            ? facility.images[0].path 
            : '/api/placeholder/160/160';
          
          return {
            id: facility.id,
            name: facility.name,
            address: facility.address,
            tel: facility.tel,
            position: {
              lat: facility.latitude,
              lng: facility.longitude
            },
            operatingHours: facility.operatingHours,
            image: imageUrl,
            distanceFromCenter: calculateDistance(
              position.lat, position.lng,
              facility.latitude, facility.longitude
            )
          };
        });
      }
      
      return [];
    } catch (error) {
      console.error('Failed to fetch facilities:', error);
      return [];
    }
  }
};

// 직선 거리 계산 헬퍼 함수 (기존 코드와 동일)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // 지구 반경 (km)
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1); 
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = R * c; // 킬로미터 단위 거리
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180);
}