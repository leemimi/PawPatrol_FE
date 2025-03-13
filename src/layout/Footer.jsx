import { useState, useEffect } from 'react';
import { Home, User, MessageSquare, Cat, PawPrint } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const Footer = () => {
    const navigate = useNavigate();
    const location = useLocation(); // 현재 경로 정보 가져오기
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [activeTab, setActiveTab] = useState(''); // 현재 활성화된 탭 상태

    // 컴포넌트 마운트 시 인증 상태 확인 및 현재 경로에 따라 활성 탭 설정
    useEffect(() => {
        checkAuthStatus();

        // 현재 경로에 따라 활성 탭 설정
        const path = location.pathname;
        if (path === '/main') {
            setActiveTab('home');
        } else if (path === '/rescue') {
            setActiveTab('rescue');
        } else if (path === '/protection') {
            setActiveTab('protection');
        } else if (path === '/chatlist') {
            setActiveTab('chat');
        } else if (path.includes('/mypage') || path.includes('/admin-dashboard') || path.includes('/shelter-mypage')) {
            setActiveTab('mypage');
        }
    }, [location.pathname]);

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
            setIsAuthenticated(false);
            localStorage.removeItem('isLoggedIn');
            return false;
        }
    };

    const handleMyPageClick = async () => {
        const isAuth = await checkAuthStatus();

        if (isAuth) {
            // 로컬 스토리지에서 사용자 정보 가져오기
            const userInfoStr = localStorage.getItem('userInfo');
            if (userInfoStr) {
                const userInfo = JSON.parse(userInfoStr);

                // 역할에 따라 다른 페이지로 리다이렉트
                if (userInfo.role === 'ROLE_ADMIN') {
                    navigate('/admin-dashboard'); // 관리자 페이지로 이동
                } else if (userInfo.role === 'ROLE_SHELTER') {
                    navigate('/shelter-mypage'); // 보호소 전용 마이페이지
                } else {
                    navigate('/mypage'); // 일반 사용자 마이페이지
                }
            } else {
                navigate('/mypage'); // 기본 마이페이지
            }
        } else {
            // 로컬 스토리지 정리 및 사용자에게 알림
            localStorage.removeItem('isLoggedIn');
            navigate('/');
        }
    };

    const handleChatClick = async () => {
        const isAuth = await checkAuthStatus();

        if (isAuth) {
            navigate('/chatlist');
        } else {
            localStorage.removeItem('isLoggedIn');
            navigate('/');
        }
    };

    // 탭 스타일 함수: 활성화된 탭에 따라 스타일 반환
    const getTabStyle = (tabName) => {
        return "flex flex-col items-center text-orange-400 hover:text-orange-500 transition-colors";
    };

    // 아이콘 컨테이너 스타일
    const getIconContainerStyle = (tabName) => {
        if (activeTab === tabName) {
            return "flex items-center justify-center bg-orange-500 rounded-full p-1";
        }
        return "";
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-orange-100">
            <div className="flex justify-between items-center w-full px-5">
                <div className="flex-1 flex flex-col items-center py-2">
                    <button
                        onClick={() => navigate('/main')}
                        className={getTabStyle('home')}
                    >
                        <div className={getIconContainerStyle('home')}>
                            <Home size={22} strokeWidth={2.5} className={activeTab === 'home' ? 'text-white' : ''} />
                        </div>
                        <span className="text-[12px] font-medium mt-1">홈</span>
                    </button>
                </div>
                <div className="flex-1 flex flex-col items-center py-2.5">
                    <button
                        onClick={() => navigate('/rescue')}
                        className={getTabStyle('rescue')}
                    >
                        <div className={getIconContainerStyle('rescue')}>
                            <Cat size={22} strokeWidth={2.5} className={activeTab === 'rescue' ? 'text-white' : ''} />
                        </div>
                        <span className="text-[12px] font-medium mt-1">구조</span>
                    </button>
                </div>
                <div className="flex-1 flex flex-col items-center py-2.5">
                    <button
                        onClick={() => navigate('/protection')}
                        className={getTabStyle('protection')}
                    >
                        <div className={getIconContainerStyle('protection')}>
                            <PawPrint size={22} strokeWidth={2.5} className={activeTab === 'protection' ? 'text-white' : ''} />
                        </div>
                        <span className="text-[12px] font-medium mt-1">입양/임시보호</span>
                    </button>
                </div>
                <div className="flex-1 flex flex-col items-center py-2.5">
                    <button
                        onClick={handleChatClick}
                        className={getTabStyle('chat')}
                    >
                        <div className={getIconContainerStyle('chat')}>
                            <MessageSquare size={22} strokeWidth={2.5} className={activeTab === 'chat' ? 'text-white' : ''} />
                        </div>
                        <span className="text-[12px] font-medium mt-1">채팅</span>
                    </button>
                </div>
                <div className="flex-1 flex flex-col items-center py-2.5">
                    <button
                        onClick={handleMyPageClick}
                        className={getTabStyle('mypage')}
                    >
                        <div className={getIconContainerStyle('mypage')}>
                            <User size={22} strokeWidth={2.5} className={activeTab === 'mypage' ? 'text-white' : ''} />
                        </div>
                        <span className="text-[12px] font-medium mt-1">마이페이지</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Footer;