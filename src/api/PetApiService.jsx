// 1. api.service.js - API 호출 관련 기능 분리
import axios from 'axios';

export const PetApiService = {
  // 위치 기반 펫 데이터 조회
  async fetchPetsByLocation(position, range) {
    const apiUrl = 'http://localhost:8090/api/v1/lost-foundposts/map';

    try {
      const response = await axios.get(apiUrl, {
        params: {
          latitude: position.lat,
          longitude: position.lng,
          radius: range * 1000
        },
        credentials: 'include',
      });

      if (response.data.resultCode === "200") {
        return response.data.data.map(post => {
          const isLostPost = post.lostTime !== null; 
          
          const imageUrl = post.images && post.images.length > 0 
            ? post.images[0].path 
            : '/api/placeholder/160/160';
          
          return {
            id: post.id,
            content: post.content,
            status: post.status,
            image: imageUrl,
            time: isLostPost 
              ? post.lostTime 
              : (post.findTime ? new Date(post.findTime).toLocaleString() : ''),
            location: post.location,
            position: {
              lat: post.latitude,
              lng: post.longitude
            },
            pet: post.pet, 
            postType: isLostPost ? 'LOST' : 'FOUND',
            author: post.author,
            distanceFromCenter: calculateDistance(
              position.lat, position.lng,
              post.latitude, post.longitude
            )
          };
        });
      }
      
      return [];
    } catch (error) {
      console.error('Failed to fetch pets:', error);
      return [];
    }
  }
};

// 직선 거리 계산 헬퍼 함수
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

// 2. location.service.js - 위치 관련 기능 분리
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

  // 지도 중심 위치로 이동
  moveMapToPosition(map, circleRef, position) {
    if (!map) return;
    
    const moveLatLon = new window.kakao.maps.LatLng(position.lat, position.lng);
    map.setCenter(moveLatLon);
    
    if (circleRef.current) {
      circleRef.current.setPosition(moveLatLon);
    }
  }
};