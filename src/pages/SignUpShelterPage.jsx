import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DaumPostcode from 'react-daum-postcode';


const SignUpShelter = () => {
    const navigate = useNavigate();
    const [openPostcode, setOpenPostcode] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [address, setAddress] = useState('');
    const [detailAddress, setDetailAddress] = useState('');
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [isEmailSent, setIsEmailSent] = useState(false); // 이메일 발송 상태 
    const [isBusinessVerified, setIsBusinessVerified] = useState(false);
    const [businessRegistrationNumber, setBusinessRegistrationNumber] = useState('');
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        passwordConfirm: '',
        nickname: '',
        owner: '',
        startDate: ''    // 개업일자
    });

    // 사업자등록번호 검증 함수
    const handleBusinessRegistrationVerification = async () => {
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v2/auth/validate/business-number`,
                {
                    businessNumber: businessRegistrationNumber.replace(/-/g, ''),
                    startDate: startDate.replace(/-/g, ''),
                    owner: formData.owner
                },
                {
                    headers: { 'Content-Type': 'application/json' }
                }
            );

            if (response.data.data.valid) {
                alert('유효한 사업자등록번호입니다.');
                setIsBusinessVerified(true);
            } else {
                alert('유효하지 않은 사업자등록번호입니다.');
                setIsBusinessVerified(false);
            }
        } catch (error) {
            console.error('사업자등록번호 검증 오류:', error);
            alert('검증 중 오류가 발생했습니다.');
            setIsBusinessVerified(false);
        }
    };



    // 주소 선택 이벤트
    const handleComplete = (data) => {
        // 시군구, 동네까지만 필요한 경우 (예: 경기도 시흥시 은행동)
        let selectedAddress = '';

        // 도/시 + 시/군/구 + 동/읍/면 조합
        if (data.sido) selectedAddress += data.sido + ' ';
        if (data.sigungu) selectedAddress += data.sigungu + ' ';
        if (data.bname) selectedAddress += data.bname;

        setAddress(selectedAddress);
        setOpenPostcode(false);
    };


    // 버튼 클릭 이벤트, 주소입력
    const handleToggle = () => {
        setOpenPostcode(current => !current);
    };

    // 이메일 인증
    const handleEmailVerification = async () => {
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v2/auth/email/verification-code`,
                {
                    email: formData.email
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    withCredentials: true // 쿠키 포함 설정
                }
            );

            if (response.data.statusCode === 200) {
                alert('인증 이메일이 발송되었습니다. 이메일을 확인해주세요.');
                setIsEmailSent(true);
            } else if (response.data.statusCode === 400) {
                alert(response.data.message);
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
            const response = await axios.post(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v2/auth/email/verify`,
                {
                    email: formData.email,
                    code: verificationCode
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    withCredentials: true // 쿠키 포함 설정
                }
            );

            alert('이메일 인증이 완료되었습니다.');
            setIsEmailVerified(true);
        } catch (error) {
            console.error('Verification code error:', error);
            if (error.response && error.response.data) {
                alert(error.response.data.msg || '인증 코드가 일치하지 않습니다.');
            } else {
                alert('인증 코드 확인 중 오류가 발생했습니다.');
            }
        }
    };

    // 회원가입
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

        if (!isBusinessVerified) {
            alert('사업자등록번호 검증이 필요합니다.');
            return;
        }

        if (formData.password !== formData.passwordConfirm) {
            alert('비밀번호가 일치하지 않습니다.');
            return;
        }

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v2/auth/shelter/sigh-up`,
                {
                    email: formData.email,
                    password: formData.password,
                    owner: formData.owner,
                    nickname: formData.nickname,
                    address: `${address} ${detailAddress}`.trim(),
                    startDate: startDate.replace(/-/g, ''), // YYYYMMDD 형식으로 변환
                    businessRegistrationNumber: businessRegistrationNumber.replace(/-/g, ''), // '-' 제거
                },
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true // 쿠키 포함 설정
                }
            );

            alert('회원가입이 완료되었습니다.');
            navigate('/login-pet');
        } catch (error) {
            console.error('SignUp error:', error);
            if (error.response && error.response.data) {
                alert(error.response.data.msg || '회원가입에 실패했습니다.');
            } else {
                f
                alert('회원가입 중 오류가 발생했습니다.');
            }
        }
    };


    return (
        <div className="min-h-screen bg-orange-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md">
                <h2 className="text-3xl font-bold text-orange-900 text-center mb-8">보호소 회원가입</h2>

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
                                placeholder="회사명"
                                value={formData.nickname}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-orange-500"
                                required
                            />
                        </div>

                        <div className="relative">
                            <input
                                type="text"
                                name="address"
                                placeholder="주소 검색 (예: 서울 강남구 역삼동)"
                                value={address}
                                readOnly
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-orange-500"
                                required
                            />
                            <button
                                type="button"
                                onClick={handleToggle}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 px-3 py-1 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600"
                            >
                                검색
                            </button>
                        </div>
                        {/* 우편번호 검색 팝업 */}
                        {openPostcode && (
                            <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                                <div className="bg-white rounded-lg p-4 w-full max-w-md relative">
                                    <button
                                        onClick={() => setOpenPostcode(false)}
                                        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                                    >
                                        ✕
                                    </button>
                                    <DaumPostcode
                                        onComplete={handleComplete}
                                        style={{ height: '400px' }}
                                    />
                                </div>
                            </div>

                        )}
                        <input
                            type="text"
                            name="detailAddress"
                            placeholder="상세주소"
                            value={detailAddress}
                            onChange={(e) => setDetailAddress(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-orange-500"
                        />
                        {/* 대표자명 입력 필드 */}
                        <div>
                            <input
                                type="text"
                                name="owner"
                                placeholder="대표자명"
                                value={formData.owner}
                                onChange={handleChange}
                                disabled={isBusinessVerified}
                                className={`w-full px-4 py-3 rounded-xl border focus:outline-none 
            ${isBusinessVerified
                                        ? 'bg-gray-100 border-gray-300 text-gray-500'
                                        : 'bg-gray-50 border-gray-200 focus:border-orange-500'}`}
                                required
                            />
                        </div>
                        {/* 개업일자 입력 필드 */}
                        <div>
                            <input
                                type="text"
                                name="startDate"
                                placeholder="개업일자 (YYYYMMDD)"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                disabled={isBusinessVerified}
                                className={`w-full px-4 py-3 rounded-xl border focus:outline-none 
            ${isBusinessVerified
                                        ? 'bg-gray-100 border-gray-300 text-gray-500'
                                        : 'bg-gray-50 border-gray-200 focus:border-orange-500'}`}
                                required
                            />
                        </div>

                        {/* 사업자등록번호 입력 필드 */}
                        <div className="relative">
                            <input
                                type="text"
                                name="businessRegistrationNumber"
                                placeholder="사업자등록번호"
                                value={businessRegistrationNumber}
                                onChange={(e) => setBusinessRegistrationNumber(e.target.value)}
                                disabled={isBusinessVerified}
                                className={`w-full px-4 py-3 rounded-xl border focus:outline-none 
            ${isBusinessVerified
                                        ? 'bg-gray-100 border-gray-300 text-gray-500'
                                        : 'bg-gray-50 border-gray-200 focus:border-orange-500'}`}
                                required
                            />
                            {isBusinessVerified && (
                                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-600 font-medium">
                                    인증완료
                                </span>
                            )}
                        </div>

                        {/* 사업자등록번호 검증 버튼 */}
                        {!isBusinessVerified && (
                            <button
                                type="button"
                                onClick={handleBusinessRegistrationVerification}
                                className="w-full bg-blue-500 text-white py-3 rounded-xl font-medium hover:bg-blue-600 transition-colors"
                            >
                                사업자등록번호 검증하기
                            </button>
                        )}


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

export default SignUpShelter;