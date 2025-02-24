import React from 'react';
import { ChevronLeft, Search, Dog, Heart, Home, Users, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Header = ({ title, showBack = true, showSearch = true }) => {
    const navigate = useNavigate();

    return (
        <div className="fixed top-0 left-0 right-0 z-20 bg-white px-4 py-3 flex items-center justify-between border-b border-orange-100">
            {showBack ? (
                <button 
                    onClick={() => navigate(-1)}
                    className="p-2 text-orange-400 hover:text-orange-500 transition-colors"
                >
                    <ChevronLeft size={28} strokeWidth={2.5} />
                </button>
            ) : (
                <div className="w-12"></div>
            )}
            
            <h1 className="text-lg font-bold text-orange-900 flex items-center gap-2">
                <Dog className="text-orange-400" size={20} />
                <span>{title}</span>
            </h1>

            {showSearch ? (
                <button 
                    onClick={() => navigate('/search')}
                    className="p-2 text-orange-400 hover:text-orange-500 transition-colors"
                >
                    <Search size={24} strokeWidth={2.5} />
                </button>
            ) : (
                <div className="w-12"></div>
            )}
        </div>
    );
};

export default Header;