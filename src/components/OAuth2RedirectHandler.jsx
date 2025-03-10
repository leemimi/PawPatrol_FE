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
                        profileImage: response.data.data.profileImage,
                        role: response.data.data.role
                    };

                    localStorage.setItem('userInfo', JSON.stringify(loginUserInfo));
                    localStorage.setItem('isLoggedIn', 'true');

                    await navigate('/', { replace: true });
                }
            } catch (error) {
                await navigate('/', { replace: true });
            }
        };

        fetchUserInfo();
    }, []);

    return <div>로그인 처리중...</div>;
};

export default OAuth2RedirectHandler;