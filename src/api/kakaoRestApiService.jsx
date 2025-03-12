import axios from 'axios';

export const KakaoMapApiService = {
    // 좌표를 주소로 변환하는 API
    getAddressFromCoords: async (longitude, latitude) => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/maps/address`, {
                params: { longitude, latitude }
            });
            return response.data;
        } catch (error) {
            console.error('좌표→주소 변환 API 호출 실패:', error);
            throw error;
        }
    }
};