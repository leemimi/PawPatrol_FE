import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('users');
    const [users, setUsers] = useState([]);
    const [shelters, setShelters] = useState([]);
    const [reports, setReports] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

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

    // 사용자 목록 가져오기
    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v2/admin/users`,
                { withCredentials: true }
            );
            if (response.data.statusCode === 200) {
                setUsers(response.data.data);
            }
        } catch (error) {
            console.error('사용자 목록 불러오기 오류:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // 보호소 목록 가져오기
    const fetchShelters = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v2/admin/shelters`,
                { withCredentials: true }
            );
            if (response.data.statusCode === 200) {
                setShelters(response.data.data);
            }
        } catch (error) {
            console.error('보호소 목록 불러오기 오류:', error);
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
            console.error('신고 목록 불러오기 오류:', error);
        } finally {
            setIsLoading(false);
        }
    };


    // 검색 필터링 함수
    const filteredData = () => {
        if (!searchTerm) {
            switch (activeTab) {
                case 'users': return users;
                case 'shelters': return shelters;
                case 'reports': return reports;
                default: return [];
            }
        }

        const term = searchTerm.toLowerCase();

        switch (activeTab) {
            case 'users':
                return users.filter(user =>
                    user.email?.toLowerCase().includes(term) ||
                    user.nickname?.toLowerCase().includes(term)
                );
            case 'shelters':
                return shelters.filter(shelter =>
                    shelter.name?.toLowerCase().includes(term) ||
                    shelter.address?.toLowerCase().includes(term)
                );
            case 'reports':
                return reports.filter(report =>
                    report.title?.toLowerCase().includes(term) ||
                    report.content?.toLowerCase().includes(term)
                );
            default:
                return [];
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
            navigate('/login-pet');
            return;
        }

        window.scrollTo(0, 0);
        // 초기 데이터 로드
        fetchUsers();
        fetchShelters();
        fetchReports();
    }, [navigate]);

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
                                    setSearchTerm('');
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
                                    setSearchTerm('');
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
                                    setSearchTerm('');
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
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="검색..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                                <div className="absolute left-3 top-2.5">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {isLoading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
                            </div>
                        ) : (
                            <>
                                {activeTab === 'users' && (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이메일</th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">닉네임</th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">가입일</th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">관리</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {filteredData().map(user => (
                                                    <tr key={user.id} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.id}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.nickname}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {new Date(user.createdAt).toLocaleDateString()}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                            <button className="text-blue-600 hover:text-blue-900 mr-3">상세</button>
                                                            <button className="text-red-600 hover:text-red-900">정지</button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {activeTab === 'shelters' && (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
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
                                                {filteredData().map(shelter => (
                                                    <tr key={shelter.id} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{shelter.id}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{shelter.name}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{shelter.address}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{shelter.phone}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                            <button className="text-blue-600 hover:text-blue-900 mr-3">상세</button>
                                                            <button className="text-red-600 hover:text-red-900">비활성화</button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
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
                                                {filteredData().map(report => (
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
