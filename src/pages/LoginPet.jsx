import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import puppyLogo from '../assets/images/pet.png';

const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        console.log('Login attempt:', { email, password });
    };

    const handleClickSignUp = () => {
        navigate('/sign-up');
    };


    return (
        <div className="min-h-screen bg-orange-50 flex flex-col items-center justify-center p-4">
            {/* Logo Section */}
            <div className="w-full max-w-md flex flex-col items-center mb-8">
                <div className="relative mb-2">
                    <img
                        src={puppyLogo}
                        alt="PawPatrol Logo"
                        className="w-90 h-90"
                    />
                    <h1 className="text-2xl font-bold text-orange-900 absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-orange-50 px-2">
                        PawPatrol
                    </h1>
                </div>
                <p className="text-orange-700 text-sm">우리 모두의 든든한 발자국</p>
            </div>

            {/* Login Form */}
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 space-y-6">
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <input
                            type="email"
                            placeholder="이메일"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-orange-500"
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            placeholder="비밀번호"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-orange-500"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-orange-500 text-white py-3 rounded-xl font-medium hover:bg-orange-600 transition-colors"
                    >
                        로그인
                    </button>
                </form>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">또는</span>
                    </div>
                </div>

                {/* Social Login Buttons */}
                <div className="space-y-3">
                    <button className="w-full bg-yellow-400 text-yellow-900 py-3 rounded-xl font-medium hover:bg-yellow-500 transition-colors flex items-center justify-center gap-2">
                        카카오로 시작하기
                    </button>
                    <button className="w-full bg-white border border-gray-200 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                        Google로 시작하기
                    </button>
                </div>

                {/* Bottom Links */}
                <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
                    <button className="hover:text-orange-500">비밀번호 찾기</button>
                    <span>•</span>
                    <button
                        className="hover:text-orange-500"
                        onClick={handleClickSignUp}
                    >
                        회원가입
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginScreen;