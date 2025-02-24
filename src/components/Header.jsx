import { useState } from 'react';
import { ChevronLeft, Bell } from 'lucide-react';

export const Header = ({ onModeChange, isLostMode }) => {

    const handleModeChange = (mode) => {
        onModeChange(mode);
    };

    return (
        <div className="fixed top-0 left-0 right-0 z-20 bg-white px-2 py-2">
            <div className="flex items-center justify-between">
                <button className="p-2 text-orange-400 hover:text-orange-500 transition-colors">
                    <ChevronLeft size={28} strokeWidth={2.5} />
                </button>
                <div className="flex bg-orange-50 rounded-full p-1">
                    <button
                        className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                            isLostMode 
                                ? 'bg-orange-400 text-white shadow-sm' 
                                : 'text-gray-600 hover:text-gray-800'
                        }`}
                        onClick={() => handleModeChange(true)}
                    >
                        실종 신고 
                    </button>
                    <button
                        className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                            !isLostMode 
                                ? 'bg-orange-400 text-white shadow-sm' 
                                : 'text-gray-600 hover:text-gray-800'
                        }`}
                        onClick={() => handleModeChange(false)}
                    >
                        제보 신고 
                    </button>
                </div>
                <button className="p-2 text-orange-400 hover:text-orange-500 transition-colors">
                    <Bell size={24} strokeWidth={2.5} />
                </button>
            </div>
        </div>
    );
};

export default Header;