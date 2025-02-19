import { useState, useEffect } from 'react';
import kakaoSimpleIcon from '../assets/images/kakaotalk_simple_icon2.png';
import googleSimpleIcon from '../assets/images/google_simple_icon.png';
import naverSimpleIcon from '../assets/images/naver_simple_icon.png';
import githubSimpleIcon from '../assets/images/github_simple_icon.png';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';

const Login = () => {
    const socialLoginForKakaoUrl = import.meta.env.VITE_CORE_API_BASE_URL + `/oauth2/authorization/kakao`;
    const socialLoginForGoogleUrl = import.meta.env.VITE_CORE_API_BASE_URL + `/oauth2/authorization/google`;
    const socialLoginForNaverUrl = import.meta.env.VITE_CORE_API_BASE_URL + `/oauth2/authorization/naver`;
    const socialLoginForGithubUrl = import.meta.env.VITE_CORE_API_BASE_URL + `/oauth2/authorization/github`;
    const redirectUrlAfterSocialLogin = import.meta.env.VITE_CORE_FRONT_BASE_URL;
    const navigate = useNavigate();
    const location = useLocation();
    const setIsLoggedIn = useAuthStore((state) => state.setIsLoggedIn);
    const setUserInfo = useAuthStore((state) => state.setUserInfo);

    const from = location.state?.from?.pathname || '/';

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [saveEmail, setSaveEmail] = useState(false);

    useEffect(() => {
        const savedEmail = localStorage.getItem('savedEmail');
        if (savedEmail) {
            setEmail(savedEmail);
            setSaveEmail(true);
        }
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/auth/login`,
                {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password })
                }
            );

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('accessToken', data.data.accessToken);
                localStorage.setItem('refreshToken', data.data.refreshToken);
                if (saveEmail) {
                    localStorage.setItem('savedEmail', email);
                } else {
                    localStorage.removeItem('savedEmail');
                }

                setUserInfo(data);
                setIsLoggedIn(true);
                navigate(from, { replace: true });
            } else {
                const errorData = await response.json();
                alert(errorData.msg || '로그인에 실패했습니다.');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('로그인 중 오류가 발생했습니다.');
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-dark text-white">
            <div className="flex-1 flex flex-col justify-center px-4 py-16">
                <div className="max-w-[430px] mx-auto w-full bg-dark-light p-8 rounded-2xl">
                    <div className="text-center mb-12">
                        <h2 className="text-2xl font-semibold">로그인</h2>
                        <p className="text-gray-400 mt-2">환영합니다</p>
                    </div>

                    <form className="space-y-4" onSubmit={handleLogin}>
                        <div className="relative">
                            <input
                                type="email"
                                placeholder="이메일"
                                className="w-full h-12 px-4 bg-dark-lighter border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-white placeholder-gray-400"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <Link
                                to="/find-account"
                                className="absolute right-0 top-0 h-full px-4 flex items-center text-sm text-gray-400 hover:text-primary"
                            >
                                아이디를 잊었나요?
                            </Link>
                        </div>
                        <div className="relative">
                            <input
                                type="password"
                                placeholder="비밀번호"
                                className="w-full h-12 px-4 bg-dark-lighter border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-white placeholder-gray-400"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <Link
                                to="/reset-password"
                                className="absolute right-0 top-0 h-full px-4 flex items-center text-sm text-gray-400 hover:text-primary"
                            >
                                비밀번호를 잊었나요?
                            </Link>
                        </div>
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="saveEmail"
                                checked={saveEmail}
                                onChange={(e) => setSaveEmail(e.target.checked)}
                                className="w-4 h-4 rounded border-gray-400 text-primary focus:ring-primary bg-dark-lighter"
                            />
                            <label htmlFor="saveEmail" className="ml-2 text-sm text-gray-400">
                                이메일 저장
                            </label>
                        </div>
                        <button
                            type="submit"
                            className="w-full h-12 bg-primary text-white rounded-lg font-medium hover:bg-opacity-90 transition-colors"
                        >
                            로그인
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-gray-400">
                            아직 회원이 아니신가요?{' '}
                            <Link to="/signup" className="text-primary font-medium hover:text-opacity-90">
                                회원가입
                            </Link>
                        </p>
                    </div>

                    <div className="mt-8">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-700"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-dark-light text-gray-400">간편 로그인</span>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-center space-x-4">
                            <a
                                href={`${socialLoginForKakaoUrl}?redirectUrl=${redirectUrlAfterSocialLogin}`}
                                className="w-14 h-14 flex items-center justify-center hover:opacity-80 transition-opacity"
                            >
                                <img src={kakaoSimpleIcon} alt="카카오 로그인" className="w-14 h-14" />
                            </a>

                            <a
                                href={`${socialLoginForNaverUrl}?redirectUrl=${redirectUrlAfterSocialLogin}`}
                                className="w-14 h-14 flex items-center justify-center hover:opacity-80 transition-opacity"
                            >
                                <img src={naverSimpleIcon} alt="네이버 로그인" className="w-14 h-14" />
                            </a>

                            <a
                                href={`${socialLoginForGoogleUrl}?redirectUrl=${redirectUrlAfterSocialLogin}`}
                                className="w-14 h-14 flex items-center justify-center hover:opacity-80 transition-opacity"
                            >
                                <img src={googleSimpleIcon} alt="구글 로그인" className="w-14 h-14" />
                            </a>

                            <a
                                href={`${socialLoginForGithubUrl}?redirectUrl=${redirectUrlAfterSocialLogin}`}
                                className="w-14 h-14 flex items-center justify-center hover:opacity-80 transition-opacity"
                            >
                                <img src={githubSimpleIcon} alt="깃허브 로그인" className="w-14 h-14" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;