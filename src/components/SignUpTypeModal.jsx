import React from 'react';
import { useNavigate } from 'react-router-dom';

const SignUpTypeModal = ({ onClose }) => {
    const navigate = useNavigate();
    
    const handleUserTypeSelect = (type) => {
        onClose();
        if (type === 'user') {
            navigate('/sign-up');
        } else if (type === 'shelter') {
            navigate('/sign-up-shelter');
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">회원 유형 선택</h2>
                    <p className="text-gray-600 mt-2">가입하실 회원 유형을 선택해주세요</p>
                </div>
                
                <div className="space-y-4">
                    <button
                        onClick={() => handleUserTypeSelect('user')}
                        className="w-full bg-orange-100 hover:bg-orange-200 text-orange-800 py-4 px-6 rounded-xl flex items-center justify-between group transition-all"
                    >
                        <div className="flex flex-col items-start">
                            <span className="text-lg font-medium">일반 회원</span>
                            <span className="text-sm text-orange-700">일반 서비스 이용자</span>
                        </div>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-500 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                    
                    <button
                        onClick={() => handleUserTypeSelect('shelter')}
                        className="w-full bg-blue-100 hover:bg-blue-200 text-blue-800 py-4 px-6 rounded-xl flex items-center justify-between group transition-all"
                    >
                        <div className="flex flex-col items-start">
                            <span className="text-lg font-medium">보호소 회원</span>
                            <span className="text-sm text-blue-700">동물 보호소를 운영하시는 분</span>
                        </div>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
                
                <button
                    onClick={onClose}
                    className="mt-6 w-full border border-gray-300 text-gray-700 py-2 rounded-xl hover:bg-gray-50 transition-colors"
                >
                    취소
                </button>
            </div>
        </div>
    );
};

export default SignUpTypeModal;
