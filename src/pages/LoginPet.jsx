import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import puppyLogo from '../assets/images/pet.png';
import SignUpTypeModal from '../components/SignUpTypeModal';
import naverImage from '../assets/images/naver_simple_icon.png';
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

                {/* 소설 로그인 버튼 */}
                <div className="flex justify-center items-center gap-4 my-3">
                    <a
                        href={`${socialLoginForKakaoUrl}?redirectUrl=${redirectUrlAfterSocialLogin}`}
                        className="w-12 h-12 bg-yellow-400 text-yellow-900 rounded-full hover:bg-yellow-500 transition-colors flex items-center justify-center"
                        aria-label="카카오 로그인"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 3C7.03 3 3 6.14 3 10C3 12.08 4.18 13.94 6.04 15.12L5.5 18.68C5.46 18.88 5.56 19.08 5.74 19.18C5.92 19.28 6.14 19.24 6.28 19.1L9.64 16.56C10.38 16.74 11.18 16.84 12 16.84C16.97 16.84 21 13.7 21 9.84C21 5.98 16.97 3 12 3Z" />
                        </svg>
                    </a>
                    <a
                        href={`${socialLoginForGoogleUrl}?redirectUrl=${redirectUrlAfterSocialLogin}`}
                        className="w-12 h-12 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors flex items-center justify-center"
                        aria-label="Google 로그인"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24">
                            <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z" fill="#4285F4" />
                            <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z" fill="#34A853" clip-path="url(#b)" />
                            <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z" fill="#FBBC05" clip-path="url(#c)" />
                            <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z" fill="#EA4335" clip-path="url(#d)" />
                        </svg>
                    </a>
                    <a
                        href={`${socialLoginForNaverUrl}?redirectUrl=${redirectUrlAfterSocialLogin}`}
                        aria-label="네이버 로그인"
                    >
                        <img
                            src={naverImage}
                            alt="네이버"
                            className="w-12 h-12 rounded-full hover:opacity-90 transition-opacity"
                        />
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