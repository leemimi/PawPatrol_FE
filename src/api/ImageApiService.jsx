import axios from 'axios';

export const ImageApiService = {
    deleteImageByUrl: async (imageUrl) => {
        try {
            const response = await axios.delete(`${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/images/by-url`, {
                params: { imageUrl }
            });
            return response.data;
        } catch (error) {
            console.error('URL로 이미지 삭제 API 호출 실패:', error);
            throw error;
        }
    }
};