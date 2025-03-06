import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import puppyLogo from '../assets/images/pet.png';
import SignUpTypeModal from '../components/SignUpTypeModal';
import axios from 'axios';

const LoginScreen = () => {
    const socialLoginForKakaoUrl = `${import.meta.env.VITE_CORE_API_BASE_URL}/oauth2/authorization/kakao`;
    const socialLoginForGoogleUrl = `${import.meta.env.VITE_CORE_API_BASE_URL}/oauth2/authorization/google`;
    const socialLoginForNaverUrl = `${import.meta.env.VITE_CORE_API_BASE_URL}/oauth2/authorization/naver`;
    const redirectUrlAfterSocialLogin = `${import.meta.env.VITE_CORE_FRONT_BASE_URL}/oauth2/redirect`;

    const [showSignUpModal, setShowSignUpModal] = useState(false); // 모달 표시 상태
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        // 아이디 저장 처리
        if (rememberMe) {
            localStorage.setItem('savedEmail', email);
            localStorage.setItem('rememberMe', 'true');
        } else {
            localStorage.removeItem('savedEmail');
            localStorage.setItem('rememberMe', 'false');
        }

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
                const response = await axios.get(
                    `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v2/auth/me`,
                    { withCredentials: true }
                )

                if (response) {
                    const loginUserInfo = {
                        id: response.data.data.id,
                        email: response.data.data.email,
                        nickname: response.data.data.nickname,
                        profileImage: response.data.data.profileImage,
                        role: response.data.data.role
                    };

                    localStorage.setItem('userInfo', JSON.stringify(loginUserInfo));
                    localStorage.setItem('isLoggedIn', 'true');

                    navigate('/main', { replace: true });
                }
            }
        } catch (error) {
            alert(error.response.data.msg || error.response.data.message);
        }
    };

    const handleClickSignUp = () => {
        setShowSignUpModal(true); // 모달 열기
    };

    useEffect(() => {
        // 로그인 상태 확인
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

        // 이미 로그인되어 있다면 /main으로 리다이렉트
        if (isLoggedIn) {
            navigate('/main', { replace: true });
        }
    }, [navigate]);

    // 컴포넌트 마운트 시 로컬 스토리지에서 저장된 이메일 확인
    useEffect(() => {
        window.scrollTo(0, 0);
        const savedEmail = localStorage.getItem('savedEmail');
        const isRemembered = localStorage.getItem('rememberMe') === 'true';

        if (savedEmail && isRemembered) {
            setEmail(savedEmail);
            setRememberMe(true);
        }
    }, []);

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
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="rememberMe"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                        />
                        <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-600">
                            아이디 저장
                        </label>
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
                    <button
                        className="hover:text-orange-500"
                        onClick={() => navigate('/forgot-password')}
                    >
                        비밀번호 찾기
                    </button>
                    <span>•</span>
                    <button
                        className="hover:text-orange-500"
                        onClick={handleClickSignUp}
                    >
                        회원가입
                    </button>
                </div>
                {/* 회원가입 유형 선택 모달 */}
                {showSignUpModal && (
                    <SignUpTypeModal
                        onClose={() => setShowSignUpModal(false)}
                    />
                )}
            </div>
        </div>
    );
};

export default LoginScreen;