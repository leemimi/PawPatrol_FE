import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DaumPostcode from 'react-daum-postcode';
import ShelterSearchModal from '../components/ShelterSearchModal';



const SignUpShelter = () => {
    const [isComposing, setIsComposing] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showSearchResults, setShowSearchResults] = useState(false);
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
        startDate: '',    // 개업일자
        shelterName: ''
    });
    // 보호소 검색 모달 상태
    const [showShelterModal, setShowShelterModal] = useState(false);
    const [selectedShelter, setSelectedShelter] = useState(null);

    // 보호소 검색 함수
    // 보호소 검색 함수
    const searchShelters = async (searchTerm) => {
        // 인자가 없으면 formData에서 가져옴
        const term = searchTerm || formData.shelterName.trim();
        if (!term) return;

        setIsLoading(true);
        setShowSearchResults(true);

        try {
            const response = await axios.get(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v2/auth/shelters?keyword=${term}`,
                { withCredentials: true }
            );

            setSearchResults(response.data.data || []);
        } catch (error) {
            console.error('보호소 검색 오류:', error);
            alert('보호소 검색 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };



    // 보호소 선택 핸들러
    const handleSelectShelter = (shelter) => {
        setSelectedShelter(shelter);
        setFormData(prev => ({
            ...prev,
            shelterName: shelter.name,
            shelterId: shelter.id,
            shelterAddress: shelter.address,
            shelterTel: shelter.tel
        }));
        setAddress(shelter.address.split(' ').slice(0, 3).join(' ')); // 주소 기본 부분
        setDetailAddress(shelter.address.split(' ').slice(3).join(' ')); // 상세 주소 부분

        // 검색 결과창 닫기
        setShowSearchResults(false);
    };

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
                alert(error.response.data.message || '인증 코드가 일치하지 않습니다.');
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
                    nickname: formData.shelterName,
                    address: `${address} ${detailAddress}`.trim(),
                    startDate: startDate.replace(/-/g, ''), // YYYYMMDD 형식으로 변환
                    businessRegistrationNumber: businessRegistrationNumber.replace(/-/g, ''), // '-' 제거
                    shelterId: formData.shelterId,
                    shelterTel: formData.shelterTel
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
                alert(error.response.data.message || '회원가입에 실패했습니다.');
            } else {
                alert('회원가입 중 오류가 발생했습니다.');
            }
        }
    };

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);


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

                        {/* 보호소 검색 필드 추가 */}
                        <div>
                            <div className="relative mb-4">
                                <input type="text"
                                    id="shelterName"
                                    name="shelterName"
                                    placeholder="보호소 이름 검색"
                                    value={formData.shelterName}
                                    onChange={(e) => {
                                        // 원래 값 그대로 저장 (trim 적용하지 않음)
                                        handleChange(e);

                                        // 검색어가 있을 경우에만 디바운스 검색 실행
                                        const searchTerm = e.target.value;

                                        if (window.searchTimer) clearTimeout(window.searchTimer);

                                        if (searchTerm) {
                                            window.searchTimer = setTimeout(() => {
                                                // 검색 실행 시에만 trim 적용
                                                searchShelters(searchTerm.trim());
                                            }, 200);
                                        } else {
                                            setShowSearchResults(false);
                                        }
                                    }}
                                    // 입력 필드에 다음 속성 추가
                                    onCompositionStart={() => setIsComposing(true)}
                                    onCompositionEnd={(e) => {
                                        setIsComposing(false);
                                        // 조합이 완료된 후 검색 실행
                                        if (e.target.value.trim()) {
                                            searchShelters(e.target.value.trim());
                                        }
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                                            searchShelters(e.target.value.trim());
                                        }
                                    }}
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-orange-500"
                                    required
                                />
                                <button
                                    onClick={() => searchShelters(formData.shelterName.trim())}
                                    type="button"
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 px-3 py-1 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600"
                                >
                                    검색
                                </button>
                            </div>

                            {/* 검색 결과 표시 영역 */}
                            {showSearchResults && (
                                <div className="max-h-60 overflow-y-auto mb-4 border border-gray-200 rounded-xl">
                                    {isLoading ? (
                                        <p className="text-center py-2">검색 중...</p>
                                    ) : searchResults.length > 0 ? (
                                        <div>
                                            <ul className="divide-y divide-gray-200">
                                                {searchResults.map((shelter) => (
                                                    <li
                                                        key={shelter.id}
                                                        onClick={() => handleSelectShelter(shelter)}
                                                        className="py-3 px-2 hover:bg-gray-50 cursor-pointer"
                                                    >
                                                        <div className="font-semibold">{shelter.name}</div>
                                                        <div className="text-sm text-gray-600">{shelter.address}</div>
                                                        <div className="text-sm text-gray-600">{shelter.tel}</div>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ) : (
                                        <div className="text-center py-4">
                                            <p className="text-gray-500 mb-3">검색 결과가 없습니다.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* 원하는 보호소가 없을 경우를 위한 버튼 */}
                        <div className="text-center py-3 border-t border-gray-200">
                            <p className="text-gray-500 mb-2">원하는 보호소가 없으신가요?</p>
                            <button
                                type="button"
                                onClick={() => setShowShelterModal(true)}
                                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                            >
                                보호소 직접 등록
                            </button>
                        </div>
                        <input
                            type="text"
                            name="address"
                            placeholder="주소"
                            value={address + (detailAddress ? ' ' + detailAddress : '')}
                            readOnly
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none"
                            required
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

                        <input
                            type="hidden"
                            name="shelterId"
                            value={formData.shelterId || ''}
                        />
                        <input
                            type="hidden"
                            name="shelterTel"
                            value={formData.shelterTel || ''}
                        />


                        <button
                            type="submit"
                            className="w-full bg-orange-500 text-white py-3 rounded-xl font-medium hover:bg-orange-600 transition-colors"
                        >
                            가입하기
                        </button>
                    </form>

                    {/* 보호소 등록 모달 */}
                    <ShelterSearchModal
                        isOpen={showShelterModal}
                        onClose={() => setShowShelterModal(false)}
                        onSelectShelter={handleSelectShelter}
                    />

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