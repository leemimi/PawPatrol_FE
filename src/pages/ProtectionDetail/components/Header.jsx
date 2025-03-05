import React from 'react';
import { ArrowLeft } from 'lucide-react';

const Header = ({ navigate }) => {
    return (
        <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-10">
            <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-1 text-orange-400 hover:text-orange-500 transition-colors"
                    >
                        <ArrowLeft size={24} strokeWidth={2.5} />
                    </button>
                    <h1 className="text-lg font-bold text-orange-900">
                        상세 정보
                    </h1>
                </div>
            </div>
        </header>
    );
};

export default Header;