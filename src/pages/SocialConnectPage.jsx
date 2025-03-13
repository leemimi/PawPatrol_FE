import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import puppyLogo from '../assets/images/hanlogo.png';
import axios from 'axios';
import Swal from 'sweetalert2';

const SocialConnectPage = () => {
    const [error, setError] = useState('');

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
        setError(''); // 에러 상태 초기화

        try {
            // 소셜 계정 연동 API 호출
            const connectResponse = await axios.post(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v2/auth/connect-social`,
                {
                    email: email,
                    password: password,
                    tempToken: tempToken
                },
                { withCredentials: true }
            );

            if (connectResponse.data.statusCode === 200) {
                // 연동 성공 시 사용자 정보 가져오기
                try {
                    const userResponse = await axios.get(
                        `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v2/auth/me`,
                        { withCredentials: true }
                    );

                    if (userResponse.data && userResponse.data.data) {
                        const loginUserInfo = {
                            email: userResponse.data.data.email,
                            nickname: userResponse.data.data.nickname,
                            profileImage: userResponse.data.data.profileImage,
                            role: userResponse.data.data.role
                        };

                        localStorage.setItem('userInfo', JSON.stringify(loginUserInfo));
                        localStorage.setItem('isLoggedIn', 'true');

                        Swal.fire({
                            icon: 'success',
                            title: '소셜 계정 연동 완료',
                            text: '소셜 계정 연동이 완료되었습니다.',
                            confirmButtonText: '확인'
                        });
                        navigate('/', { replace: true });
                    } else {
                        throw new Error('사용자 정보를 가져오는데 실패했습니다.');
                    }
                } catch (userError) {
                    setError('사용자 정보를 가져오는데 실패했습니다. 다시 로그인해주세요.');
                }
            } else {
                setError(connectResponse.data.message || '계정 연동에 실패했습니다.');
            }
        } catch (error) {
            if (error.response) {
                setError(error.response.data.message || '계정 연동에 실패했습니다.');
            } else if (error.request) {
                setError('서버 응답이 없습니다. 네트워크 연결을 확인해주세요.');
            } else {
                setError('요청 설정 중 오류가 발생했습니다.');
            }
        }
    };

    return (
        <div className="min-h-screen bg-[#FFF5E6] flex flex-col items-center justify-center p-4">
            {/* Connect Form */}
            <div className="w-full max-w-md space-y-6">
                {/* Logo Section */}
                <div className="w-full max-w-md flex flex-col items-center mb-8">
                    <div className="relative mb-2">
                        <img
                            src={puppyLogo}
                            alt="PawPatrol Logo"
                            className="w-48 h-48 mb-2"
                        />
                        {/* <h1 className="text-2xl font-bold text-orange-900 absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-orange-50 px-2">
                            PawPatrol
                        </h1> */}
                    </div>
                    {/* <p className="text-orange-700 text-sm">우리 모두의 든든한 발자국</p> */}
                </div>
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
                    {error && (
                        <div className="text-red-500 text-sm">{error}</div>
                    )}
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