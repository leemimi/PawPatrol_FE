import { useState, useEffect } from 'react';
import { Home, Users, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Footer = () => {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // 컴포넌트 마운트 시 인증 상태 확인
    useEffect(() => {
        checkAuthStatus();
    }, []);


    // API를 통한 인증 상태 확인
    const checkAuthStatus = async () => {
        try {
            const isLoggedIn = localStorage.getItem('isLoggedIn');

            if (!isLoggedIn) {
                setIsAuthenticated(false);
                return;
            }

            // API 요청으로 토큰 유효성 검증
            await axios.get(`${import.meta.env.VITE_CORE_FRONT_BASE_URL}/api/v2/auth/me`, {
                withCredentials: true // 쿠키 포함 요청
            });

            // 요청이 성공하면 인증된 상태
            setIsAuthenticated(true);
            localStorage.setItem('isLoggedIn', 'true');
            return true;

        } catch (error) {
            // 401 에러 등이 발생하면 인증되지 않은 상태
            console.error('인증 확인 중 오류 발생:', error);
            setIsAuthenticated(false);
            localStorage.removeItem('isLoggedIn');
            return false;
        }
    };

    const handleMyPageClick = async () => {
        try {
            // 클릭 시점에 최신 인증 상태 확인
            const isAuth = await checkAuthStatus();

            // 업데이트된 인증 상태에 따라 페이지 이동
            if (isAuth) {
                navigate('/mypage');
            } else {
                navigate('/login-pet');
            }
        } catch (error) {
            console.error('인증 확인 중 오류 발생:', error);
            navigate('/login-pet'); // 오류 발생 시 로그인 페이지로 이동
        }
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 z-20 bg-white border-t-2 border-orange-100">
            <div className="flex items-center justify-around px-2 py-1">
                <button
                    onClick={() => navigate('/')}
                    className="flex flex-col items-center gap-1 p-2 text-orange-400 hover:text-orange-500 transition-colors"
                >
                    <Home size={20} strokeWidth={2.5} />
                    <span className="text-xs font-medium">홈</span>
                </button>
                <button
                    onClick={() => navigate('/community')}
                    className="flex flex-col items-center gap-1 p-2 text-orange-400 hover:text-orange-500 transition-colors"
                >
                    <Users size={20} strokeWidth={2.5} />
                    <span className="text-xs font-medium">커뮤니티</span>
                </button>

                <button
                    onClick={handleMyPageClick}
                    className="flex flex-col items-center gap-1 p-2 text-orange-400 hover:text-orange-500 transition-colors"
                >
                    <User size={20} strokeWidth={2.5} />
                    <span className="text-xs font-medium">마이페이지</span>
                </button>
            </div>
        </div>
    );
};

export default Footer;