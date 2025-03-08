import axios from 'axios'; // axios를 import합니다.

export const PetApiService = {
  // 위치 기반 펫 데이터 조회
  async fetchPetsByLocation(position, range) {
    const apiUrl = `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/lost-foundposts/map?latitude=${position.lat}&longitude=${position.lng}&radius=${range * 1000}`;

    try {
      const response = await axios.get(apiUrl, {
        credentials: 'include',
      });

      if (response.data.resultCode === "200") {
        return response.data.data.map(post => {
          const isLostPost = post.lostTime !== null;

          const imageUrl = post.images && post.images.length > 0
            ? post.images[0].path
            : '/api/placeholder/160/160'; // Fallback if no images are found

          return {
            id: post.foundId,
            content: post.content,
            status: post.status,
            image: imageUrl,
            time: isLostPost
              ? post.lostTime
              : (post.findTime ? new Date(post.findTime).toLocaleString() : ''),
            location: post.location || '위치 정보 없음', // Added fallback
            position: {
              lat: post.latitude,
              lng: post.longitude
            },
            pet: {
              animalType: post.pet?.animalType || '', // Safely handle undefined
              breed: post.pet?.breed || '', // Safely handle undefined
              size: post.pet?.size || '', // Safely handle undefined
              healthCondition: post.pet?.healthCondition || '정보 없음', // Safely handle undefined
              feature: post.pet?.feature || '특징 없음', // Safely handle undefined
              estimatedAge: post.pet?.estimatedAge || '정보 없음', // Safely handle undefined
              imageUrl: post.pet?.imageUrl || '/api/placeholder/160/160' // Safely handle undefined
            },
            postType: isLostPost ? 'LOST' : 'FOUND',
            author: {
              nickname: post.author?.nickname || '익명', // Safely handle undefined
              profileImageUrl: post.author?.profileImageUrl || '/api/placeholder/160/160' // Safely handle undefined
            },
            animalType: post.animalType
          };
        });
      }

      return [];
    } catch (error) {
      console.error('Failed to fetch pets:', error);
      return [];
    }
  },



  // 커뮤니티 글 조회
  async fetchCommunityPosts(page = 0, size = 10) {
    const apiUrl = `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/lost-foundposts`;

    try {
      const response = await axios.get(apiUrl, {
        params: {
          page: page,
          size: size
        },
        credentials: 'include',
      });

      if (response.data.resultCode === "200") {
        return {
          content: response.data.data.content.map(post => {
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
              createdAt: post.createdAt,
              updatedAt: post.updatedAt
            };
          }),
          pagination: {
            totalPages: response.data.data.totalPages,
            totalElements: response.data.data.totalElements,
            size: response.data.data.size,
            number: response.data.data.number,
            first: response.data.data.first,
            last: response.data.data.last
          }
        };
      }

      return { content: [], pagination: {} };
    } catch (error) {
      console.error('Failed to fetch community posts:', error);
      throw error;
    }
  },

  // 특정 게시글 상세 조회
  async fetchPostDetail(postId) {
    const apiUrl = `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/lost-foundposts/${postId}`;

    try {
      const response = await axios.get(apiUrl, {
        credentials: 'include',
      });

      if (response.data.resultCode === "200") {
        const post = response.data.data;
        const isLostPost = post.lostTime !== null;

        const imageUrls = post.images && post.images.length > 0
          ? post.images.map(img => img.path)
          : ['/api/placeholder/160/160'];

        // 중요: foundId와 id 모두 보존
        return {
          id: post.id,
          foundId: post.foundId,
          content: post.content,
          status: post.status,
          images: imageUrls,
          mainImage: imageUrls[0],
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
          createdAt: post.createdAt,
          updatedAt: post.updatedAt
        };
      }

      throw new Error('Failed to fetch post details');
    } catch (error) {
      console.error('Failed to fetch post details:', error);
      throw error;
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