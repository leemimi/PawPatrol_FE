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
            // API 요청으로 토큰 유효성 검증
            const response = await axios.get(`${import.meta.env.VITE_CORE_API_BASE_URL}/api/v2/auth/me`, {
                withCredentials: true
            });

            // 응답이 성공적이고 사용자 데이터가 있는 경우에만 인증 상태로 설정
            if (response.data.data.email) {
                setIsAuthenticated(true);
                localStorage.setItem('isLoggedIn', 'true');
                return true;
            } else {
                setIsAuthenticated(false);
                localStorage.removeItem('isLoggedIn');
                return false;
            }
        } catch (error) {
            console.error('인증 확인 중 오류 발생:', error);
            setIsAuthenticated(false);
            localStorage.removeItem('isLoggedIn');
            return false;
        }
    };

    const handleMyPageClick = async () => {
        const isAuth = await checkAuthStatus();
        
        if (isAuth) {
            navigate('/mypage');
        } else {
            // 로컬 스토리지 정리 및 사용자에게 알림
            localStorage.removeItem('isLoggedIn');
            alert('로그인 세션이 만료되었습니다. 다시 로그인해주세요.');
            navigate('/login-pet');
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