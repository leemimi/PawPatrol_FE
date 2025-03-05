import React from 'react';
import { Home, Clock } from 'lucide-react';

const ActionButtons = ({ handleApplyClick }) => {
    return (
        <div className="p-5 border-t border-gray-100 space-y-3">
            <button
                className="w-full py-3 flex justify-center items-center gap-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors"
                onClick={() => handleApplyClick('tempProtection')}
            >
                <Clock size={18} />
                임시보호 신청하기
            </button>
            <button
                className="w-full py-3 flex justify-center items-center gap-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                onClick={() => handleApplyClick('adoption')}
            >
                <Home size={18} />
                입양 신청하기
            </button>
        </div>
    );
};

export default ActionButtons;