import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import axios from 'axios';

const OAuth2RedirectHandler = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const response = await axios.get(
                    'http://localhost:8090/api/v2/auth/me',
                    { withCredentials: true }
                );

                if (response.data.data) {
                    const loginUserInfo = {
                        email: response.data.data.email,
                        nickname: response.data.data.nickname
                    };

                    localStorage.setItem('userInfo', JSON.stringify(loginUserInfo));
                    localStorage.setItem('isLoggedIn', 'true');

                    navigate('/', { replace: true });
                }
            } catch (error) {
                console.error('소셜 로그인 처리 중 오류 발생:', error);
                navigate('/login-pet', { replace: true });
            }
        };

        fetchUserInfo();
    }, []);

    return <div>로그인 처리중...</div>;
};

export default OAuth2RedirectHandler;