import { useState, useEffect } from 'react';
import { Home, Users, User, LifeBuoy, MessageSquare  } from 'lucide-react';
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
    
    return (
        <div className="fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-orange-100">
            <div className="flex justify-between items-center w-full px-5"> {/* px-4에서 px-5로 변경 */}
                <div className="flex-1 flex flex-col items-center py-2.5"> {/* py-2에서 py-2.5로 변경 */}
                    <button
                        onClick={() => navigate('/main')}
                        className="flex flex-col items-center text-orange-400 hover:text-orange-500 transition-colors"
                    >
                        <Home size={22} strokeWidth={2.5} /> {/* size={20}에서 size={22}로 변경 */}
                        <span className="text-[12px] font-medium mt-1.5">홈</span> {/* text-[11px]에서 text-[12px]로, mt-1에서 mt-1.5로 변경 */}
                    </button>
                </div>
                <div className="flex-1 flex flex-col items-center py-2.5"> {/* py-2에서 py-2.5로 변경 */}
                    <button
                        onClick={() => navigate('/rescue')}
                        className="flex flex-col items-center text-orange-400 hover:text-orange-500 transition-colors"
                    >
                        <LifeBuoy size={22} strokeWidth={2.5} /> {/* size={20}에서 size={22}로 변경 */}
                        <span className="text-[12px] font-medium mt-1.5">구조</span> {/* text-[11px]에서 text-[12px]로, mt-1에서 mt-1.5로 변경 */}
                    </button>
                </div>
                <div className="flex-1 flex flex-col items-center py-2.5"> {/* py-2에서 py-2.5로 변경 */}
                    <button
                        onClick={() => navigate('/protection')}
                        className="flex flex-col items-center text-orange-400 hover:text-orange-500 transition-colors"
                    >
                        <Users size={22} strokeWidth={2.5} /> {/* size={20}에서 size={22}로 변경 */}
                        <span className="text-[12px] font-medium mt-1.5">새로운 가족</span> {/* text-[11px]에서 text-[12px]로, mt-1에서 mt-1.5로 변경 */}
                    </button>
                </div>
                <div className="flex-1 flex flex-col items-center py-2.5"> {/* py-2에서 py-2.5로 변경 */}
                    <button
                    onClick={handleChatClick}
                    className="flex flex-col items-center text-orange-400 hover:text-orange-500 transition-colors"
                >
                    <MessageSquare size={22} strokeWidth={2.5} /> {/* size={20}에서 size={22}로 변경 */}
                    <span className="text-[12px] font-medium mt-1.5">채팅</span> {/* text-[11px]에서 text-[12px]로, mt-1에서 mt-1.5로 변경 */}
                </button>
                </div>
                <div className="flex-1 flex flex-col items-center py-2.5"> {/* py-2에서 py-2.5로 변경 */}
                    <button
                        onClick={handleMyPageClick}
                        className="flex flex-col items-center text-orange-400 hover:text-orange-500 transition-colors"
                    >
                        <User size={22} strokeWidth={2.5} /> {/* size={20}에서 size={22}로 변경 */}
                        <span className="text-[12px] font-medium mt-1.5">마이페이지</span> {/* text-[11px]에서 text-[12px]로, mt-1에서 mt-1.5로 변경 */}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Footer;