import React, { useState, useEffect } from 'react'; // Add useEffect here
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';



import { 
    MessageSquare, 
    MapPin, 
    Plus,
    Search,
    Dog,
    Cat,
    Filter,
    ChevronLeft,
    X
} from 'lucide-react';

const FilterMenu = ({ isVisible, onClose, onSelect }) => {
    const navigate = useNavigate();
    if (!isVisible) return null;
    const handlerelationlost = () => {
        navigate(`/community`);
        setIsActionMenuVisible(false);
    };
    const handlenonrelationlost = () => {
        navigate(`/LostPetfindstandalonepages`);
        setIsActionMenuVisible(false);
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center" onClick={onClose}>
            <div className="bg-white rounded-2xl overflow-hidden p-4 w-80"> {/* w-80 추가하여 너비 조정 */}
                <h3 className="font-semibold text-lg text-orange-900 mb-4">필터 선택</h3>
                <button className="w-full p-4 bg-white border-2 border-orange-100 rounded-2xl flex justify-center hover:bg-orange-50 transition-colors" onClick={handlerelationlost}>신고글</button>
                <button className="w-full p-4 bg-white border-2 border-orange-100 rounded-2xl flex justify-center hover:bg-orange-50 transition-colors mt-2" onClick={handlenonrelationlost }>독립 제보글</button>
            </div>
        </div>
    );
};

const BottomActionMenu = ({ isVisible, onClose, onLostPetClick, onFoundPetClick }) => {
    if (!isVisible) return null;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={onClose}
        >
            <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl overflow-hidden">
                <div className="p-4 border-b border-orange-100 flex justify-between items-center">
                    <h3 className="font-semibold text-lg text-orange-900">글 작성하기</h3>
                    <button 
                        onClick={onClose}
                        className="text-orange-400 hover:text-orange-500 transition-colors"
                    >
                        <X size={24} strokeWidth={2.5} />
                    </button>
                </div>
                <div className="p-4 space-y-3">
                    <button 
                        onClick={onLostPetClick}
                        className="w-full p-4 bg-white border-2 border-orange-100 rounded-2xl flex items-center gap-3 hover:bg-orange-50 transition-colors"
                    >
                        <Dog size={24} className="text-orange-500" strokeWidth={2.5} />
                        <div className="text-left">
                            <div className="font-semibold text-orange-900">실종 게시글 작성</div>
                            <div className="text-sm text-orange-600">잃어버린 반려동물을 찾아주세요</div>
                        </div>
                    </button>
                    <button 
                        onClick={onFoundPetClick}
                        className="w-full p-4 bg-white border-2 border-orange-100 rounded-2xl flex items-center gap-3 hover:bg-orange-50 transition-colors"
                    >
                        <Cat size={24} className="text-orange-500" strokeWidth={2.5} />
                        <div className="text-left">
                            <div className="font-semibold text-orange-900">제보글 작성</div>
                            <div className="text-sm text-orange-600">발견한 반려동물을 제보해주세요</div>
                        </div>
                    </button>
                </div>
                <div className="h-8 bg-white" /> {/* Safe area for bottom spacing */}
            </div>
        </div>
    );
};

const LostPetListPages = () => {
    const navigate = useNavigate();
    const [isFilterMenuVisible, setIsFilterMenuVisible] = useState(false);
    const [isActionMenuVisible, setIsActionMenuVisible] = useState(false);
    const [posts, setPosts] = useState([]);
    const [currentPage, setCurrentPage] = useState(0); // 현재 페이지 상태 추가
    const [totalPages, setTotalPages] = useState(0); // 전체 페이지 수 상태 추가

    useEffect(() => {
        fetchLostPetPosts();
    }, [currentPage]); // currentPage가 변경될 때마다 데이터 호출

   

    const fetchLostPetPosts = async () => {
        try {
            const response = await axios.get(`http://localhost:8090/api/v1/lost-foundposts?page=${currentPage}&size=5`);
            setPosts(response.data.data.content);  // API 응답 형식에 따라 수정
            setTotalPages(response.data.data.totalPages);  // 전체 페이지 수 설정
            console.log(response.data.data.content);
            // posts 배열의 각 항목에 대해 lostTime을 출력하려면
            response.data.data.content.forEach((post) => {
                console.log(post.lostTime);  // 각 post의 lostTime을 출력
                console.log(post.id);
            });

        } catch (error) {
            console.error('게시글을 불러오는 중 오류 발생:', error);
        }
    };

    

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber); // 페이지 번호를 설정
    };

    const handleTitleClick = (postId) => {
        navigate(`/PetPostDetail/${postId}`);
    };

    const handleGoToLostPetRegistration = () => {
        navigate('/lost-pet-registration');
        setIsActionMenuVisible(false);
    };

    const handleGoToFindPetReport = () => {
        navigate('/find-pet-report');
        setIsActionMenuVisible(false);
    };

    return (
        <div className="min-h-screen bg-orange-50">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-10">
                <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-2">
                        <button className="p-1 text-orange-400 hover:text-orange-500 transition-colors">
                            <ChevronLeft size={24} strokeWidth={2.5} />
                        </button>
                        <h1 className="text-lg font-bold text-orange-900">실종 반려동물</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-2 text-orange-400 hover:text-orange-500 transition-colors rounded-full">
                            <Search size={24} strokeWidth={2.5} />
                        </button>
                        <button 
                            className="p-2 text-orange-400 hover:text-orange-500 transition-colors rounded-full"
                            onClick={() => setIsFilterMenuVisible(true)}
                        >
                            <Filter size={24} strokeWidth={2.5} />
                        </button>
                    </div>
                </div>
            </header>

            <FilterMenu 
                isVisible={isFilterMenuVisible} 
                onClose={() => setIsFilterMenuVisible(false)}
                onSelect={(filter) => {
                    console.log(`Selected filter: ${filter}`);
                    setIsFilterMenuVisible(false);
                }}
            />

            {/* Main Content */}
            <main className="pt-14 pb-20 px-4">
                {posts.map((post) => (
                    <article 
                        key={post.id} 
                        className="bg-white mb-4 rounded-2xl shadow-sm overflow-hidden border-2 border-orange-100"
                    >
                        <div className="p-4">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="bg-orange-100 text-orange-500 px-3 py-1.5 rounded-full text-sm font-medium">
                                            {post.status}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                        {post.findTime 
  ? format(new Date(post.findTime.replace(' ', 'T')), 'yyyy-MM-dd HH:mm:ss') 
  : post.lostTime 
    ? format(new Date(post.lostTime.replace(' ', 'T')), 'yyyy-MM-dd HH:mm:ss') 
    : 'No time available'}

                                        </span>





                                    </div>

                                    <h3 
                                        className="font-bold text-lg text-orange-900 mb-2 cursor-pointer hover:text-orange-700 transition-colors"
                                        onClick={() => handleTitleClick(post.foundId)}
                                    >
                                        {post.content}
                                    </h3>

                                    

                                    <div className="flex items-center gap-2 text-orange-600 text-sm mb-3">
                                        <MapPin size={16} strokeWidth={2.5} />
                                        <span>{post.latitude} , {post.longitude}</span>
                                    </div>

                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {post.tags && post.tags.split('#').map((tag, index) => (
                                            <span 
                                                key={index}
                                                className="bg-orange-50 text-orange-600 px-3 py-1.5 rounded-full text-sm"
                                            >
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="flex items-center gap-2 text-orange-400">
                                        <MessageSquare size={16} strokeWidth={2.5} />
                                        <span className="text-sm">댓글 {post.commentCount}</span>
                                    </div>
                                </div>

                                <div className="ml-4">
                                    <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-orange-100">
                                        <img 
                                            src={post.imageUrl} 
                                            alt={post.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </article>
                ))}
                 {/* Pagination */}
                 <div className="flex justify-center mt-6">
                    {[...Array(totalPages)].map((_, index) => (
                        <button 
                            key={index}
                            onClick={() => handlePageChange(index)}
                            className={`px-4 py-2 border ${currentPage === index ? 'bg-orange-500 text-white' : 'bg-white text-orange-500'} rounded-full mx-1`}
                        >
                            {index + 1}
                        </button>
                    ))}
                </div>
            </main>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-orange-100">
                <div className="flex justify-around py-3">
                    <button className="flex flex-col items-center gap-1 text-orange-400 hover:text-orange-500 transition-colors">
                        <Dog size={24} strokeWidth={2.5} />
                        <span className="text-xs font-medium">실종신고</span>
                    </button>
                    <button 
                        className="flex flex-col items-center gap-1 text-orange-400 hover:text-orange-500 transition-colors"
                        onClick={handleGoToFindPetReport}
                    >
                        <Cat size={24} strokeWidth={2.5} />
                        <span className="text-xs font-medium">목격제보</span>
                    </button>
                    <button className="flex flex-col items-center gap-1 text-orange-400 hover:text-orange-500 transition-colors">
                        <MessageSquare size={24} strokeWidth={2.5} />
                        <span className="text-xs font-medium">채팅</span>
                    </button>
                </div>
            </nav>

            {/* Floating Action Button */}
            <button
                className="fixed right-4 bottom-20 bg-orange-500 text-white p-4 rounded-full shadow-lg hover:bg-orange-600 transition-colors"
                aria-label="글쓰기"
                onClick={() => setIsActionMenuVisible(true)}
            >
                <Plus size={24} strokeWidth={2.5} />
            </button>

            {/* Action Menu */}
            <BottomActionMenu 
                isVisible={isActionMenuVisible}
                onClose={() => setIsActionMenuVisible(false)}
                onLostPetClick={handleGoToLostPetRegistration}
                onFoundPetClick={handleGoToFindPetReport}
            />
        </div>
    );
};

export default LostPetListPages;