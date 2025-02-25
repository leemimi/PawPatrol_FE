import axios from 'axios';

// 전역 axios 설정
axios.defaults.baseURL = `${import.meta.env.VITE_CORE_FRONT_BASE_URL}`;
axios.defaults.withCredentials = true;

// 전역 인터셉터 설정
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('userInfo');
            localStorage.removeItem('isLoggedIn');
            window.location.href = '/login-pet';
            return Promise.reject('Unauthorized');
        }
        return Promise.reject(error);
    }
);