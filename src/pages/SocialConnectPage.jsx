import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import puppyLogo from '../assets/images/pet.png';
import axios from 'axios';

const SocialConnectPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const [tempToken, setTempToken] = useState('');

    useEffect(() => {
        // URL에서 temp_token 파라미터 추출
        const params = new URLSearchParams(location.search);
        const token = params.get('temp_token');
        if (token) {
            setTempToken(token);
        } else {
            navigate('/login', { replace: true });
        }
    }, [location, navigate]);

    const handleConnect = async (e) => {
        e.preventDefault();

        const request = {
            email: email,
            password: password,
            tempToken: tempToken
        }

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v2/auth/connect-social`,
                request,
                { withCredentials: true }
            );

            if (response.data.statusCode === 200) {
                alert('소셜 계정 연동이 완료되었습니다.');

                localStorage.removeItem('userInfo');
                localStorage.removeItem('isLoggedIn');

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
                            email: response.data.data.email,
                            nickname: response.data.data.nickname,
                            profileImage: response.data.data.profileImage,
                            role: response.data.data.role
                        };

                        localStorage.setItem('userInfo', JSON.stringify(loginUserInfo));
                        localStorage.setItem('isLoggedIn', 'true');
                    }
                }
                navigate('/', { replace: true });
            } else {
                alert('계정 연동에 실패했습니다.');
            }
        } catch (error) {
            alert('계정 연동에 실패했습니다.');
        }
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

            {/* Connect Form */}
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 space-y-6">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-gray-900">소셜 계정 연동</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        기존 계정으로 로그인하여 소셜 계정을 연동해주세요.
                    </p>
                </div>

                <form onSubmit={handleConnect} className="space-y-4">
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
                        계정 연동하기
                    </button>
                </form>

                <div className="text-center text-sm">
                    <button
                        onClick={() => navigate('/')}
                        className="text-orange-500 hover:text-orange-600"
                    >
                        로그인 페이지로 돌아가기
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SocialConnectPage;