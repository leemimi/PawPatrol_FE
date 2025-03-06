import axios from 'axios';

// 전역 axios 설정
axios.defaults.baseURL = `${import.meta.env.VITE_CORE_FRONT_BASE_URL}`;
axios.defaults.withCredentials = true;

// 인터셉터를 적용하지 않을 URL 목록 정의
const BLACK_LIST_URL = [
    '/api/v2/auth'
];

// 블랙리스트 확인 함수 개선
const isNotBlackListed = (url) => {
    if (!url) return false; // URL이 없으면 인터셉터 적용 안함
    return !BLACK_LIST_URL.some(blackUrl => url.includes(blackUrl));
};

// 인터셉터 로직 개선
axios.interceptors.response.use(
    (response) => {
        // HTML 응답인지 확인 (로그인 페이지로 리다이렉트된 경우)
        if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
            // 로그인 상태가 아닌 것으로 판단
            localStorage.removeItem('accessToken');
            window.location.href = '/';
            return Promise.reject('Not authenticated - Redirecting');
        }
        return response;
    },
    (error) => {
        // URL 확인 및 로깅
        console.log("Error URL:", error.config?.url);

        // 블랙리스트 확인 및 401 에러 처리
        if (error.config && isNotBlackListed(error.config.url)) {
            if (error.response && error.response.status === 401) {
                // 로컬 스토리지 정리
                localStorage.removeItem('accessToken');

                // 리다이렉트 전에 Promise 반환하여 인터셉터 종료
                window.location.href = '/';
                return Promise.reject('Unauthorized - Redirecting');
            }
        }
        return Promise.reject(error);
    }
);