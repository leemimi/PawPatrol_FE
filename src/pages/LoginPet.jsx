import React, { useState } from 'react';
import { replace, useNavigate } from 'react-router-dom';
import puppyLogo from '../assets/images/pet.png';
import axios from 'axios';

const LoginScreen = () => {
    const socialLoginForKakaoUrl = `${import.meta.env.VITE_CORE_API_BASE_URL}/oauth2/authorization/kakao`; // 카카오 로그인 요청 URL
    const socialLoginForGoogleUrl = `${import.meta.env.VITE_CORE_API_BASE_URL}/oauth2/authorization/google`; // 구글 로그인 요청 URL
    const socialLoginForNaverUrl = `${import.meta.env.VITE_CORE_API_BASE_URL}/oauth2/authorization/naver`; // 네이버 로그인 요청 URL
    const redirectUrlAfterSocialLogin = `${import.meta.env.VITE_CORE_FRONT_BASE_URL}/oauth2/redirect`;   // 소셜 로그인 후 리다이렉트 URL
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        const request = {
            email: email,
            password: password
        }

        try {
            const login_response = await axios.post(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v2/auth/login`,
                request
            )

            if (login_response.data.statusCode === 200 || login_response.data.statusCode === "200") {
                const response = await axios.get(   // 로그인 유저 정보(내 정보) 가져오기 api, 로그인 상태로 전환하는데 씀
                    `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v2/auth/me`,
                    { withCredentials: true }
                )

                // 로그인 성공시
                if (response) {
                    const loginUserInfo = {
                        email: response.data.data.email,
                        nickname: response.data.data.nickname
                    };

                    localStorage.setItem('userInfo', JSON.stringify(loginUserInfo));
                    localStorage.setItem('isLoggedIn', 'true');

                    // 메인 페이지로 이동
                    navigate('/', { replace: true });
                }
            }
        } catch (error) {
            alert('로그인 실패');
        }
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
                    <a
                        href={`${socialLoginForKakaoUrl}?redirectUrl=${redirectUrlAfterSocialLogin}`}
                        className="w-full bg-yellow-400 text-yellow-900 py-3 rounded-xl font-medium hover:bg-yellow-500 transition-colors flex items-center justify-center gap-2"
                    >
                        카카오로 시작하기
                    </a>
                    <a
                        href={`${socialLoginForGoogleUrl}?redirectUrl=${redirectUrlAfterSocialLogin}`}
                        className="w-full bg-white border border-gray-200 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                        Google로 시작하기
                    </a>
                    <a
                        href={`${socialLoginForNaverUrl}?redirectUrl=${redirectUrlAfterSocialLogin}`}
                        className="w-full bg-white border border-gray-200 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                        네이버로 시작하기
                    </a>
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