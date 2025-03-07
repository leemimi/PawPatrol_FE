import axios from 'axios';

const BASE_URL = `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/protections`;

export const ProtectionApiService = {
    // 모든 보호 동물 목록 조회
    async fetchProtections(page = 0, size = 10, animalType = null, location = null) {
        try {
            const params = { page, size };

            // null이 아닌 파라미터만 추가
            if (animalType) params.animalType = animalType;
            if (location) params.location = location;

            const response = await axios.get(`${BASE_URL}`, {
                params,
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.status === 200 && response.data.resultCode === "200") {
                return response.data.data;
            }

            return { content: [], totalElements: 0, last: true };
        } catch (error) {
            console.error('보호 동물 목록 조회 오류:', error);
            throw error;
        }
    },

    // 보호 동물 상세 조회
    async fetchProtectionDetail(id) {
        try {
            const response = await axios.get(`${BASE_URL}/${id}`, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.status === 200 && response.data.resultCode === "200") {
                return response.data.data;
            }

            throw new Error(response.data.message || '데이터를 불러오는데 실패했습니다.');
        } catch (error) {
            console.error('보호 동물 상세 조회 오류:', error);
            throw error;
        }
    },

    // 보호/입양 신청하기
    async applyForProtection(animalId, data) {
        try {
            const response = await axios.post(
                `${BASE_URL}/${animalId}/apply`,
                data,
                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );

            if (response.status === 200 && response.data.resultCode === "200") {
                return response.data.data;
            }

            throw new Error(response.data.message || '신청 중 오류가 발생했습니다.');
        } catch (error) {
            console.error('보호 신청 오류:', error);
            throw error;
        }
    },

    // 내가 등록한 보호 동물 목록
    async fetchMyRegisteredAnimals(page = 0, size = 10) {
        try {
            const response = await axios.get(
                `${BASE_URL}/my-cases`,
                {
                    params: { page, size },
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );

            if (response.status === 200 && response.data.resultCode === "200") {
                return response.data.data;
            }

            return { content: [], totalElements: 0, last: true };
        } catch (error) {
            console.error('내 등록 동물 목록 조회 오류:', error);
            throw error;
        }
    },

    // 나의 보호 신청 목록
    async fetchMyApplications(page = 0, size = 10) {
        try {
            const response = await axios.get(
                `${BASE_URL}/my-protections`,
                {
                    params: { page, size },
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );

            if (response.status === 200 && response.data.resultCode === "200") {
                return response.data.data;
            }

            return { content: [], totalElements: 0, last: true };
        } catch (error) {
            console.error('내 신청 목록 조회 오류:', error);
            throw error;
        }
    },

    // 보호 동물 등록
    async registerAnimal(formData) {
        try {
            const response = await axios.post(
                `${BASE_URL}`,
                formData,
                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    }
                }
            );

            if (response.status === 200 && response.data.resultCode === "200") {
                return response.data.data;
            }

            throw new Error(response.data.message || '등록 중 오류가 발생했습니다.');
        } catch (error) {
            console.error('동물 등록 오류:', error);
            throw error;
        }
    },

    // 보호 동물 정보 수정
    async updateAnimal(id, formData) {
        try {
            const response = await axios.put(
                `${BASE_URL}/${id}`,
                formData,
                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    }
                }
            );

            if (response.status === 200 && response.data.resultCode === "200") {
                return response.data.data;
            }

            throw new Error(response.data.message || '수정 중 오류가 발생했습니다.');
        } catch (error) {
            console.error('동물 정보 수정 오류:', error);
            throw error;
        }
    },

    // 보호 동물 삭제
    async deleteAnimal(id) {
        try {
            const response = await axios.patch(
                `${BASE_URL}/${id}`,
                {},
                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );

            if (response.status === 200 && response.data.resultCode === "200") {
                return true;
            }

            throw new Error(response.data.message || '삭제 중 오류가 발생했습니다.');
        } catch (error) {
            console.error('동물 삭제 오류:', error);
            throw error;
        }
    },

    // 신청 승인하기
    async approveProtection(protectionId) {
        try {
            const response = await axios.patch(
                `${BASE_URL}/${protectionId}/accept`,
                {},
                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );

            if (response.status === 200 && response.data.resultCode === "200") {
                return true;
            }

            throw new Error(response.data.message || '승인 중 오류가 발생했습니다.');
        } catch (error) {
            console.error('신청 승인 오류:', error);
            throw error;
        }
    },

    // 신청 거절하기
    async rejectProtection(protectionId, rejectReason) {
        try {
            const response = await axios.patch(
                `${BASE_URL}/${protectionId}/reject`,
                { rejectReason },
                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );

            if (response.status === 200 && response.data.resultCode === "200") {
                return true;
            }

            throw new Error(response.data.message || '거절 중 오류가 발생했습니다.');
        } catch (error) {
            console.error('신청 거절 오류:', error);
            throw error;
        }
    },

    // 신청 취소하기
    async cancelApplication(protectionId) {
        try {
            const response = await axios.patch(
                `${BASE_URL}/${protectionId}/cancel`,
                {},
                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );

            if (response.status === 200 && response.data.resultCode === "200") {
                return true;
            }

            throw new Error(response.data.message || '취소 중 오류가 발생했습니다.');
        } catch (error) {
            console.error('신청 취소 오류:', error);
            throw error;
        }
    }
};