import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import axios from 'axios';

const OAuth2RedirectHandler = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const response = await axios.get(
                    `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v2/auth/me`,
                    { withCredentials: true }
                );

                if (response.data.data) {
                    const loginUserInfo = {
                        email: response.data.data.email,
                        nickname: response.data.data.nickname,
                        profileImage: response.data.data.profileImage
                    };

                    localStorage.setItem('userInfo', JSON.stringify(loginUserInfo));
                    localStorage.setItem('isLoggedIn', 'true');

                    await navigate('/', { replace: true });
                }
            } catch (error) {
                console.error('소셜 로그인 처리 중 오류 발생:', error);
                await navigate('/login-pet', { replace: true });
            }
        };

        fetchUserInfo();
    }, []);

    return <div>로그인 처리중...</div>;
};

export default OAuth2RedirectHandler;