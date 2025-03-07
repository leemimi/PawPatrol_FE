import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, MapPin, Pencil, Camera, X, Plus } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAnimalForm } from '../../hooks/useProtections';

const EditAnimalForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [images, setImages] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);

    // useAnimalForm 훅 사용
    const { loading, submitting, error, initialData, updateAnimal } = useAnimalForm(id);

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

    // 훅에서 초기 데이터를 받아오면 폼 데이터 설정
    useEffect(() => {
        if (initialData) {
            setFormData(initialData.formData);

            // 이미지가 있는 경우 미리보기 설정
            if (initialData.imageUrl) {
                setPreviewUrls([initialData.imageUrl]);
            }
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        setImages([...images, ...files]);

        const newPreviewUrls = files.map((file) => URL.createObjectURL(file));
        setPreviewUrls((prev) => {
            // 기존 URL이 실제 서버 URL인 경우(http로 시작하는 경우) 유지하고, 새로운 미리보기 URL 추가
            const filteredPrev = prev.filter(url => url.startsWith('http'));
            return [...filteredPrev, ...newPreviewUrls];
        });
    };

    const removeImage = (index) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        setImages(newImages);

        const newPreviewUrls = [...previewUrls];
        newPreviewUrls.splice(index, 1);
        setPreviewUrls(newPreviewUrls);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formDataToSend = new FormData();

        const metadataToSend = {
            ...formData,
            gender: formData.gender === 'MALE' ? 'M' : formData.gender === 'FEMALE' ? 'F' : 'UNKNOWN',
            registrationNo: formData.registrationNo.trim() === "" ? null : formData.registrationNo
        };

        formDataToSend.append('metadata', JSON.stringify(metadataToSend));

        // 새로 추가된 이미지만 전송
        images.forEach((image) => {
            formDataToSend.append('images', image);
        });

        try {
            await updateAnimal(id, formDataToSend);
            alert("정보가 성공적으로 수정되었습니다.");
            navigate(`/protection/${id}`);
        } catch (error) {
            console.error("동물 정보 수정 중 오류 발생:", error);
            alert("정보 수정에 실패했습니다." + (error.response?.data?.message || ""));
        }
    };

    // 페이지 로드 시 스크롤을 최상단으로 이동
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-orange-50 flex justify-center items-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-orange-500"></div>
            </div>
        );
    }

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
                            임시보호/입양 동물 정보 수정
                        </h1>
                    </div>
                </div>
            </header>

            <main className="pt-20 pb-20 px-4">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-white p-4 rounded-2xl border-2 border-orange-100">
                        <div className="flex items-center gap-2 text-orange-400 mb-2">
                            <Camera size={20} strokeWidth={2.5} />
                            <span className="font-medium">동물 사진</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {previewUrls.map((url, index) => (
                                <div key={index} className="relative w-24 h-24">
                                    <img
                                        src={url}
                                        alt={`미리보기 ${index + 1}`}
                                        className="w-full h-full object-cover rounded-xl"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="absolute -top-2 -right-2 bg-orange-500 text-white rounded-full p-1"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}
                            {previewUrls.length < 5 && (
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
                                    <select
                                        name="animalType"
                                        value={formData.animalType}
                                        onChange={handleChange}
                                        className="w-full p-2 border border-orange-200 rounded-lg text-orange-900 focus:outline-none focus:border-orange-400"
                                    >
                                        <option value="DOG">강아지</option>
                                        <option value="CAT">고양이</option>
                                    </select>
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
                        {submitting ? "수정 중..." : "정보 수정하기"}
                    </button>
                </form>
            </main>
        </div>
    );
};

export default EditAnimalForm;