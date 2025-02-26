import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import defaultImage from '../assets/images/default.png';
import PetRegisterModal from '../components/PetRegisterModal.jsx';
import PetTypeSelectModal from '../components/PetTypeSelectModal';
import PetEditModal from '../components/PetEditModal.jsx';
import { replace, useNavigate } from 'react-router-dom';
import axios from 'axios';

// 실종 신고글 더미 데이터
const dummyReports = [
    {
        id: 1,
        title: "강아지를 찾습니다 - 서울 강남구",
        createdAt: "2025-02-15T14:30:00",
        status: "searching"
    },
    {
        id: 2,
        title: "푸들 실종 - 부산 해운대구",
        createdAt: "2025-02-17T09:15:00",
        status: "searching"
    },
    {
        id: 3,
        title: "말티즈 찾아요 - 대구 수성구",
        createdAt: "2025-02-18T16:45:00",
        status: "found"
    }
];

// 실종 제보글 더미 데이터
const dummyWitnesses = [
    {
        id: 1,
        title: "강아지 목격 - 서울 송파구",
        createdAt: "2025-02-16T11:20:00",
        location: "올림픽공원 근처"
    },
    {
        id: 2,
        title: "비숑 목격 제보 - 인천 연수구",
        createdAt: "2025-02-17T15:40:00",
        location: "송도 센트럴파크"
    },
    {
        id: 3,
        title: "진도믹스 발견 - 경기도 성남시",
        createdAt: "2025-02-19T10:30:00",
        location: "분당 중앙공원"
    }
];

const MyPage = () => {
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedPet, setSelectedPet] = useState(null);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [petToDelete, setPetToDelete] = useState(null);
    const [isPasswordEditing, setIsPasswordEditing] = useState(false);
    const [isPhoneEditing, setIsPhoneEditing] = useState(false);
    const userInfoStr = localStorage.getItem('userInfo');
    const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;
    // const userInfo = useAuthStore((state) => state.userInfo?.data);
    const [activeTab, setActiveTab] = useState('profile');
    const [profileImage, setProfileImage] = useState();
    const [nickname, setNickname] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [myPets, setMyPets] = useState([]);
    // const [myPosts, setMyPosts] = useState({ reports: [], witnesses: [] });
    const navigate = useNavigate();
    const [isTypeSelectOpen, setIsTypeSelectOpen] = useState(false);
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);
    const [myPosts, setMyPosts] = useState({
        reports: dummyReports,
        witnesses: dummyWitnesses
    });


    const [personalInfo, setPersonalInfo] = useState({
        password: '',
        newPassword: '',
        confirmPassword: '',
        address: '',
        phone: '',
        isPhoneVerified: false,
        verificationCode: ''
    });

    // 반려동물 등록용 폼 데이터 추가
    const [petFormData, setPetFormData] = useState({
        animalType: '',  // 고양이 or 강아지
        name: '',   // 이름
        breed: '',  // 품종
        gender: 'M',    // 성별
        size: 'SMALL',  // 크기
        estimatedAge: '',   // 나이
        registrationNo: '', // 동물등록번호
        healthCondition: '',    // 건강상태
        feature: '',    // 특징
        image: null // 사진
    });

    // 수정용 폼 데이터 추가
    const [editPetFormData, setEditPetFormData] = useState({
        animalType: '',
        name: '',
        breed: '',
        gender: 'M',
        size: 'SMALL',
        estimatedAge: '',
        registrationNo: '',
        healthCondition: '',
        feature: '',
        image: null
    });


    // 반려동물 수정 핸들러
    const handleEditPet = (pet) => {
        setSelectedPet(pet);
        setEditPetFormData({
            id: pet?.id,
            estimatedAge: pet?.estimatedAge || '',
            feature: pet?.feature || pet?.characteristics || '',
            size: pet?.size || 'SMALL',
            registrationNo: pet?.registrationNo || '',
            healthCondition: pet?.healthCondition || '',
            image: null
        });
        setIsEditOpen(true);
    };

    // 반려동물 수정 제출 핸들러
    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();

            // id 추가
            formData.append('id', editPetFormData.id);

            // 필수 필드 추가
            formData.append('estimatedAge', editPetFormData.estimatedAge);
            formData.append('feature', editPetFormData.feature);
            formData.append('healthCondition', editPetFormData.healthCondition);
            formData.append('registrationNo', editPetFormData.registrationNo);

            // size 추가 (Enum 타입)
            if (editPetFormData.size) {
                formData.append('size', editPetFormData.size);
            }

            // 이미지 파일이 있는 경우에만 추가
            if (editPetFormData.image) {
                formData.append('imageFile', editPetFormData.image);
            }

            const response = await axios.patch(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v2/members/pets`,
                formData,
                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            if (response.data.statusCode === 200) {
                alert('반려동물 정보가 성공적으로 수정되었습니다.');
                setIsEditOpen(false);
                await fetchMyPets(); // 반려동물 목록 새로고침
            }
        } catch (error) {
            console.error('Error updating pet:', error);
            alert('반려동물 정보 수정 중 오류가 발생했습니다.');
        }
    };

    // 반려동물 삭제 확인 모달 열기
    const handleDeleteConfirm = (pet) => {
        setPetToDelete(pet);
        setIsDeleteConfirmOpen(true);
    };

    // 반려동물 삭제 실행
    const handleDeletePet = async () => {
        try {
            const response = await axios.delete(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v2/members/pets/${petToDelete.id}`,
                {
                    withCredentials: true,
                    data: { id: petToDelete.id }
                }
            );

            if (response.data.statusCode === 200) {
                alert('반려동물이 성공적으로 삭제되었습니다.');
                setIsDeleteConfirmOpen(false);
                setPetToDelete(null);
                await fetchMyPets(); // 반려동물 목록 새로고침
            }
        } catch (error) {
            console.error('Error deleting pet:', error);
            alert('반려동물 삭제 중 오류가 발생했습니다.');
        }
    };

    // 닉네임 변경
    const handleUpdateProfile = async () => {
        try {
            const response = await axios.patch(`${import.meta.env.VITE_CORE_API_BASE_URL}/api/v2/members/profile`, {
                nickname: nickname,
            }, { withCredentials: true })

            if (response.data.statusCode === 200) {
                // 로컬 스토리지의 사용자 정보 업데이트
                const userInfoStr = localStorage.getItem('userInfo');
                if (userInfoStr) {
                    const userInfo = JSON.parse(userInfoStr);
                    userInfo.nickname = nickname;
                    localStorage.setItem('userInfo', JSON.stringify(userInfo));
                }

                // 필요한 경우 상태 업데이트 또는 페이지 리로드
                setIsEditing(false); // 편집 모드 종료
            }
        } catch (error) {
            console.error('Profile update error:', error);
            alert('프로필 업데이트 중 오류가 발생했습니다.');
        }
    };

    // 비밀번호 변경
    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        if (personalInfo.newPassword !== personalInfo.confirmPassword) {
            alert('새 비밀번호가 일치하지 않습니다.');
            return;
        }

        try {
            // 비밀번호 변경 API 호출
            const response = await axios.patch(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v2/members/profile`,
                {
                    currentPassword: personalInfo.currentPassword,
                    newPassword: personalInfo.newPassword,
                    confirmPassword: personalInfo.confirmPassword
                },
                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.statusCode === 200) {
                // 성공 시 처리
                alert('비밀번호가 성공적으로 변경되었습니다.');
                setIsPasswordEditing(false);
                setPersonalInfo({
                    ...personalInfo,
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
            }
        } catch (error) {
            console.error('Password update error:', error);
            alert('비밀번호 변경 중 오류가 발생했습니다.');
        }
    };

    // 전화번호 변경
    const handleUpdatePhone = async () => {
        try {
            // 전화번호 업데이트 API 호출
            // const response = await axios.patch(...);

            // 성공 시 처리
            alert('전화번호가 성공적으로 변경되었습니다.');
            setIsPhoneEditing(false);
        } catch (error) {
            console.error('Phone update error:', error);
            alert('전화번호 변경 중 오류가 발생했습니다.');
        }
    };

    // 반려동물 등록
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();

            // 모든 데이터를 FormData에 추가
            // FormData에 값들 추가
            Object.keys(petFormData).forEach(key => {
                if (key !== 'image') {
                    formData.append(key, petFormData[key]);
                }
            });

            if (petFormData.image) {
                formData.append('imageFile', petFormData.image);
            }

            const response = await axios.post(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v2/members/pets`,
                formData,  // FormData를 직접 전달
                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            if (!response.data.statusCode === 401) {
                throw new Error('반려동물 등록에 실패했습니다.');
            }

            alert('반려동물이 성공적으로 등록되었습니다.');

            // 모달 닫기
            setIsRegisterOpen(false);  // PetRegisterModal 닫기
            await fetchMyPets();
            setPetFormData({  // 폼 초기화
                name: '',
                breed: '',
                gender: 'M',
                size: 'SMALL',
                estimatedAge: '',
                registrationNo: '',
                healthCondition: '',
                feature: '',
                animalType: 'DOG',
                image: null
            });

        } catch (error) {
            console.error('Error:', error);
            alert('반려동물 등록 중 오류가 발생했습니다.');
        }
    };

    // 반려동물 등록 모달 함수 (petType 모달 > 등록 모달)
    const handleTypeSelect = (type) => {
        setPetFormData(prev => ({ ...prev, animalType: type }));
        setIsTypeSelectOpen(false);
        setIsRegisterOpen(true);
    };

    // pets 탭의 반려동물 등록 버튼 클릭 핸들러
    const handlePetRegistrationClick = () => {
        setIsTypeSelectOpen(true);
    };

    // 로그아웃 함수
    const handleLogout = async () => {
        try {
            const response = await axios.post(`${import.meta.env.VITE_CORE_API_BASE_URL}/api/v2/auth/logout`, {
                withCredentials: true
            });

            if (response.data.statusCode === 200) {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('userInfo');
                localStorage.removeItem('isLoggedIn');
                navigate('/login-pet');
            }
        } catch (error) {
            console.error('Logout error:', error);
            alert('로그아웃 중 오류가 발생했습니다.');
        }
    };

    // 프로필 이미지 변경
    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
    
        const formData = new FormData();
        formData.append('file', file);
    
        try {
            const response = await axios.patch(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v2/members/profile`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    },
                    withCredentials: true
                }
            );
    
            if (response.data.statusCode === 200) {
                // 서버에서 반환된 이미지 URL 사용
                const updatedImageUrl = response.data.data.profileImage;
                
                // 상태 업데이트로 화면에 즉시 반영
                setProfileImage(updatedImageUrl);
                
                // 로컬 스토리지의 사용자 정보 업데이트
                const userInfoStr = localStorage.getItem('userInfo');
                if (userInfoStr) {
                    const userInfo = JSON.parse(userInfoStr);
                    userInfo.profileImage = updatedImageUrl;
                    localStorage.setItem('userInfo', JSON.stringify(userInfo));
                }
                
                alert('프로필 이미지가 성공적으로 업데이트되었습니다.');
            }
        } catch (error) {
            console.error('Image upload error:', error);
            alert('이미지 업로드 중 오류가 발생했습니다.');
        }
    };

    // 내 반려동물 리스트 가져오기
    const fetchMyPets = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_CORE_API_BASE_URL}/api/v2/members/pets`, {
                withCredentials: true
            });

            if (response.data.statusCode === 200) {
                setMyPets(response.data.data);
            }
        } catch (error) {
            console.error('Fetch pets error:', error);
        }
    };

    const fetchMyPosts = async () => {
        try {
            const [reportsRes, witnessesRes] = await Promise.all([
                // fetch(
                //     `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/reports/my`,
                //     {
                //         headers: {
                //             Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                //         },
                //     }
                // ),
                // fetch(
                //     `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/witnesses/my`,
                //     {
                //         headers: {
                //             Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                //         },
                //     }
                // )
            ]);

            // if (reportsRes.ok && witnessesRes.ok) {
            //     const [reports, witnesses] = await Promise.all([
            //         reportsRes.json(),
            //         witnessesRes.json()
            //     ]);
            //     setMyPosts({ reports, witnesses });
            // }
        } catch (error) {
            console.error('Fetch posts error:', error);
        }
    };

    useEffect(() => {
        const userInfoStr = localStorage.getItem('userInfo');
        const isLoggedIn = localStorage.getItem('isLoggedIn');

        if (userInfoStr && isLoggedIn === 'true') {
            const userInfo = JSON.parse(userInfoStr);

            // 프로필 이미지 상태 올바르게 설정
            if (userInfo?.profileImage) {
                setProfileImage(userInfo.profileImage);
            } else {
                setProfileImage(defaultImage);
            }

            if (userInfo?.nickname) {
                setNickname(userInfo.nickname);
            }

            fetchMyPets();
        }
    }, []);

    return (
        <div className="min-h-screen bg-[#FFF5E6]">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-8">
                <div className="flex justify-end mb-4">
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                        로그아웃
                    </button>
                </div>
                <div className="flex gap-4 mb-6">
                    <button
                        className={`px-4 py-2 rounded ${activeTab === 'profile'
                            ? 'bg-orange-500 text-white' // primary.main
                            : 'bg-gray-200' // primary.light
                            }`}
                        onClick={() => setActiveTab('profile')}
                    >
                        프로필
                    </button>
                    <button
                        className={`px-4 py-2 rounded ${activeTab === 'pets' ? 'bg-orange-500 text-white' : 'bg-gray-200'}`}
                        onClick={() => setActiveTab('pets')}
                    >
                        반려동물 관리
                    </button>
                    <button
                        className={`px-4 py-2 rounded ${activeTab === 'posts' ? 'bg-orange-500 text-white' : 'bg-gray-200'}`}
                        onClick={() => setActiveTab('posts')}
                    >
                        게시글 관리
                    </button>
                </div>

                {activeTab === 'profile' && (
                    <div className="text-center">
                        <div className="relative w-32 h-32 mx-auto mb-4">
                            <img
                                src={profileImage || defaultImage}
                                alt="Profile"
                                className="w-full h-full rounded-full object-cover"
                                onError={(e) => {
                                    console.error("이미지 로드 실패:", e);
                                    e.target.src = defaultImage;
                                }}
                            />
                            <label className="absolute bottom-0 right-0 bg-orange-500 p-2 rounded-full cursor-pointer">
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                />
                                <svg
                                    className="w-4 h-4 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M12 4v16m8-8H4"
                                    />
                                </svg>
                            </label>
                        </div>

                        {isEditing ? (
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    value={nickname}
                                    onChange={(e) => setNickname(e.target.value)}
                                    className="px-3 py-2 border rounded-md"
                                />
                                <div className="space-x-2">
                                    <button
                                        onClick={handleUpdateProfile}
                                        className="px-4 py-2 bg-orange-500 text-white rounded-md"
                                    >
                                        저장
                                    </button>
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="px-4 py-2 bg-gray-300 rounded-md"
                                    >
                                        취소
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <h2 className="text-xl font-bold mb-2">{userInfo?.nickname}</h2>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="px-4 py-2 bg-gray-100 rounded-md"
                                >
                                    닉네임 변경
                                </button>
                            </div>
                        )}

                        <div className="mt-8 space-y-4">
                            <div className="border-t pt-4">
                                <h3 className="font-bold mb-2">이메일</h3>
                                <p>{userInfo?.email}</p>
                            </div>
                        </div>

                        <div className="mt-8 space-y-6">
                            <div className="border-t pt-4">
                                <h3 className="text-xl font-bold mb-4">개인정보 관리</h3>

                                {/* 비밀번호 변경 섹션 */}
                                <div className="mb-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="text-lg font-semibold">비밀번호 관리</h4>
                                        <button
                                            type="button"
                                            onClick={() => setIsPasswordEditing(prev => !prev)}
                                            className="px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200"
                                        >
                                            {isPasswordEditing ? '취소' : '비밀번호 변경'}
                                        </button>
                                    </div>

                                    {isPasswordEditing && (
                                        <form className="space-y-4 max-w-md mx-auto text-left" onSubmit={handleUpdatePassword}>
                                            <div>
                                                <label className="block text-gray-700 mb-2">현재 비밀번호</label>
                                                <input
                                                    type="password"
                                                    value={personalInfo.currentPassword}
                                                    onChange={(e) => setPersonalInfo({ ...personalInfo, currentPassword: e.target.value })}
                                                    className="w-full px-3 py-2 border rounded-md"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-gray-700 mb-2">새 비밀번호</label>
                                                <input
                                                    type="password"
                                                    value={personalInfo.newPassword}
                                                    onChange={(e) => setPersonalInfo({ ...personalInfo, newPassword: e.target.value })}
                                                    className="w-full px-3 py-2 border rounded-md"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-gray-700 mb-2">새 비밀번호 확인</label>
                                                <input
                                                    type="password"
                                                    value={personalInfo.confirmPassword}
                                                    onChange={(e) => setPersonalInfo({ ...personalInfo, confirmPassword: e.target.value })}
                                                    className="w-full px-3 py-2 border rounded-md"
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                className="w-full px-4 py-2 bg-orange-500 text-white rounded-md mt-2"
                                            >
                                                비밀번호 변경하기
                                            </button>
                                        </form>
                                    )}
                                </div>

                                {/* 전화번호 관리 섹션 */}
                                <div className="border-t pt-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="text-lg font-semibold">전화번호 관리</h4>
                                        <button
                                            type="button"
                                            onClick={() => setIsPhoneEditing(prev => !prev)}
                                            className="px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200"
                                        >
                                            {isPhoneEditing ? '취소' : '전화번호 변경'}
                                        </button>
                                    </div>

                                    {/* 현재 전화번호 표시 */}
                                    {!isPhoneEditing && (
                                        <p className="text-gray-700">
                                            {personalInfo.phone ?
                                                `${personalInfo.phone} ${personalInfo.isPhoneVerified ? '(인증됨)' : '(미인증)'}` :
                                                '등록된 전화번호가 없습니다.'}
                                        </p>
                                    )}

                                    {isPhoneEditing && (
                                        <div className="space-y-4 max-w-md mx-auto text-left">
                                            <div>
                                                <label className="block text-gray-700 mb-2">전화번호</label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="tel"
                                                        value={personalInfo.phone}
                                                        onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                                                        className="flex-1 px-3 py-2 border rounded-md"
                                                        disabled={personalInfo.isPhoneVerified}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={handlePhoneVerification}
                                                        className="px-4 py-2 bg-orange-500 text-white rounded-md"
                                                        disabled={personalInfo.isPhoneVerified}
                                                    >
                                                        인증요청
                                                    </button>
                                                </div>
                                            </div>

                                            {/* 인증번호 입력 */}
                                            {!personalInfo.isPhoneVerified && personalInfo.phone && (
                                                <div>
                                                    <label className="block text-gray-700 mb-2">인증번호</label>
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="text"
                                                            value={personalInfo.verificationCode}
                                                            onChange={(e) => setPersonalInfo({ ...personalInfo, verificationCode: e.target.value })}
                                                            className="flex-1 px-3 py-2 border rounded-md"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={handleVerificationCodeCheck}
                                                            className="px-4 py-2 bg-orange-500 text-white rounded-md"
                                                        >
                                                            확인
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {personalInfo.isPhoneVerified && (
                                                <button
                                                    type="button"
                                                    onClick={handleUpdatePhone}
                                                    className="w-full px-4 py-2 bg-orange-500 text-white rounded-md mt-2"
                                                >
                                                    전화번호 저장하기
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'pets' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">내 반려동물 목록</h2>
                            <button
                                onClick={handlePetRegistrationClick}
                                className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-[#FB8C00]"
                            >
                                반려동물 등록
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {myPets.map(pet => (
                                <div key={pet.id} className="border rounded-lg shadow-sm overflow-hidden">
                                    <img
                                        src={pet.imageUrl}
                                        alt={pet.name}
                                        className="w-full h-48 object-cover"
                                    />
                                    <div className="p-4 space-y-2">
                                        <h3 className="text-xl font-bold">{pet.name}</h3>
                                        <div className="text-gray-600">
                                            <p>품종: {pet.breed}</p>
                                            <p>특징: {pet.characteristics}</p>
                                            <p>크기: {pet.size}</p>
                                            <p>동물등록번호: {pet.registrationNo}</p>
                                        </div>
                                        <div className="flex justify-end space-x-2 mt-4">
                                            <button
                                                onClick={() => handleEditPet(pet)}
                                                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                                            >
                                                수정
                                            </button>
                                            <button
                                                onClick={() => handleDeleteConfirm(pet)}
                                                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                            >
                                                삭제
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <PetTypeSelectModal
                            isOpen={isTypeSelectOpen}
                            onClose={() => setIsTypeSelectOpen(false)}
                            petFormData={petFormData}
                            setPetFormData={setPetFormData}
                            onSelect={handleTypeSelect}
                        />
                        <PetRegisterModal
                            isOpen={isRegisterOpen}
                            onClose={() => setIsRegisterOpen(false)}
                            onSubmit={handleSubmit}
                            petFormData={petFormData}
                            setPetFormData={setPetFormData}
                        />

                        <PetEditModal
                            isOpen={isEditOpen}
                            onClose={() => setIsEditOpen(false)}
                            onSubmit={handleEditSubmit}
                            petFormData={editPetFormData}
                            setPetFormData={setEditPetFormData}
                            pet={selectedPet}
                        />

                        {/* 삭제 확인 모달 */}
                        {isDeleteConfirmOpen && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                <div className="bg-white p-6 rounded-lg w-full max-w-md">
                                    <h3 className="text-xl font-bold mb-4">반려동물 삭제</h3>
                                    <p className="mb-6">
                                        정말로 {petToDelete?.name}을(를) 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                                    </p>
                                    <div className="flex justify-end space-x-2">
                                        <button
                                            onClick={() => setIsDeleteConfirmOpen(false)}
                                            className="px-4 py-2 bg-gray-200 rounded"
                                        >
                                            취소
                                        </button>
                                        <button
                                            onClick={handleDeletePet}
                                            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                                        >
                                            삭제
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'posts' && (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold mb-4">내 실종 신고글</h2>
                            {myPosts.reports.map(post => (
                                <div key={post.id} className="border p-4 rounded mb-2">
                                    <h3 className="font-bold">{post.title}</h3>
                                    <p className="text-gray-600">{new Date(post.createdAt).toLocaleDateString()}</p>
                                </div>
                            ))}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold mb-4">내 실종 제보글</h2>
                            {myPosts.witnesses.map(post => (
                                <div key={post.id} className="border p-4 rounded mb-2">
                                    <h3 className="font-bold">{post.title}</h3>
                                    <p className="text-gray-600">{new Date(post.createdAt).toLocaleDateString()}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyPage;
