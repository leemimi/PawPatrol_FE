import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, MapPin, Pencil, Camera, X, Plus } from 'lucide-react';
import { useAnimalForm } from '../../hooks/useProtections';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const RegisterAnimalForm = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [isLoading, setIsLoading] = useState(false);

    // 상태 변경: 기존 이미지와 새 이미지를 분리해서 관리
    const [existingImageUrls, setExistingImageUrls] = useState([]); // API에서 가져온 이미지 URL
    const [newImages, setNewImages] = useState([]); // 사용자가 추가한 파일
    const [newImagePreviewUrls, setNewImagePreviewUrls] = useState([]); // 사용자가 추가한 이미지 URL

    // useAnimalForm 훅 사용
    const { submitting, error, registerAnimal } = useAnimalForm();

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        location: "",
        breed: "",
        gender: "MALE",
        size: "MEDIUM",
        feature: "",
        healthCondition: "",
        name: "",
        estimatedAge: "",
        registrationNo: "",
        animalType: "DOG"
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // 이미지 업로드 함수 수정
    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        const maxFiles = 5 - (existingImageUrls.length + newImages.length); // 최대 5개까지만 가능
        const filesToAdd = files.slice(0, maxFiles);

        setNewImages([...newImages, ...filesToAdd]);
        const newUrls = filesToAdd.map(file => URL.createObjectURL(file));
        setNewImagePreviewUrls([...newImagePreviewUrls, ...newUrls]);

        e.target.value = null;
    };

    // 이미지 삭제 함수 수정
    const removeExistingImage = (index) => {
        const updatedUrls = existingImageUrls.filter((_, i) => i !== index);
        setExistingImageUrls(updatedUrls);
    };

    const removeNewImage = (index) => {
        const updatedImages = newImages.filter((_, i) => i !== index);
        const updatedUrls = newImagePreviewUrls.filter((_, i) => i !== index);
        setNewImages(updatedImages);
        setNewImagePreviewUrls(updatedUrls);
    };

    // 폼 제출 함수 수정
    const handleSubmit = async (e) => {
        e.preventDefault();

        const formDataToSend = new FormData();

        const metadataToSend = {
            ...formData,
            animalImageUrls: existingImageUrls, // API에서 가져온 이미지 URL만 전달
            gender: formData.gender === 'MALE' ? 'M' : formData.gender === 'FEMALE' ? 'F' : 'UNKNOWN',
            registrationNo: formData.registrationNo.trim() === "" ? null : formData.registrationNo
        };

        formDataToSend.append('metadata', JSON.stringify(metadataToSend));

        // 새로 추가한 이미지 파일만 전송
        newImages.forEach((image) => {
            formDataToSend.append('images', image);
        });

        try {
            await registerAnimal(formDataToSend);
            alert("임시보호 동물이 성공적으로 등록되었습니다.");
            navigate(-1);
        } catch (error) {
            console.error("동물 등록 중 오류 발생:", error);
            alert("동물 등록에 실패했습니다." + (error.response?.data?.message || ""));
        }
    };

    // 페이지 로드 시 스크롤을 최상단으로 이동
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // API 요청에서 이미지 로딩 부분 수정
    useEffect(() => {
        // 구조 가이드에서 넘어온 제보글 데이터가 있는 경우
        if (location.state?.fromRescueReport && location.state?.rescueReportData) {
            const reportData = location.state.rescueReportData;

            // postId가 있는 경우 API 요청
            if (reportData.postId) {
                setIsLoading(true);

                axios.get(`${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/lost-foundposts/${reportData.postId}`)
                    .then(response => {
                        const postData = response.data.data;

                        // 제보글 정보를 임시보호 등록 폼에 적용
                        const descriptionFromReport = `발견 위치 : ${postData.location || '정보 없음'}
발견 시간 : ${postData.findTime ? new Date(postData.findTime).toLocaleString() : '정보 없음'}
제보 내용 : ${postData.content || '정보 없음'}
                        `;

                        setFormData(prev => ({
                            ...prev,
                            animalType: postData.animalType || prev.animalType,
                            description: descriptionFromReport,
                            title: `구조한 ${postData.animalType === 'DOG' ? '강아지' : '고양이'} 임시보호 중입니다`
                        }));

                        // 이미지 URL이 있는 경우 미리보기 설정
                        if (postData.images && postData.images.length > 0) {
                            const imageUrls = postData.images.map(img => img.path || '').filter(url => url !== '');
                            setExistingImageUrls(imageUrls); // API 이미지 URL 저장
                        }

                        setIsLoading(false);
                    })
                    .catch(error => {
                        console.error("제보글 데이터 가져오기 실패:", error);
                        setIsLoading(false);
                        alert("제보글 정보를 가져오는데 실패했습니다.");
                    });
            }
        }
        // 동물 타입만 선택된 경우
        else if (location.state?.animalType) {
            setFormData(prev => ({
                ...prev,
                animalType: location.state.animalType
            }));
        }
    }, [location.state]);

    const animalTypeText = formData.animalType === 'DOG' ? '강아지' : formData.animalType === 'CAT' ? '고양이' : '알 수 없음';

    return (
        <div className="min-h-screen bg-orange-50">
            <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-10">
                <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-1 text-orange-400 hover:text-orange-500 transition-colors"
                        >
                            <ChevronLeft size={24} strokeWidth={2.5} />
                        </button>
                        <h1 className="text-lg font-bold text-orange-900">
                            임시보호/입양 동물 등록
                        </h1>
                    </div>
                </div>
            </header>

            <main className="pt-20 pb-20 px-4">
                {isLoading ? (
                    <div className="flex justify-center items-center h-40">
                        <p className="text-orange-500 font-medium">데이터를 불러오는 중입니다...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="bg-white p-4 rounded-2xl border-2 border-orange-100">
                            <div className="flex items-center gap-2 text-orange-400 mb-2">
                                <Camera size={20} strokeWidth={2.5} />
                                <span className="font-medium">동물 사진</span>
                                {existingImageUrls.length > 0 && (
                                    <span className="text-xs text-green-600">(제보글에서 가져온 이미지 포함)</span>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {/* 기존 API 이미지 표시 */}
                                {existingImageUrls.map((url, index) => (
                                    <div key={`existing-${index}`} className="relative w-24 h-24">
                                        <img
                                            src={url}
                                            alt={`API 이미지 ${index + 1}`}
                                            className="w-full h-full object-cover rounded-xl"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeExistingImage(index)}
                                            className="absolute -top-2 -right-2 bg-orange-500 text-white rounded-full p-1"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}

                                {/* 새로 추가한 이미지 표시 */}
                                {newImagePreviewUrls.map((url, index) => (
                                    <div key={`new-${index}`} className="relative w-24 h-24">
                                        <img
                                            src={url}
                                            alt={`새 이미지 ${index + 1}`}
                                            className="w-full h-full object-cover rounded-xl"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeNewImage(index)}
                                            className="absolute -top-2 -right-2 bg-orange-500 text-white rounded-full p-1"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}

                                {/* 이미지 추가 버튼 */}
                                {existingImageUrls.length + newImages.length < 5 && (
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-24 h-24 flex items-center justify-center border-2 border-dashed border-orange-200 rounded-xl text-orange-400 hover:border-orange-300 hover:text-orange-500 transition-colors"
                                    >
                                        <Plus size={24} strokeWidth={2.5} />
                                    </button>
                                )}
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageUpload}
                                multiple
                                accept="image/*"
                                className="hidden"
                            />
                        </div>

                        <div className="bg-white p-4 rounded-2xl border-2 border-orange-100">
                            <div className="flex items-center gap-2 text-orange-400 mb-2">
                                <Pencil size={20} strokeWidth={2.5} />
                                <span className="font-medium">기본 정보</span>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-orange-900 mb-1">제목</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        placeholder="제목을 입력하세요"
                                        className="w-full p-2 border border-orange-200 rounded-lg text-orange-900 placeholder-orange-300 focus:outline-none focus:border-orange-400"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-orange-900 mb-1">이름</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="동물의 이름을 입력하세요"
                                        className="w-full p-2 border border-orange-200 rounded-lg text-orange-900 placeholder-orange-300 focus:outline-none focus:border-orange-400"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-orange-900 mb-1">종류</label>
                                        <div className="w-full p-2 border border-orange-200 rounded-lg text-orange-900 bg-gray-50">
                                            {animalTypeText}
                                        </div>
                                        <input type="hidden" name="animalType" value={formData.animalType} />
                                    </div>

                                    <div>
                                        <label className="block text-sm text-orange-900 mb-1">품종</label>
                                        <input
                                            type="text"
                                            name="breed"
                                            value={formData.breed}
                                            onChange={handleChange}
                                            placeholder="품종을 입력하세요"
                                            className="w-full p-2 border border-orange-200 rounded-lg text-orange-900 placeholder-orange-300 focus:outline-none focus:border-orange-400"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-orange-900 mb-1">성별</label>
                                        <select
                                            name="gender"
                                            value={formData.gender}
                                            onChange={handleChange}
                                            className="w-full p-2 border border-orange-200 rounded-lg text-orange-900 focus:outline-none focus:border-orange-400"
                                        >
                                            <option value="MALE">수컷</option>
                                            <option value="FEMALE">암컷</option>
                                            <option value="UNKNOWN">알 수 없음</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm text-orange-900 mb-1">크기</label>
                                        <select
                                            name="size"
                                            value={formData.size}
                                            onChange={handleChange}
                                            className="w-full p-2 border border-orange-200 rounded-lg text-orange-900 focus:outline-none focus:border-orange-400"
                                        >
                                            <option value="SMALL">소형</option>
                                            <option value="MEDIUM">중형</option>
                                            <option value="LARGE">대형</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm text-orange-900 mb-1">위치</label>
                                    <input
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        placeholder="간단한 위치 정보를 입력하세요 (예: 서울시 강남구)"
                                        className="w-full p-2 border border-orange-200 rounded-lg text-orange-900 placeholder-orange-300 focus:outline-none focus:border-orange-400"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-orange-900 mb-1">추정 나이</label>
                                    <input
                                        type="text"
                                        name="estimatedAge"
                                        value={formData.estimatedAge}
                                        onChange={handleChange}
                                        placeholder="추정 나이를 입력하세요"
                                        className="w-full p-2 border border-orange-200 rounded-lg text-orange-900 placeholder-orange-300 focus:outline-none focus:border-orange-400"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-orange-900 mb-1">동물등록번호</label>
                                    <input
                                        type="text"
                                        name="registrationNo"
                                        value={formData.registrationNo}
                                        onChange={handleChange}
                                        placeholder="동물등록번호가 있다면 입력하세요"
                                        className="w-full p-2 border border-orange-200 rounded-lg text-orange-900 placeholder-orange-300 focus:outline-none focus:border-orange-400"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-2xl border-2 border-orange-100">
                            <div className="flex items-center gap-2 text-orange-400 mb-2">
                                <Pencil size={20} strokeWidth={2.5} />
                                <span className="font-medium">상세 정보</span>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-orange-900 mb-1">특징</label>
                                    <textarea
                                        name="feature"
                                        value={formData.feature}
                                        onChange={handleChange}
                                        placeholder="동물의 특징을 입력하세요 (예: 색상, 성격 등)"
                                        className="w-full h-24 p-2 border border-orange-200 rounded-lg text-orange-900 placeholder-orange-300 focus:outline-none focus:border-orange-400 resize-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-orange-900 mb-1">건강상태</label>
                                    <textarea
                                        name="healthCondition"
                                        value={formData.healthCondition}
                                        onChange={handleChange}
                                        placeholder="건강상태에 대해 입력하세요 (예: 중성화 여부, 예방접종 등)"
                                        className="w-full h-24 p-2 border border-orange-200 rounded-lg text-orange-900 placeholder-orange-300 focus:outline-none focus:border-orange-400 resize-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-orange-900 mb-1">상세 설명</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        placeholder="임시보호가 필요한 이유나 상세 정보를 입력하세요"
                                        className="w-full h-32 p-2 border border-orange-200 rounded-lg text-orange-900 placeholder-orange-300 focus:outline-none focus:border-orange-400 resize-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full px-4 py-3 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors font-medium disabled:bg-orange-300"
                        >
                            {submitting ? "등록 중..." : "임시보호 동물 등록하기"}
                        </button>
                    </form>
                )}
            </main>
        </div>
    );
};

export default RegisterAnimalForm;