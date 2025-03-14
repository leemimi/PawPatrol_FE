import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const AdminDashboard = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
    const [activeTab, setActiveTab] = useState('users');
    const [users, setUsers] = useState([]);
    const [shelters, setShelters] = useState([]);
    const [reports, setReports] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const [pagination, setPagination] = useState({
        totalPages: 0,
        totalElements: 0,
        currentPage: 0
    });
    const [shelterPagination, setShelterPagination] = useState({
        totalPages: 0,
        totalElements: 0,
        currentPage: 0
    });

    // 회원 상태 변경 함수
    const handleStatusChange = async (userId, newStatus) => {
        try {
            const response = await axios.patch(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v2/admin/members`,
                {
                    userId: userId,
                    status: newStatus
                },
                { withCredentials: true }
            );

            if (response.data.statusCode === 200) {
                // 상태 텍스트 정의
                const statusText =
                    newStatus === 'ACTIVE' ? '정상' :
                        newStatus === 'BANNED' ? '정지' :
                            newStatus === 'INACTIVE' ? '휴면' : '탈퇴';

                // 성공 메시지 표시 (SweetAlert2 사용)
                Swal.fire({
                    icon: 'success',
                    title: '상태 변경 완료',
                    text: `회원 상태가 ${statusText}으로 변경되었습니다.`,
                    confirmButtonText: '확인'
                });

                // 회원 목록 새로고침
                await fetchUsers();
            }
        } catch (error) {
            Swal.fire({
                title: '오류',
                text: '회원 상태 변경에 실패했습니다.',
                icon: 'error',
                confirmButtonText: '확인'
            });
        }
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
            Swal.fire({
                title: '오류',
                text: '로그아웃 중 오류가 발생했습니다.',
                icon: 'error',
                confirmButtonText: '확인'
            });
        }
    };

    // 사용자 목록 가져오기
    const fetchUsers = async (page = 0) => {
        setIsLoading(true);
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v2/admin/members?page=${page}&size=10`,
                { withCredentials: true }
            );

            if (response.data.statusCode === 200) {
                setUsers(response.data.data.content);
                // 페이지네이션 정보 저장
                setPagination({
                    totalPages: response.data.data.totalPages,
                    totalElements: response.data.data.totalElements,
                    currentPage: response.data.data.number
                });
            }
        } catch (error) {
        } finally {
            setIsLoading(false);
        }
    };

    // 보호소 목록 가져오기
    const fetchShelters = async (page = 0) => {
        setIsLoading(true);
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v2/admin/shelters?page=${page}&size=10`,
                { withCredentials: true }
            );

            if (response.data.statusCode === 200) {
                setShelters(response.data.data.content);
                // 페이지네이션 정보 저장
                setShelterPagination({
                    totalPages: response.data.data.totalPages,
                    totalElements: response.data.data.totalElements,
                    currentPage: response.data.data.number
                });
            }
        } catch (error) {
        } finally {
            setIsLoading(false);
        }
    };

    // 신고된 게시글 가져오기
    const fetchReports = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v2/admin/reports`,
                { withCredentials: true }
            );
            if (response.data.statusCode === 200) {
                setReports(response.data.data);
            }
        } catch (error) {
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // 관리자 권한 확인
        const userInfoStr = localStorage.getItem('userInfo');
        if (userInfoStr) {
            const userInfo = JSON.parse(userInfoStr);
            if (userInfo.role !== 'ROLE_ADMIN') {
                navigate('/'); // 관리자가 아니면 홈으로 리다이렉트
                return;
            }
        } else {
            navigate('/');
            return;
        }

        window.scrollTo(0, 0);
        // 초기 데이터 로드
        fetchUsers(0);
        fetchShelters(0);
        // fetchReports();
    }, [navigate]);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 640);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-2xl font-bold text-orange-500">관리자 대시보드</h1>
                        </div>
                        <div className="flex items-center">
                            <button
                                onClick={handleLogout}
                                className="ml-4 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                            >
                                로그아웃
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="border-b border-gray-200">
                        <nav className="flex -mb-px">
                            <button
                                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'users'
                                    ? 'border-orange-500 text-orange-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                onClick={() => {
                                    setActiveTab('users');
                                }}
                            >
                                사용자 관리
                            </button>
                            <button
                                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'shelters'
                                    ? 'border-orange-500 text-orange-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                onClick={() => {
                                    setActiveTab('shelters');
                                }}
                            >
                                보호소 관리
                            </button>
                            <button
                                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'reports'
                                    ? 'border-orange-500 text-orange-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                onClick={() => {
                                    setActiveTab('reports');
                                }}
                            >
                                신고 관리
                            </button>
                        </nav>
                    </div>

                    <div className="p-6">
                        <div className="mb-6 flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-gray-800">
                                {activeTab === 'users' && '사용자 관리'}
                                {activeTab === 'shelters' && '보호소 관리'}
                                {activeTab === 'reports' && '신고 관리'}
                            </h2>
                        </div>

                        {isLoading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
                            </div>
                        ) : (
                            <>
                                {activeTab === 'users' && (
                                    <>
                                        <div className="overflow-x-auto">
                                            {/* 데스크톱 테이블 - 모바일에서는 숨김 */}
                                            <table className="min-w-full divide-y divide-gray-200 hidden md:table">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이메일</th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">닉네임</th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">가입일</th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">계정유형</th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">관리</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {users.map(user => (
                                                        <tr key={user.id} className={`hover:bg-gray-50 ${user.role === 'ROLE_SHELTER' ? 'bg-blue-50' : ''}`}>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.id}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.nickname}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                {new Date(user.createdAt).toLocaleDateString()}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'ROLE_USER' ? 'bg-gray-100 text-gray-800' : user.role === 'ROLE_SHELTER' ? 'bg-blue-100 text-blue-800' : ''}`}>
                                                                    {user.role === 'ROLE_USER' ? '일반 사용자' : user.role === 'ROLE_SHELTER' ? '보호소 관리자' : ''}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : user.status === 'INACTIVE' ? 'bg-yellow-100 text-yellow-800' : user.status === 'BANNED' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                                                                    {user.status === 'ACTIVE' ? '정상' : user.status === 'INACTIVE' ? '휴면' : user.status === 'BANNED' ? '정지' : user.status === 'WITHDRAWN' ? '탈퇴' : '알 수 없음'}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                                {user.status === 'BANNED' ? (
                                                                    <button
                                                                        onClick={() => handleStatusChange(user.id, 'ACTIVE')}
                                                                        className="text-green-600 hover:text-green-900 mr-3">
                                                                        복구
                                                                    </button>
                                                                ) : user.status === 'ACTIVE' || user.status === 'INACTIVE' ? (
                                                                    <button
                                                                        onClick={() => handleStatusChange(user.id, 'BANNED')}
                                                                        className="text-red-600 hover:text-red-900 mr-3">
                                                                        차단
                                                                    </button>
                                                                ) : null}

                                                                {user.status === 'WITHDRAWN' && (
                                                                    <button
                                                                        onClick={() => handleStatusChange(user.id, 'ACTIVE')}
                                                                        className="text-blue-600 hover:text-blue-900 mr-3">
                                                                        복구
                                                                    </button>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>

                                            {/* 모바일 카드 뷰 - 데스크톱에서는 숨김 */}
                                            <div className="md:hidden">
                                                {users.map(user => (
                                                    <div key={user.id} className={`mb-4 rounded-lg border p-4 ${user.role === 'ROLE_SHELTER' ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'}`}>
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div>
                                                                <h3 className="text-sm font-medium">{user.nickname}</h3>
                                                                <p className="text-xs text-gray-500">{user.email}</p>
                                                            </div>
                                                            <div>
                                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : user.status === 'INACTIVE' ? 'bg-yellow-100 text-yellow-800' : user.status === 'BANNED' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                                                                    {user.status === 'ACTIVE' ? '정상' : user.status === 'INACTIVE' ? '휴면' : user.status === 'BANNED' ? '정지' : user.status === 'WITHDRAWN' ? '탈퇴' : '알 수 없음'}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
                                                            <div>
                                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'ROLE_USER' ? 'bg-gray-100 text-gray-800' : user.role === 'ROLE_SHELTER' ? 'bg-blue-100 text-blue-800' : ''}`}>
                                                                    {user.role === 'ROLE_USER' ? '일반 사용자' : user.role === 'ROLE_SHELTER' ? '보호소 관리자' : ''}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                가입: {new Date(user.createdAt).toLocaleDateString()}
                                                            </div>
                                                        </div>

                                                        <div className="flex justify-end space-x-2">
                                                            {user.status === 'BANNED' ? (
                                                                <button
                                                                    onClick={() => handleStatusChange(user.id, 'ACTIVE')}
                                                                    className="px-3 py-1 bg-green-100 text-green-700 rounded-md text-xs font-medium">
                                                                    복구
                                                                </button>
                                                            ) : user.status === 'ACTIVE' || user.status === 'INACTIVE' ? (
                                                                <button
                                                                    onClick={() => handleStatusChange(user.id, 'BANNED')}
                                                                    className="px-3 py-1 bg-red-100 text-red-700 rounded-md text-xs font-medium">
                                                                    차단
                                                                </button>
                                                            ) : null}

                                                            {user.status === 'WITHDRAWN' && (
                                                                <button
                                                                    onClick={() => handleStatusChange(user.id, 'ACTIVE')}
                                                                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-medium">
                                                                    복구
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="mt-4 flex justify-center overflow-x-auto py-2 w-full">
                                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                                {/* 이전 그룹의 첫 페이지로 이동 */}
                                                <button
                                                    onClick={() => {
                                                        const prevGroup = Math.floor(pagination.currentPage / 10) - 1;
                                                        const prevGroupFirstPage = prevGroup >= 0 ? prevGroup * 10 : 0;
                                                        fetchShelters(prevGroupFirstPage);
                                                    }}
                                                    disabled={pagination.currentPage < 10}
                                                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${pagination.currentPage < 10
                                                        ? 'text-gray-300 cursor-not-allowed'
                                                        : 'text-gray-500 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    <span className="sr-only">이전 그룹</span>
                                                    &laquo;
                                                </button>

                                                {/* 현재 페이지 그룹의 페이지 버튼 생성 - 모바일에서는 표시 개수 제한 */}
                                                {(() => {
                                                    if (!pagination.totalPages) return null;

                                                    // 현재 페이지가 속한 그룹의 시작 페이지 계산
                                                    const currentGroup = Math.floor(pagination.currentPage / 10);
                                                    const startPage = currentGroup * 10;
                                                    const endPage = Math.min(startPage + 9, pagination.totalPages - 1);

                                                    // 모바일 화면에서는 현재 페이지 주변의 페이지만 표시
                                                    const isMobile = window.innerWidth < 640; // sm 브레이크포인트
                                                    const pageButtons = [];

                                                    if (isMobile) {
                                                        // 모바일에서는 최대 5개의 페이지 버튼만 표시
                                                        // 현재 페이지를 중심으로 앞뒤로 최대 2개씩 표시
                                                        const totalMobileButtons = 5;
                                                        const halfButtons = Math.floor(totalMobileButtons / 2);

                                                        // 현재 페이지를 중심으로 시작과 끝 페이지 계산
                                                        let mobileStartPage = Math.max(startPage, pagination.currentPage - halfButtons);
                                                        let mobileEndPage = Math.min(endPage, mobileStartPage + totalMobileButtons - 1);

                                                        // 끝 페이지가 범위를 벗어나면 시작 페이지 조정
                                                        if (mobileEndPage > endPage) {
                                                            mobileStartPage = Math.max(startPage, endPage - totalMobileButtons + 1);
                                                        }

                                                        // 시작 페이지부터 끝 페이지까지 버튼 생성
                                                        for (let i = mobileStartPage; i <= mobileEndPage; i++) {
                                                            pageButtons.push(
                                                                <button
                                                                    key={i}
                                                                    onClick={() => fetchShelters(i)}
                                                                    className={`relative inline-flex items-center px-3 py-2 border border-gray-300 bg-white text-sm font-medium ${pagination.currentPage === i
                                                                        ? 'z-10 bg-orange-50 border-orange-500 text-orange-600'
                                                                        : 'text-gray-500 hover:bg-gray-50'
                                                                        }`}
                                                                >
                                                                    {i + 1}
                                                                </button>
                                                            );
                                                        }
                                                    } else {
                                                        // 데스크톱에서는 기존 방식대로 표시
                                                        for (let i = startPage; i <= endPage; i++) {
                                                            pageButtons.push(
                                                                <button
                                                                    key={i}
                                                                    onClick={() => fetchShelters(i)}
                                                                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${pagination.currentPage === i
                                                                        ? 'z-10 bg-orange-50 border-orange-500 text-orange-600'
                                                                        : 'text-gray-500 hover:bg-gray-50'
                                                                        }`}
                                                                >
                                                                    {i + 1}
                                                                </button>
                                                            );
                                                        }
                                                    }


                                                    return pageButtons;
                                                })()}

                                                {/* 다음 그룹의 첫 페이지로 이동 */}
                                                <button
                                                    onClick={() => {
                                                        const nextGroup = Math.floor(pagination.currentPage / 10) + 1;
                                                        const nextGroupFirstPage = nextGroup * 10;
                                                        fetchShelters(Math.min(nextGroupFirstPage, pagination.totalPages - 1));
                                                    }}
                                                    disabled={!pagination.totalPages || Math.floor(pagination.currentPage / 10) === Math.floor((pagination.totalPages - 1) / 10)}
                                                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${!pagination.totalPages || Math.floor(pagination.currentPage / 10) === Math.floor((pagination.totalPages - 1) / 10)
                                                        ? 'text-gray-300 cursor-not-allowed'
                                                        : 'text-gray-500 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    <span className="sr-only">다음 그룹</span>
                                                    &raquo;
                                                </button>
                                            </nav>
                                        </div>

                                    </>
                                )}

                                {activeTab === 'shelters' && (
                                    <>
                                        <div className="overflow-x-auto">
                                            {/* 데스크톱 테이블 - 모바일에서는 숨김 */}
                                            <table className="min-w-full divide-y divide-gray-200 hidden md:table">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">보호소명</th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">주소</th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">연락처</th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">관리</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {shelters.map(shelter => (
                                                        <tr key={shelter.id} className="hover:bg-gray-50">
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{shelter.id}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{shelter.name}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{shelter.address}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{shelter.tel}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                                <button className="text-blue-600 hover:text-blue-900 mr-3">상세</button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>

                                            {/* 모바일 카드 뷰 - 데스크톱에서는 숨김 */}
                                            <div className="md:hidden">
                                                {shelters.map(shelter => (
                                                    <div key={shelter.id} className="mb-4 rounded-lg border border-gray-200 p-4 bg-white">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <h3 className="text-sm font-medium text-gray-900">{shelter.name}</h3>
                                                            <span className="text-xs text-gray-500">ID: {shelter.id}</span>
                                                        </div>

                                                        <div className="mb-3">
                                                            <p className="text-xs text-gray-700 mb-1">
                                                                <span className="inline-block w-14 text-gray-500">주소:</span>
                                                                {shelter.address}
                                                            </p>
                                                            <p className="text-xs text-gray-700">
                                                                <span className="inline-block w-14 text-gray-500">연락처:</span>
                                                                {shelter.tel}
                                                            </p>
                                                        </div>

                                                        <div className="flex justify-end">
                                                            <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-medium">
                                                                상세 보기
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="mt-4 flex justify-center overflow-x-auto py-2 w-full">
                                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                                {/* 이전 그룹의 첫 페이지로 이동 */}
                                                <button
                                                    onClick={() => {
                                                        const prevGroup = Math.floor(shelterPagination.currentPage / 10) - 1;
                                                        const prevGroupFirstPage = prevGroup >= 0 ? prevGroup * 10 : 0;
                                                        fetchShelters(prevGroupFirstPage);
                                                    }}
                                                    disabled={shelterPagination.currentPage < 10}
                                                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${shelterPagination.currentPage < 10
                                                        ? 'text-gray-300 cursor-not-allowed'
                                                        : 'text-gray-500 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    <span className="sr-only">이전 그룹</span>
                                                    &laquo;
                                                </button>

                                                {/* 현재 페이지 그룹의 페이지 버튼 생성 */}
                                                {(() => {
                                                    if (!shelterPagination.totalPages) return null;

                                                    // 현재 페이지가 속한 그룹의 시작 페이지 계산
                                                    const currentGroup = Math.floor(shelterPagination.currentPage / 10);
                                                    const startPage = currentGroup * 10;
                                                    const endPage = Math.min(startPage + 9, shelterPagination.totalPages - 1);

                                                    const pageButtons = [];

                                                    // 모바일 화면 여부 확인 (sm 브레이크포인트)
                                                    const isMobile = window.innerWidth < 640;

                                                    if (isMobile) {
                                                        // 모바일에서는 최대 5개의 페이지 버튼만 표시
                                                        const totalMobileButtons = 5;
                                                        const halfButtons = Math.floor(totalMobileButtons / 2);

                                                        // 현재 페이지를 중심으로 시작과 끝 페이지 계산
                                                        let mobileStartPage = Math.max(startPage, shelterPagination.currentPage - halfButtons);
                                                        let mobileEndPage = Math.min(endPage, mobileStartPage + totalMobileButtons - 1);

                                                        // 끝 페이지가 범위를 벗어나면 시작 페이지 조정
                                                        if (mobileEndPage > endPage) {
                                                            mobileStartPage = Math.max(startPage, endPage - totalMobileButtons + 1);
                                                        }

                                                        // 시작 페이지부터 끝 페이지까지 버튼 생성
                                                        for (let i = mobileStartPage; i <= mobileEndPage; i++) {
                                                            pageButtons.push(
                                                                <button
                                                                    key={i}
                                                                    onClick={() => fetchShelters(i)}
                                                                    className={`relative inline-flex items-center px-3 py-2 border border-gray-300 bg-white text-sm font-medium ${shelterPagination.currentPage === i
                                                                        ? 'z-10 bg-orange-50 border-orange-500 text-orange-600'
                                                                        : 'text-gray-500 hover:bg-gray-50'
                                                                        }`}
                                                                >
                                                                    {i + 1}
                                                                </button>
                                                            );
                                                        }
                                                    } else {
                                                        // 데스크톱에서는 기존 방식대로 표시
                                                        for (let i = startPage; i <= endPage; i++) {
                                                            pageButtons.push(
                                                                <button
                                                                    key={i}
                                                                    onClick={() => fetchShelters(i)}
                                                                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${shelterPagination.currentPage === i
                                                                        ? 'z-10 bg-orange-50 border-orange-500 text-orange-600'
                                                                        : 'text-gray-500 hover:bg-gray-50'
                                                                        }`}
                                                                >
                                                                    {i + 1}
                                                                </button>
                                                            );
                                                        }
                                                    }

                                                    return pageButtons;
                                                })()}

                                                {/* 다음 그룹의 첫 페이지로 이동 */}
                                                <button
                                                    onClick={() => {
                                                        const nextGroup = Math.floor(shelterPagination.currentPage / 10) + 1;
                                                        const nextGroupFirstPage = nextGroup * 10;
                                                        fetchShelters(Math.min(nextGroupFirstPage, shelterPagination.totalPages - 1));
                                                    }}
                                                    disabled={!shelterPagination.totalPages || Math.floor(shelterPagination.currentPage / 10) === Math.floor((shelterPagination.totalPages - 1) / 10)}
                                                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${!shelterPagination.totalPages || Math.floor(shelterPagination.currentPage / 10) === Math.floor((shelterPagination.totalPages - 1) / 10)
                                                        ? 'text-gray-300 cursor-not-allowed'
                                                        : 'text-gray-500 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    <span className="sr-only">다음 그룹</span>
                                                    &raquo;
                                                </button>
                                            </nav>
                                        </div>


                                    </>
                                )}

                                {activeTab === 'reports' && (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">제목</th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">신고자</th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">신고일</th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">관리</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {reports.map(report => (
                                                    <tr key={report.id} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.id}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{report.title}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{report.reporter}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {new Date(report.createdAt).toLocaleDateString()}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                                ${report.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                                    report.status === 'RESOLVED' ? 'bg-green-100 text-green-800' :
                                                                        'bg-red-100 text-red-800'}`}>
                                                                {report.status === 'PENDING' ? '대기중' :
                                                                    report.status === 'RESOLVED' ? '해결됨' : '거부됨'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                            <button className="text-blue-600 hover:text-blue-900 mr-3">상세</button>
                                                            <button className="text-green-600 hover:text-green-900 mr-3">승인</button>
                                                            <button className="text-red-600 hover:text-red-900">거부</button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
