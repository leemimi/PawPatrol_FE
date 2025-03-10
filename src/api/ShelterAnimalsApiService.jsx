import axios from 'axios';

export const ShelterAnimalsApiService = {
  // 위치 기반 보호소 데이터 조회  (보호 동물 포함)
  async fetchShelters(position, range) {
    const apiUrl = `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/facilities/shelters/map?latitude=${position.lat}&longitude=${position.lng}&radius=${range}`;

    try {
      const response = await axios.get(apiUrl, {
        credentials: 'include',
      });

      if (response.data.resultCode === "200") {
        const sheltersWithAnimals = response.data.data.filter(shelter =>
          shelter.animals && shelter.animals.length > 0
        );

        return sheltersWithAnimals.map(shelter => {
          // 첫 번째 동물의 이미지 URL을 사용하거나 기본 이미지 사용
          const imageUrl = shelter.animals && shelter.animals.length > 0 && shelter.animals[0].imageUrl
            ? shelter.animals[0].imageUrl
            : '/api/placeholder/160/160';

          return {
            id: shelter.id,
            content: shelter.name, // 보호소 이름을 content로 사용
            status: 'SHELTER_ANIMAL', // 상태를 SHELTER_ANIMAL로 고정
            image: imageUrl,
            time: '', // 보호소는 시간 정보가 없음
            location: shelter.address || '위치 정보 없음',
            position: {
              lat: shelter.latitude,
              lng: shelter.longitude
            },
            pet: {
              animalType: shelter.animals && shelter.animals.length > 0
                ? shelter.animals[0].animalType
                : '',
              breed: shelter.animals && shelter.animals.length > 0
                ? shelter.animals[0].breed
                : '',
              // 기타 필요한 pet 정보
            },
            postType: 'SHELTER_ANIMAL',
            author: {
              nickname: shelter.memberNickname || '익명',
              profileImageUrl: '/api/placeholder/160/160'
            },
            animalType: shelter.animals && shelter.animals.length > 0
              ? shelter.animals[0].animalType
              : null,
            // 보호소 특화 정보
            shelterInfo: {
              tel: shelter.tel,
              operatingHours: shelter.operatingHours,
              animalCount: shelter.animals ? shelter.animals.length : 0
            }
          };
        });
      }

      return [];
    } catch (error) {
      console.error('Failed to fetch shelters:', error);
      return [];
    }
  }
};