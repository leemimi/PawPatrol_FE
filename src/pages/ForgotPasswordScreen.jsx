import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import puppyLogo from '../assets/images/pet.png';
import axios from 'axios';

const ForgotPasswordScreen = () => {
    const [email, setEmail] = useState('');
    const [step, setStep] = useState(1); // 1: 이메일 입력, 2: 인증코드 입력, 3: 새 비밀번호 설정, 4: 완료
    const [verificationCode, setVerificationCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [continuationToken, setContinuationToken] = useState('');
    const navigate = useNavigate();

    // 이메일로 비밀번호 재설정 요청
    const handleRequestReset = async (e) => {
        e.preventDefault();
        if (!email) {
            setError('이메일을 입력해주세요.');
            return;
        }

        try {
            setIsLoading(true);
            setError('');
            
            const response = await axios.post(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v2/auth/password/reset`,
                { email }
            );

            if (response.data.statusCode === 200) {
                setContinuationToken(response.data.data.continuationToken);
                setStep(2);
            }
        } catch (error) {
            setError(error.response?.data?.message || '비밀번호 재설정 요청 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    // 인증 코드 확인
    const handleVerifyCode = async (e) => {
        e.preventDefault();
        if (!verificationCode) {
            setError('인증 코드를 입력해주세요.');
            return;
        }

        try {
            setIsLoading(true);
            setError('');
            
            const response = await axios.post(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v2/auth/password/reset/verify`,
                { 
                    email,
                    verificationCode,
                    continuationToken
                }
            );
            
            if (response.data.statusCode === 200) {
                setContinuationToken(response.data.data.continuationToken);
                setStep(3);
            }
        } catch (error) {
            setError(error.response?.data?.message || '인증 코드 확인 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    // 새 비밀번호 설정
    const handleResetPassword = async (e) => {
        e.preventDefault();
        
        if (!newPassword || !confirmPassword) {
            setError('모든 필드를 입력해주세요.');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            setError('비밀번호가 일치하지 않습니다.');
            return;
        }
        
        if (newPassword.length < 8) {
            setError('비밀번호는 8자 이상이어야 합니다.');
            return;
        }

        try {
            setIsLoading(true);
            setError('');
            
            const response = await axios.post(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v2/auth/password/reset/new`,
                { 
                    email,
                    newPassword,
                    confirmPassword,
                    continuationToken
                }
            );
            
            if (response.data.statusCode === 200) {
                setStep(4);
            }
        } catch (error) {
            setError(error.response?.data?.message || '비밀번호 변경 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
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

            {/* Form Container */}
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 space-y-6">
                <h2 className="text-2xl font-bold text-center text-gray-800">
                    {step === 1 && '비밀번호 찾기'}
                    {step === 2 && '인증 코드 확인'}
                    {step === 3 && '새 비밀번호 설정'}
                    {step === 4 && '비밀번호 변경 완료'}
                </h2>

                {/* Step 1: 이메일 입력 */}
                {step === 1 && (
                    <form onSubmit={handleRequestReset} className="space-y-4">
                        <div>
                            <input
                                type="email"
                                placeholder="가입한 이메일 주소"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-orange-500"
                            />
                        </div>
                        
                        {error && (
                            <div className="text-red-500 text-sm">{error}</div>
                        )}
                        
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-orange-500 text-white py-3 rounded-xl font-medium hover:bg-orange-600 transition-colors disabled:bg-orange-300"
                        >
                            {isLoading ? '처리 중...' : '인증 코드 받기'}
                        </button>
                        
                        <div className="text-center">
                            <button 
                                type="button" 
                                onClick={() => navigate('/')}
                                className="text-sm text-gray-600 hover:text-orange-500"
                            >
                                로그인 화면으로 돌아가기
                            </button>
                        </div>
                    </form>
                )}

                {/* Step 2: 인증 코드 입력 */}
                {step === 2 && (
                    <form onSubmit={handleVerifyCode} className="space-y-4">
                        <p className="text-sm text-gray-600 text-center">
                            {email}로 전송된 인증 코드를 입력해주세요.
                        </p>
                        
                        <div>
                            <input
                                type="text"
                                placeholder="인증 코드 6자리"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value)}
                                maxLength={6}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-orange-500"
                            />
                        </div>
                        
                        {error && (
                            <div className="text-red-500 text-sm">{error}</div>
                        )}
                        
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-orange-500 text-white py-3 rounded-xl font-medium hover:bg-orange-600 transition-colors disabled:bg-orange-300"
                        >
                            {isLoading ? '처리 중...' : '인증 코드 확인'}
                        </button>
                        
                        <div className="text-center">
                            <button 
                                type="button" 
                                onClick={() => setStep(1)}
                                className="text-sm text-gray-600 hover:text-orange-500"
                            >
                                이메일 다시 입력하기
                            </button>
                        </div>
                    </form>
                )}

                {/* Step 3: 새 비밀번호 설정 */}
                {step === 3 && (
                    <form onSubmit={handleResetPassword} className="space-y-4">
                        <div>
                            <input
                                type="password"
                                placeholder="새 비밀번호 (8자 이상)"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-orange-500"
                            />
                        </div>
                        
                        <div>
                            <input
                                type="password"
                                placeholder="새 비밀번호 확인"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-orange-500"
                            />
                        </div>
                        
                        {error && (
                            <div className="text-red-500 text-sm">{error}</div>
                        )}
                        
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-orange-500 text-white py-3 rounded-xl font-medium hover:bg-orange-600 transition-colors disabled:bg-orange-300"
                        >
                            {isLoading ? '처리 중...' : '비밀번호 변경하기'}
                        </button>
                    </form>
                )}

                {/* Step 4: 완료 */}
                {step === 4 && (
                    <div className="space-y-6 text-center">
                        <div className="flex justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        
                        <p className="text-gray-700">
                            비밀번호가 성공적으로 변경되었습니다.
                        </p>
                        
                        <button
                            onClick={() => navigate('/')}
                            className="w-full bg-orange-500 text-white py-3 rounded-xl font-medium hover:bg-orange-600 transition-colors"
                        >
                            로그인 화면으로 이동
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ForgotPasswordScreen;
