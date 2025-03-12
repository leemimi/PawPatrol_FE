// 1. api.service.js - API 호출 관련 기능 분리
import axios from 'axios';

export const PetApiService = {
  // 위치 기반 펫 데이터 조회
  async fetchPetsByLocation(position, range) {
    const apiUrl = `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/lost-foundposts/map`;

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
        console.log("response.data.data", response.data.data)
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
            reward: post.reward,
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
  },

  // 보상금 게시글 목록 조회
  async fetchRewardPosts(page = 0, size = 20) {
    const apiUrl = `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/lost-foundposts/reward-list`;

    try {
      const response = await axios.get(apiUrl, {
        params: {
          page: page,
          size: size
        },
        credentials: 'include',
      });

      if (response.data.resultCode === "200") {
        // 페이지 정보와 게시글 목록 반환
        const posts = response.data.data.content.map(post => {
          const imageUrl = post.images && post.images.length > 0
            ? post.images[0].path
            : null;

          // 반려동물 이름 가져오기 (pet 객체가 있는 경우)
          const petName = post.pet ? post.pet.name : '이름 없음';

          return {
            id: post.id,
            content: post.content,
            petName: petName,
            imageUrl: imageUrl,
            reward: post.reward,
            lostTime: post.lostTime,
            location: post.location,
            animalType: post.animalType
          };
        });

        return {
          content: posts,
          totalPages: response.data.data.totalPages,
          totalElements: response.data.data.totalElements,
          currentPage: response.data.data.number
        };
      }

      return { content: [], totalPages: 0, totalElements: 0, currentPage: 0 };
    } catch (error) {
      console.error('보상금 게시글 목록 조회 실패:', error);
      return { content: [], totalPages: 0, totalElements: 0, currentPage: 0 };
    }
  }
};

// 직선 거리 계산 헬퍼 함수
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // 지구 반경 (km)
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // 킬로미터 단위 거리
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

