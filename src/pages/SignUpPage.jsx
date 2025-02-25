import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SignUp = () => {
    const navigate = useNavigate();
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [isEmailSent, setIsEmailSent] = useState(false); // 이메일 발송 상태 
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        passwordConfirm: '',
        nickname: '',
    });

    // 이메일 인증
    const handleEmailVerification = async () => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v2/auth/email/verification-code`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: formData.email
                    }),
                }
            );

            const responseData = await response.json(); // Json형태의 응답을 받기 위한 설정

            if (responseData.statusCode === 200) {
                alert('인증 이메일이 발송되었습니다. 이메일을 확인해주세요.');
                setIsEmailSent(true);
            } else if (responseData.statusCode === 400) {
                alert(responseData.message);
            } else {
                alert('이메일 인증 발송에 실패했습니다.');
            }
        } catch (error) {
            console.error('Email verification error:', error);
            alert('이메일 인증 중 오류가 발생했습니다.');
        }
    };

    // 이메일 인증 코드 확인
    const handleVerifyCode = async () => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v2/auth/email/verify`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: formData.email,
                        code: verificationCode
                    }),
                }
            );

            if (response.ok) {
                alert('이메일 인증이 완료되었습니다.');
                setIsEmailVerified(true);
            } else {
                const errorData = await response.json();
                alert(errorData.msg || '인증 코드가 일치하지 않습니다.');
            }
        } catch (error) {
            console.error('Verification code error:', error);
            alert('인증 코드 확인 중 오류가 발생했습니다.');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isEmailVerified) {
            alert('이메일 인증이 필요합니다.');
            return;
        }

        if (formData.password !== formData.passwordConfirm) {
            alert('비밀번호가 일치하지 않습니다.');
            return;
        }

        try {
            const response = await fetch(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v2/auth/sign-up`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: formData.email,
                        password: formData.password,
                        nickname: formData.nickname,
                    }),
                }
            );

            if (response.ok) {
                alert('회원가입이 완료되었습니다.');
                navigate('/login-pet');
            } else {
                const errorData = await response.json();
                alert(errorData.msg || '회원가입에 실패했습니다.');
            }
        } catch (error) {
            console.error('SignUp error:', error);
            alert('회원가입 중 오류가 발생했습니다.');
        }
    };

    return (
        <div className="min-h-screen bg-orange-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md">
                <h2 className="text-3xl font-bold text-orange-900 text-center mb-8">회원가입</h2>

                <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* 사용할 아이디, 이메일 인증 필드 */}
                        <div className="flex space-x-2 relative">
                            <input
                                type="email"
                                name="email"
                                placeholder="이메일"
                                value={formData.email}
                                onChange={handleChange}
                                disabled={isEmailSent}
                                className={`w-full px-4 py-3 rounded-xl border focus:outline-none 
                        ${isEmailSent
                                        ? 'bg-gray-100 border-gray-300 text-gray-500'
                                        : 'bg-gray-50 border-gray-200 focus:border-orange-500'}`}
                                required
                            />
                            {!isEmailVerified ? (
                                <button
                                    type="button"
                                    onClick={handleEmailVerification}
                                    disabled={!formData.email || isEmailSent}
                                    className={`px-4 py-3 text-white rounded-xl transition-colors inline-flex items-center whitespace-nowrap
                                    ${!formData.email || isEmailSent
                                            ? 'bg-gray-400'
                                            : 'bg-orange-500 hover:bg-orange-600'}`}
                                >
                                    인증
                                </button>
                            ) : (
                                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-600 font-medium">
                                    인증완료
                                </span>
                            )}
                        </div>
                        {/* 인증 코드 입력 필드 */}
                        {isEmailSent && !isEmailVerified && (
                            <div className="flex space-x-2">
                                <input
                                    type="text"
                                    placeholder="인증 코드 입력"
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value)}
                                    disabled={isEmailVerified}
                                    className={`w-full px-4 py-3 rounded-xl border focus:outline-none
                            ${isEmailVerified
                                            ? 'bg-gray-100 border-gray-300 text-gray-500'
                                            : 'bg-gray-50 border-gray-200 focus:border-orange-500'}`}
                                />
                                <button
                                    type="button"
                                    onClick={handleVerifyCode}
                                    disabled={!verificationCode || isEmailVerified}
                                    className="px-4 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 disabled:bg-gray-400 inline-flex items-center whitespace-nowrap"
                                >
                                    확인
                                </button>
                            </div>
                        )}
                        <div>
                            <input
                                type="password"
                                name="password"
                                placeholder="비밀번호"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-orange-500"
                                required
                            />
                        </div>
                        <div>
                            <input
                                type="password"
                                name="passwordConfirm"
                                placeholder="비밀번호 확인"
                                value={formData.passwordConfirm}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-orange-500"
                                required
                            />
                        </div>
                        <div>
                            <input
                                type="text"
                                name="nickname"
                                placeholder="닉네임"
                                value={formData.nickname}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-orange-500"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-orange-500 text-white py-3 rounded-xl font-medium hover:bg-orange-600 transition-colors"
                        >
                            가입하기
                        </button>
                    </form>

                    <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
                        <button
                            onClick={() => navigate('/login-pet')}
                            className="hover:text-orange-500"
                        >
                            이미 계정이 있으신가요? 로그인하기
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignUp;