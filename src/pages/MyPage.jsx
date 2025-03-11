import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import defaultImage from '../assets/images/default.png';
import PetRegisterModal from '../components/PetRegisterModal.jsx';
import PetTypeSelectModal from '../components/PetTypeSelectModal';
import PetEditModal from '../components/PetEditModal.jsx';
import { replace, useNavigate } from 'react-router-dom';
import axios from 'axios';
import kakaoImage from '../assets/images/kakaotalk_simple_icon2.png';
import naverImage from '../assets/images/naver_simple_icon.png';
import googleImage from '../assets/images/google_simple_icon.png';

const MyPage = () => {
    const [myPets, setMyPets] = useState([]); // 반려동물 리스트
    const [page, setPage] = useState(0); // 현재 페이지 번호
    const [hasMore, setHasMore] = useState(true); // 추가 데이터 여부
    const [isLoading, setIsLoading] = useState(false); // 로딩 상태
    const observerRef = useRef(null); // 무한 스크롤 관찰자
    const [shouldReload, setShouldReload] = useState(false);

    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedPet, setSelectedPet] = useState(null);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [petToDelete, setPetToDelete] = useState(null);
    const [isPasswordEditing, setIsPasswordEditing] = useState(false);
    const [isPhoneEditing, setIsPhoneEditing] = useState(false);
    const userInfoStr = localStorage.getItem('userInfo');
    const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;
    const [activeTab, setActiveTab] = useState('profile');
    const [profileImage, setProfileImage] = useState();
    const [nickname, setNickname] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const navigate = useNavigate();
    const [isTypeSelectOpen, setIsTypeSelectOpen] = useState(false);
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [myPosts, setMyPosts] = useState({
        reports: [],
        witnesses: [],
        reportsTotalPages: 0,
        witnessTotalPages: 0,
        reportsCurrentPage: 0,
        witnessCurrentPage: 0
    });

    // 회원 탈퇴
    const handleWithdrawMember = async () => {
        // 사용자에게 확인 요청
        const isConfirmed = window.confirm("정말로 회원 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.");

        if (!isConfirmed) return;

        try {
            const response = await axios.patch(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v2/members/withdraw`,
                {},
                { withCredentials: true }
            );

            if (response.data.statusCode === 200) {
                alert('회원 탈퇴가 완료되었습니다.');
                // 로컬 스토리지 정보 삭제
                localStorage.removeItem('accessToken');
                localStorage.removeItem('userInfo');
                localStorage.removeItem('isLoggedIn');
                // 로그인 페이지로 이동
                navigate('/', { replace: true });
            }
        } catch (error) {
            alert('회원 탈퇴 처리 중 오류가 발생했습니다.');
        }
    };

    // 소셜 계정 연동 해제 함수
    const handleUnlinkSocialAccount = async (providerType) => {
        try {
            const response = await axios.delete(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v2/members/social/${providerType.toLowerCase()}`,
                // { providerType: providerType }, // "KAKAO", "GOOGLE", "NAVER" 중 하나를 전송
                {
                    withCredentials: true
                }
            );

            if (response.data.statusCode === 200) {
                alert(`${providerType} 계정 연동이 해제되었습니다.`);
                // 소셜 연동 정보 다시 불러오기
                fetchSocialConnections();
            }
        } catch (error) {
            alert('소셜 계정 연동 해제 중 오류가 발생했습니다.');
        }
    };


    // 소셜 연동 정보 저장
    const [socialConnections, setSocialConnections] = useState({
        kakao: false,
        naver: false,
        google: false
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

    // 소셜 연동 정보 가져오기
    const fetchSocialConnections = async () => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v2/members/social`,
                { withCredentials: true }
            );

            if (response.data.statusCode === 200) {
                setSocialConnections(response.data.data);
            }
        } catch (error) {
        }
    };

    // 페이지 변경 핸들러 - 신고글
    const handleReportPageChange = (pageNumber) => {
        // 이전 데이터 초기화 (중요!)
        setMyPosts(prev => ({
            ...prev,
            reportsCurrentPage: pageNumber,
            reports: [] // 데이터 초기화 후 새로 불러오기
        }));

        // 새 데이터 불러오기
        fetchMyReportPosts(pageNumber);
    };

    // 페이지 변경 핸들러 - 제보글
    const handleWitnessPageChange = (pageNumber) => {
        // 이전 데이터 초기화 (중요!)
        setMyPosts(prev => ({
            ...prev,
            witnessCurrentPage: pageNumber,
            witnesses: [] // 데이터 초기화 후 새로 불러오기
        }));

        // 새 데이터 불러오기
        fetchMyWitnessPosts(pageNumber);
    };

    // 이전 페이지로 이동
    const goToPreviousPage = () => {
        if (currentPage > 0) {
            handlePageChange(currentPage - 1);
        }
    };

    // 다음 페이지로 이동
    const goToNextPage = () => {
        if (currentPage < totalPages - 1) {
            handlePageChange(currentPage + 1);
        }
    };

    // 페이지 번호 렌더링 함수
    const renderPageNumbers = () => {
        const pageNumbers = [];
        const maxPageButtons = 5; // 한 번에 표시할 페이지 버튼 수

        let startPage = Math.max(0, currentPage - Math.floor(maxPageButtons / 2));
        let endPage = Math.min(totalPages - 1, startPage + maxPageButtons - 1);

        // 시작 페이지 조정
        if (endPage - startPage + 1 < maxPageButtons) {
            startPage = Math.max(0, endPage - maxPageButtons + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(
                <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={`px-3 py-1 mx-1 border rounded ${currentPage === i ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
                        }`}
                >
                    {i + 1}
                </button>
            );
        }

        return pageNumbers;
    };


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
        image: null, // 사진
        imageUrl: '' // 이미지 URL
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
        image: null,
        imageUrl: ''
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
            image: null,
            imageUrl: pet?.imageUrl || ''
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
                formData.append('imageUrl', editPetFormData.imageUrl);
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
                setPage(0); // 페이지를 0으로 초기화
                await fetchMyPets(0); // 반려동물 목록 새로고침
            }
        } catch (error) {
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
                }
            );

            if (response.data.statusCode === 200) {
                alert('반려동물이 성공적으로 삭제되었습니다.');
                setIsDeleteConfirmOpen(false);
                setPetToDelete(null);
                setShouldReload(true); // 리로드 플래그 설정
            }
        } catch (error) {
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
                alert(response.data.message);
                setIsPasswordEditing(false);
                setPersonalInfo({
                    ...personalInfo,
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
            }
        } catch (error) {
            alert(error.response.data.msg);
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
            setShouldReload(true); // 리로드 플래그 설정
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
                navigate('/');
            }
        } catch (error) {
            alert('로그아웃 중 오류가 발생했습니다.');
        }
    };

    // 프로필 이미지 변경
    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('imageUrl', profileImage);

        try {
            const response = await axios.patch(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v2/members/profile/pic`,
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
            alert('이미지 업로드 중 오류가 발생했습니다.');
        }
    };

    // 프로필 이미지 초기화
    const handleProfileImageReset = async () => {
        const isConfirmed = window.confirm("정말로 프로필 이미지를 초기화하시겠습니까?");

        if (!isConfirmed) return;

        const formData = new FormData();
        formData.append('imageUrl', profileImage);

        try {
            const response = await axios.patch(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v2/members/profile/images`,
                formData,
                { withCredentials: true }
            );

            setProfileImage(defaultImage);

            // 로컬 스토리지 업데이트
            const userInfoStr = localStorage.getItem('userInfo');
            if (userInfoStr) {
                const userInfo = JSON.parse(userInfoStr);
                userInfo.profileImage = defaultImage;
                localStorage.setItem('userInfo', JSON.stringify(userInfo));
            }
        } catch (error) {
            alert('프로필 이미지 초기화 중 오류가 발생했습니다.');
        }
    };

    // 내 반려동물 리스트 가져오기
    const fetchMyPets = async (pageNum) => {
        if (isLoading) return;

        setIsLoading(true);

        try {
            const response = await axios.get(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v2/members/pets?page=${pageNum}&size=10`,
                { withCredentials: true }
            );

            if (response.data.statusCode === 200) {
                const newAnimals = response.data.data.content;

                if (pageNum === 0) {
                    setMyPets(newAnimals);
                } else {
                    setMyPets(prev => [...prev, ...newAnimals]);
                }

                // 다음 페이지 설정 - 현재 페이지 번호를 기준으로
                const isLast = response.data.data.last;
                setHasMore(!isLast);

                if (!isLast) {
                    setPage(pageNum + 1); // 현재 페이지 기준으로 다음 페이지 설정
                }
            }
        } catch (error) {
        } finally {
            setIsLoading(false);
        }
    };

    // 내 신고글 불러오기
    const fetchMyReportPosts = async (page = 0) => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v2/members/posts/reports?page=${page}&size=5`,
                { withCredentials: true }
            );

            if (response.data.statusCode === 200) {
                setMyPosts(prev => ({
                    ...prev,
                    reports: response.data.data.content,
                    reportsTotalPages: response.data.data.totalPages,
                    reportsCurrentPage: page // 현재 페이지 번호 업데이트
                }));
            }
        } catch (error) {
        }
    };

    // 내 제보글 불러오기
    const fetchMyWitnessPosts = async (page = 0) => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v2/members/posts/witnesses?page=${page}&size=5`,
                { withCredentials: true }
            );

            if (response.data.statusCode === 200) {
                setMyPosts(prev => ({
                    ...prev,
                    witnesses: response.data.data.content,
                    witnessTotalPages: response.data.data.totalPages,
                    witnessCurrentPage: page // 현재 페이지 번호 업데이트
                }));
            }
        } catch (error) {
        }
    };

    useEffect(() => {
        const userInfoStr = localStorage.getItem('userInfo');
        const isLoggedIn = localStorage.getItem('isLoggedIn');

        if (userInfoStr && isLoggedIn === 'true') {
            const userInfo = JSON.parse(userInfoStr);

            // 프로필 이미지 설정
            setProfileImage(userInfo?.profileImage || defaultImage);
            setNickname(userInfo?.nickname || '');

            // 상태 초기화를 명확하게 처리
            setMyPets([]); // 기존 데이터 초기화
            setPage(0);
            setHasMore(true);

            window.scrollTo(0, 0);

            // setTimeout으로 상태 업데이트 후 데이터 로딩 보장
            setTimeout(() => {
                fetchMyPets(0);
                fetchMyReportPosts(0);
                fetchMyWitnessPosts(0);
                fetchSocialConnections();
            }, 0);
        }
    }, []);

    useEffect(() => {

        // 탭이 'pets'가 아니면 Observer를 설정하지 않음
        if (activeTab !== 'pets') {
            return;
        }

        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && hasMore && !isLoading) {
                    fetchMyPets(page);
                }
            },
            {
                root: null,
                rootMargin: '0px 0px 100px 0px', // 여유 더 늘림
                threshold: 0.1
            }
        );

        // setTimeout을 사용하여 DOM 렌더링 후 Observer 설정
        setTimeout(() => {
            if (observerRef.current) {
                observer.observe(observerRef.current);
            } else {

            }
        }, 100);

        return () => {
            if (observer && observerRef.current) {

                observer.unobserve(observerRef.current);
            }
        };
    }, [page, hasMore, isLoading, activeTab]);

    useEffect(() => {
        if (shouldReload) {
            setMyPets([]);
            setPage(0);
            setHasMore(true);
            fetchMyPets(0);
            setShouldReload(false); // 플래그 리셋
        }
    }, [shouldReload]);

    // 상세 페이지로 이동하는 함수
    const handleDetailNavigation = (e, postId) => {
        if (e) e.stopPropagation();

        if (postId) {
            navigate(`/PetPostDetail/${postId.id}`);
        } else {
        }
    };

    return (
        <div className="min-h-screen bg-[#FFF5E6] flex flex-col items-center justify-start p-4">
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg overflow-hidden p-6 space-y-6">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold text-amber-700">마이페이지</h1>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"
                    >
                        로그아웃
                    </button>
                </div>
                {/* 탭 버튼 스타일 수정 */}
                <div className="flex gap-3 mb-6">
                    {[
                        { id: 'profile', label: '내 정보' },
                        { id: 'pets', label: '반려동물' },
                        { id: 'posts', label: '게시글' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeTab === tab.id
                                ? 'bg-amber-500 text-white shadow-md'
                                : 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                                }`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {activeTab === 'profile' && (
                    <div className="text-center rounded-2xl p-6">
                        {/* 프로필 정보 */}
                        <div className="relative w-32 h-32 mx-auto mb-6">
                            <img
                                src={profileImage || defaultImage}
                                alt="Profile"
                                className="w-full h-full rounded-full object-cover "
                                onError={(e) => {
                                    e.target.src = defaultImage;
                                }}
                            />
                            <label className="absolute bottom-0 right-0 bg-amber-500 p-2 rounded-full cursor-pointer shadow-md hover:bg-amber-600 transition-colors">
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
                            {profileImage && !profileImage.includes("default.png") && (
                                <button
                                    onClick={() => {
                                        handleProfileImageReset();
                                    }}
                                    className="absolute top-0 right-0 bg-red-500 p-2 rounded-full cursor-pointer"
                                    title="이미지 초기화"
                                >
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
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            )}
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
                                        className="px-4 py-2 bg-amber-500 text-white rounded-md"
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
                                <h2 className="text-xl font-bold text-amber-800 mb-3">{userInfo?.nickname}</h2>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="px-6 py-2 bg-amber-100 text-amber-600 rounded-full hover:bg-amber-200 transition-colors"
                                >
                                    닉네임 변경
                                </button>
                            </div>
                        )}
                        {/* 소셜 계정 연동 정보 */}
                        <div className="mt-8 p-6 bg-white rounded-2xl shadow-sm">
                            <h3 className="text-lg font-semibold text-amber-700 mb-4">소셜 계정 연동</h3>
                            <div className="grid grid-cols-3 gap-4 max-w-xs mx-auto">
                                <div className="flex flex-col items-center">
                                    <img src={kakaoImage} alt="카카오" className="w-6 h-6 mb-1" />
                                    {socialConnections.kakao ? (
                                        <>
                                            <span className="mt-1 px-2 py-0.5 rounded-full text-xs bg-yellow-100 text-yellow-800">
                                                연동
                                            </span>
                                            <button
                                                onClick={() => handleUnlinkSocialAccount('KAKAO')}
                                                className="mt-1 text-xs text-red-600 hover:text-red-800"
                                            >
                                                해제
                                            </button>
                                        </>
                                    ) : (
                                        <span className="mt-1 px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-800">
                                            미연동
                                        </span>
                                    )}
                                </div>

                                <div className="flex flex-col items-center">
                                    <img src={naverImage} alt="네이버" className="w-6 h-6 mb-1" />
                                    {socialConnections.naver ? (
                                        <>
                                            <span className="mt-1 px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-800">
                                                연동
                                            </span>
                                            <button
                                                onClick={() => handleUnlinkSocialAccount('NAVER')}
                                                className="mt-1 text-xs text-red-600 hover:text-red-800"
                                            >
                                                해제
                                            </button>
                                        </>
                                    ) : (
                                        <span className="mt-1 px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-800">
                                            미연동
                                        </span>
                                    )}
                                </div>

                                <div className="flex flex-col items-center">
                                    <img src={googleImage} alt="구글" className="w-6 h-6 mb-1" />
                                    {socialConnections.google ? (
                                        <>
                                            <span className="mt-1 px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-800">
                                                연동
                                            </span>
                                            <button
                                                onClick={() => handleUnlinkSocialAccount('GOOGLE')}
                                                className="mt-1 text-xs text-red-600 hover:text-red-800"
                                            >
                                                해제
                                            </button>
                                        </>
                                    ) : (
                                        <span className="mt-1 px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-800">
                                            미연동
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>



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
                                            className="px-4 py-2 bg-amber-100 text-amber-600 rounded-md hover:bg-amber-200"
                                        >
                                            {isPasswordEditing ? '취소' : '변경'}
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
                                                className="w-full px-4 py-2 bg-amber-500 text-white rounded-md mt-2"
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
                                            className="px-4 py-2 bg-amber-100 text-amber-600 rounded-md hover:bg-amber-200"
                                        >
                                            {isPhoneEditing ? '취소' : '변경'}
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
                                {activeTab === 'profile' && (
                                    <div className="mt-8 border-t pt-6">
                                        <h3 className="text-lg font-semibold text-red-600 mb-2">계정 삭제</h3>
                                        <p className="text-sm text-gray-500 mb-4">
                                            계정을 삭제하면 모든 데이터가 영구적으로 제거됩니다. 이 작업은 되돌릴 수 없습니다.
                                        </p>
                                        <button
                                            onClick={handleWithdrawMember}
                                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                        >
                                            회원 탈퇴
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'pets' && (
                    <div className="space-y-6 bg-white rounded-xl p-4 shadow hover:shadow-sm transition-shadow">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-amber-800">반려동물 목록</h2>
                            <button
                                onClick={handlePetRegistrationClick}
                                className="px-4 py-2 bg-amber-500 text-white rounded-full hover:bg-amber-600 transition-colors shadow-sm"
                            >
                                반려동물 등록
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {myPets.map(pet => (
                                <div
                                    key={pet.id}
                                    className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 border"
                                >
                                    {/* 고정된 비율의 이미지 컨테이너 */}
                                    <div className="relative w-full pb-[75%]"> {/* 4:3 비율 유지 */}
                                        <img
                                            src={pet.imageUrl}
                                            alt={pet.name}
                                            className="absolute inset-0 w-full h-full object-cover"
                                        />
                                    </div>

                                    <div className="p-4 space-y-3">
                                        <div className="flex justify-between items-center">
                                            <h3 className="text-xl font-bold text-gray-800">{pet.name}</h3>
                                            <span
                                                className={`text-sm font-medium px-2 py-1 rounded-full ${pet.animalType === '강아지'
                                                    ? 'bg-blue-100 text-blue-800' // 강아지 스타일
                                                    : 'bg-pink-100 text-pink-800' // 고양이 스타일
                                                    }`}
                                            >
                                                {pet.animalType === '강아지' ? '강아지' : '고양이'}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-[auto_1fr] gap-1 text-sm text-gray-600">
                                            <span className="font-medium">품종 :</span>
                                            <span className="truncate">{pet.breed}</span>
                                            <span className="font-medium">크기 :</span>
                                            <span className="truncate">{pet.size}</span>
                                            <span className="font-medium">특징 :</span>
                                            <span className="line-clamp-2">{pet.feature}</span>
                                        </div>

                                        <div className="text-xs text-gray-500 mt-2">
                                            <span className="font-medium">등록번호:</span> {pet.registrationNo}
                                        </div>

                                        <div className="flex justify-end space-x-2 pt-3 border-t mt-3">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation(); // Prevent navigation when clicking the buttons
                                                    handleEditPet(pet);
                                                }}
                                                className="px-3 py-1.5 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors text-sm"
                                            >
                                                수정
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation(); // Prevent navigation when clicking the buttons
                                                    handleDeleteConfirm(pet);
                                                }}
                                                className="px-3 py-1.5 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors text-sm"
                                            >
                                                삭제
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {/* 관찰 요소 - 명확한 높이와 스타일 지정 */}
                        <div
                            ref={observerRef}
                            style={{
                                height: '30px',
                                margin: '20px 0',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                width: '100%'
                            }}
                        >
                            {isLoading ? (
                                <div className="loading-spinner">로딩 중...</div>
                            ) : hasMore ? (
                                <div className="load-more-indicator">더 보기</div>
                            ) : (
                                <div className="no-more-data">더 이상 반려동물 데이터가 없습니다</div>
                            )}
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
                    <div className="space-y-6 bg-white rounded-xl p-4 shadow hover:shadow-md transition-shadow overflow-y-auto">
                        {/* 실종 신고글 목록 */}
                        <div className="mb-8 border-b pb-4 mb-4 border-gray-200 space-y-4">
                            <h3 className="text-lg font-semibold mb-4">실종 신고글</h3>
                            <div className={`${myPosts.reports.length > 0 ? 'max-h-[600px] overflow-y-auto' : ''}`}>
                                {myPosts.reports.length > 0 ? (
                                    // 현재 페이지의 데이터만 표시 (API에서 이미 페이지별로 가져오므로 추가 슬라이싱 불필요)
                                    myPosts.reports.map(post => (
                                        <div key={post.id}
                                            className="border-b border-gray-200 py-4 cursor-pointer hover:bg-gray-50"
                                            onClick={() => handleDetailNavigation({ stopPropagation: () => { } }, { id: post.id, type: 'pet' })}>
                                            <input type="hidden" name="postId" value={post.id} />
                                            <div className="flex justify-between items-center">
                                                <div className="flex-grow mr-4 overflow-hidden">
                                                    <h3 className="text-lg font-medium truncate">{post.content}</h3>
                                                    <p className="text-sm text-gray-500">
                                                        {new Date(post.createPostTime).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <span className="flex-shrink-0 inline-block w-18 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs text-center whitespace-nowrap overflow-hidden text-ellipsis">
                                                    {post.status === "FINDING" ? "찾는 중" :
                                                        post.status === "FOUND" ? "주인 찾기 완료" : ""}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex items-center justify-center h-[200px] text-gray-500">
                                        등록된 실종 신고글이 없습니다.
                                    </div>
                                )}
                            </div>
                        </div>
                        {/* 실종 신고글 페이지네이션 */}
                        {myPosts.reportsTotalPages > 1 && (
                            <div className="flex justify-center mt-6">
                                <button
                                    onClick={() => handleReportPageChange(myPosts.reportsCurrentPage - 1)}
                                    disabled={myPosts.reportsCurrentPage === 0}
                                    className={`px-3 py-1 border rounded mx-1 ${myPosts.reportsCurrentPage === 0
                                        ? 'opacity-50 cursor-not-allowed'
                                        : 'hover:bg-gray-100'
                                        }`}
                                >
                                    이전
                                </button>

                                {/* 일관된 페이지 수 표시 (최대 5개) */}
                                {(() => {
                                    const pageButtons = [];
                                    const maxVisiblePages = 5; // 표시할 최대 페이지 버튼 수
                                    let startPage = 0;

                                    // 총 페이지 수가 최대 표시 수보다 작으면 모든 페이지 표시
                                    if (myPosts.reportsTotalPages <= maxVisiblePages) {
                                        startPage = 0;
                                    }
                                    // 현재 페이지가 앞쪽에 있을 경우
                                    else if (myPosts.reportsCurrentPage < Math.floor(maxVisiblePages / 2)) {
                                        startPage = 0;
                                    }
                                    // 현재 페이지가 뒤쪽에 있을 경우
                                    else if (myPosts.reportsCurrentPage >= myPosts.reportsTotalPages - Math.floor(maxVisiblePages / 2)) {
                                        startPage = myPosts.reportsTotalPages - maxVisiblePages;
                                    }
                                    // 현재 페이지가 중간에 있을 경우
                                    else {
                                        startPage = myPosts.reportsCurrentPage - Math.floor(maxVisiblePages / 2);
                                    }

                                    // 페이지 버튼 생성
                                    for (let i = 0; i < Math.min(maxVisiblePages, myPosts.reportsTotalPages); i++) {
                                        const pageIndex = startPage + i;
                                        pageButtons.push(
                                            <button
                                                key={pageIndex}
                                                onClick={() => handleReportPageChange(pageIndex)}
                                                className={`px-3 py-1 border rounded mx-1 ${myPosts.reportsCurrentPage === pageIndex
                                                    ? 'bg-amber-500 text-white'
                                                    : 'hover:bg-gray-100'
                                                    }`}
                                            >
                                                {pageIndex + 1}
                                            </button>
                                        );
                                    }

                                    return pageButtons;
                                })()}

                                <button
                                    onClick={() => handleReportPageChange(myPosts.reportsCurrentPage + 1)}
                                    disabled={myPosts.reportsCurrentPage === myPosts.reportsTotalPages - 1}
                                    className={`px-3 py-1 border rounded mx-1 ${myPosts.reportsCurrentPage === myPosts.reportsTotalPages - 1
                                        ? 'opacity-50 cursor-not-allowed'
                                        : 'hover:bg-gray-100'
                                        }`}
                                >
                                    다음
                                </button>
                            </div>
                        )}
                        {/* 실종 제보글 목록 */}
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold mb-4">실종 제보글</h3>
                            <div className={`${myPosts.witnesses.length > 0 ? 'max-h-[600px] overflow-y-auto' : ''}`}>
                                {myPosts.witnesses.length > 0 ? (
                                    // 현재 페이지의 데이터만 표시 (API에서 이미 페이지별로 가져오므로 추가 슬라이싱 불필요)
                                    myPosts.witnesses.map(post => (
                                        <div key={post.id || post.createPostTime}
                                            className="border-b border-gray-200 py-4 cursor-pointer hover:bg-gray-50"
                                            onClick={() => handleDetailNavigation({ stopPropagation: () => { } }, { id: post.id, type: 'pet' })}>
                                            <input type="hidden" name="postId" value={post.id} />
                                            <div className="flex justify-between items-center">
                                                <div className="flex-grow mr-4 overflow-hidden">
                                                    <h3 className="text-lg font-medium truncate">{post.content}</h3>
                                                    <p className="text-sm text-gray-500">
                                                        {new Date(post.createPostTime).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <span className="flex-shrink-0 inline-block w-18 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs text-center whitespace-nowrap overflow-hidden text-ellipsis">
                                                    {post.status === "SIGHTED" ? "목격" :
                                                        post.status === "SHELTER" ? "보호소" :
                                                            post.status === "FOSTERING" ? "임보 중" : ""}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex items-center justify-center h-[200px] text-gray-500">
                                        등록된 실종 제보글이 없습니다.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 실종 제보글 페이지네이션 */}
                        {myPosts.witnessTotalPages > 1 && (
                            <div className="flex justify-center mt-6">
                                <button
                                    onClick={() => handleWitnessPageChange(myPosts.witnessCurrentPage - 1)}
                                    disabled={myPosts.witnessCurrentPage === 0}
                                    className={`px-3 py-1 border rounded mx-1 ${myPosts.witnessCurrentPage === 0
                                        ? 'opacity-50 cursor-not-allowed'
                                        : 'hover:bg-gray-100'
                                        }`}
                                >
                                    이전
                                </button>

                                {/* 일관된 페이지 수 표시 (최대 5개) */}
                                {(() => {
                                    const pageButtons = [];
                                    const maxVisiblePages = 5; // 표시할 최대 페이지 버튼 수
                                    let startPage = 0;

                                    // 총 페이지 수가 최대 표시 수보다 작으면 모든 페이지 표시
                                    if (myPosts.witnessTotalPages <= maxVisiblePages) {
                                        startPage = 0;
                                    }
                                    // 현재 페이지가 앞쪽에 있을 경우
                                    else if (myPosts.witnessCurrentPage < Math.floor(maxVisiblePages / 2)) {
                                        startPage = 0;
                                    }
                                    // 현재 페이지가 뒤쪽에 있을 경우
                                    else if (myPosts.witnessCurrentPage >= myPosts.witnessTotalPages - Math.floor(maxVisiblePages / 2)) {
                                        startPage = myPosts.witnessTotalPages - maxVisiblePages;
                                    }
                                    // 현재 페이지가 중간에 있을 경우
                                    else {
                                        startPage = myPosts.witnessCurrentPage - Math.floor(maxVisiblePages / 2);
                                    }

                                    // 페이지 버튼 생성
                                    for (let i = 0; i < Math.min(maxVisiblePages, myPosts.witnessTotalPages); i++) {
                                        const pageIndex = startPage + i;
                                        pageButtons.push(
                                            <button
                                                key={pageIndex}
                                                onClick={() => handleWitnessPageChange(pageIndex)}
                                                className={`px-3 py-1 border rounded mx-1 ${myPosts.witnessCurrentPage === pageIndex
                                                    ? 'bg-amber-500 text-white'
                                                    : 'hover:bg-gray-100'
                                                    }`}
                                            >
                                                {pageIndex + 1}
                                            </button>
                                        );
                                    }

                                    return pageButtons;
                                })()}

                                <button
                                    onClick={() => handleWitnessPageChange(myPosts.witnessCurrentPage + 1)}
                                    disabled={myPosts.witnessCurrentPage === myPosts.witnessTotalPages - 1}
                                    className={`px-3 py-1 border rounded mx-1 ${myPosts.witnessCurrentPage === myPosts.witnessTotalPages - 1
                                        ? 'opacity-50 cursor-not-allowed'
                                        : 'hover:bg-gray-100'
                                        }`}
                                >
                                    다음
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyPage;
