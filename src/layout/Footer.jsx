import React from 'react';
import { Home, Users, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
    const navigate = useNavigate();
    const handleMyPageClick = () => {
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        if (isLoggedIn === 'true') {
            navigate('/mypage');
        } else {
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
                    onClick={() => navigate('/protection')}
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