import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Camera, X, CalendarDays, MapPin, Info, AlertTriangle } from 'lucide-react';
import axios from 'axios';

const RescueProtection = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [images, setImages] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);
    const [showTerms, setShowTerms] = useState(false);

    const [formData, setFormData] = useState({
        animalType: '',
        breed: '',
        estimatedAge: '',
        gender: '',
        neutered: 'UNKNOWN',
        weight: '',
        rescueLocation: '',
        rescueDate: new Date().toISOString().split('T')[0],
        healthStatus: '',
        specialNeeds: '',
        temperament: '',
        careCommitment: '2weeks',
        contact: '',
        description: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // 여기로 함수들을 옮겨서 선언 - 컴포넌트 반환문 이전에 선언되어야 함
    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);

        // 최대 5개 이미지 제한
        const combinedImages = [...images, ...files].slice(0, 5);
        setImages(combinedImages);

        // 미리보기 URL 생성
        const newPreviewUrls = files.map(file => URL.createObjectURL(file));
        const combinedPreviewUrls = [...previewUrls, ...newPreviewUrls].slice(0, 5);
        setPreviewUrls(combinedPreviewUrls);

        // 파일 선택 초기화 (같은 파일 다시 선택 가능하도록)
        e.target.value = null;
    };

    const removeImage = (index) => {
        // 이미지와 미리보기 URL 제거
        setImages(images.filter((_, i) => i !== index));

        // 미리보기 URL 제거하고 메모리 누수 방지를 위해 URL 객체 해제
        const urlToRevoke = previewUrls[index];
        URL.revokeObjectURL(urlToRevoke);
        setPreviewUrls(previewUrls.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // FormData 객체 생성 및 데이터 추가
        const submitData = new FormData();

        // JSON 메타데이터 추가
        const metadataJson = JSON.stringify(formData);
        submitData.append('metadata', metadataJson);

        // 이미지 파일 추가
        images.forEach(image => {
            submitData.append('images', image);
        });

        try {
            // API 요청
            const response = await axios.post(
                'http://localhost:8090/api/v1/temp-care/apply',
                submitData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            alert('임시보호 신청이 완료되었습니다.');
            console.log(response.data);
            navigate('/map'); // 지도 페이지로 돌아가기
        } catch (error) {
            console.error('임시보호 신청 중 오류 발생:', error);
            alert('신청 중 오류가 발생했습니다. 다시 시도해주세요.');
        }
    };

    // 임시보호 기간 옵션
    const careCommitmentOptions = [
        { value: '2weeks', label: '2주 이내' },
        { value: '1month', label: '1개월 이내' },
        { value: '3months', label: '3개월 이내' },
        { value: 'untilAdoption', label: '입양될 때까지' }
    ];

    return (
        <div className="min-h-screen bg-orange-50 pb-10">
            {/* 헤더 */}
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
                            임시보호 신청
                        </h1>
                    </div>
                </div>
            </header>

            {/* 메인 폼 */}
            <main className="pt-14 pb-20 px-4">
                <div className="bg-white p-4 rounded-2xl border-2 border-orange-100 mb-6">
                    <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle size={20} className="text-orange-500" />
                        <h2 className="font-bold text-orange-800">임시보호 안내</h2>
                    </div>
                    <p className="text-sm text-gray-700">
                        임시보호는 동물이 영구적인 가정을 찾을 때까지 일시적으로 돌봄을 제공하는 것입니다.
                        주로 2주에서 3개월까지 돌봄이 필요하며, 필요한 경우 더 길어질 수 있습니다.
                    </p>
                    <button
                        className="mt-3 text-sm text-orange-500 font-medium"
                        onClick={() => setShowTerms(!showTerms)}
                    >
                        상세 안내 {showTerms ? '접기' : '보기'}
                    </button>

                    {showTerms && (
                        <div className="mt-3 p-3 bg-orange-50 rounded-lg text-sm text-gray-700 space-y-2">
                            <p><span className="font-medium">책임:</span> 임시보호 기간 동안 동물의 기본적인 돌봄(먹이, 물, 쉴 공간, 운동)을 제공해야 합니다.</p>
                            <p><span className="font-medium">비용:</span> 기본적인 식비와 필수품은 보호자가 부담하며, 의료비는 케이스에 따라 단체와 협의할 수 있습니다.</p>
                            <p><span className="font-medium">시간:</span> 충분한 관심과 시간을 할애할 수 있어야 합니다.</p>
                            <p><span className="font-medium">공간:</span> 동물이 안전하게 생활할 수 있는 적절한 공간이 필요합니다.</p>
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* 동물 정보 섹션 */}
                    <div className="bg-white p-4 rounded-2xl border-2 border-orange-100">
                        <h3 className="font-bold text-orange-800 mb-3">동물 기본 정보</h3>

                        <div className="space-y-4">
                            <div className="flex gap-3">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">동물 종류</label>
                                    <select
                                        name="animalType"
                                        value={formData.animalType}
                                        onChange={handleChange}
                                        required
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                                    >
                                        <option value="">선택해주세요</option>
                                        <option value="DOG">개</option>
                                        <option value="CAT">고양이</option>
                                        <option value="OTHER">기타</option>
                                    </select>
                                </div>

                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">품종</label>
                                    <input
                                        type="text"
                                        name="breed"
                                        value={formData.breed}
                                        onChange={handleChange}
                                        placeholder="모르는 경우 '모름'"
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">예상 나이</label>
                                    <input
                                        type="text"
                                        name="estimatedAge"
                                        value={formData.estimatedAge}
                                        onChange={handleChange}
                                        placeholder="예: 약 2살, 6개월 등"
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                                    />
                                </div>

                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">성별</label>
                                    <select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleChange}
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                                    >
                                        <option value="">선택해주세요</option>
                                        <option value="MALE">수컷</option>
                                        <option value="FEMALE">암컷</option>
                                        <option value="UNKNOWN">모름</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">중성화 여부</label>
                                    <select
                                        name="neutered"
                                        value={formData.neutered}
                                        onChange={handleChange}
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                                    >
                                        <option value="YES">예</option>
                                        <option value="NO">아니오</option>
                                        <option value="UNKNOWN">모름</option>
                                    </select>
                                </div>

                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">체중(kg)</label>
                                    <input
                                        type="text"
                                        name="weight"
                                        value={formData.weight}
                                        onChange={handleChange}
                                        placeholder="미상이면 '모름'"
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 구조 정보 섹션 */}
                    <div className="bg-white p-4 rounded-2xl border-2 border-orange-100">
                        <h3 className="font-bold text-orange-800 mb-3">구조 정보</h3>

                        <div className="space-y-4">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <MapPin size={16} className="text-orange-500" />
                                    <label className="text-sm font-medium text-gray-700">구조 위치</label>
                                </div>
                                <input
                                    type="text"
                                    name="rescueLocation"
                                    value={formData.rescueLocation}
                                    onChange={handleChange}
                                    placeholder="구조한 장소를 입력해주세요"
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                                />
                            </div>

                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <CalendarDays size={16} className="text-orange-500" />
                                    <label className="text-sm font-medium text-gray-700">구조 날짜</label>
                                </div>
                                <input
                                    type="date"
                                    name="rescueDate"
                                    value={formData.rescueDate}
                                    onChange={handleChange}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 이미지 업로드 섹션 */}
                    <div className="bg-white p-4 rounded-2xl border-2 border-orange-100">
                        <h3 className="font-bold text-orange-800 mb-3">사진 등록</h3>
                        <p className="text-sm text-gray-600 mb-3">동물의 상태와 특징을 잘 보여주는 사진을 등록해주세요 (최대 5장)</p>

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
                                    <Camera size={24} strokeWidth={2.5} />
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

                    {/* 건강 및 특이사항 */}
                    <div className="bg-white p-4 rounded-2xl border-2 border-orange-100">
                        <h3 className="font-bold text-orange-800 mb-3">건강 및 특이사항</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">건강 상태</label>
                                <textarea
                                    name="healthStatus"
                                    value={formData.healthStatus}
                                    onChange={handleChange}
                                    placeholder="동물의 건강 상태에 대해 알려주세요. 부상이나 질병이 있다면 상세히 적어주세요."
                                    rows={3}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                                ></textarea>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">특별 관리 사항</label>
                                <textarea
                                    name="specialNeeds"
                                    value={formData.specialNeeds}
                                    onChange={handleChange}
                                    placeholder="특별한 관리가 필요한 사항이 있다면 적어주세요 (약물, 식이요법, 알러지 등)"
                                    rows={3}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                                ></textarea>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">성격</label>
                                <textarea
                                    name="temperament"
                                    value={formData.temperament}
                                    onChange={handleChange}
                                    placeholder="동물의 성격이나 행동 특성에 대해 알려주세요."
                                    rows={3}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                                ></textarea>
                            </div>
                        </div>
                    </div>

                    {/* 임시보호 정보 */}
                    <div className="bg-white p-4 rounded-2xl border-2 border-orange-100">
                        <h3 className="font-bold text-orange-800 mb-3">임시보호 정보</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">임시보호 가능 기간</label>
                                <select
                                    name="careCommitment"
                                    value={formData.careCommitment}
                                    onChange={handleChange}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                                >
                                    {careCommitmentOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">연락처</label>
                                <input
                                    type="text"
                                    name="contact"
                                    value={formData.contact}
                                    onChange={handleChange}
                                    placeholder="연락 가능한 전화번호를 입력해주세요"
                                    required
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">추가 설명</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="기타 알려주고 싶은 사항이 있다면 자유롭게 작성해주세요."
                                    rows={4}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                                ></textarea>
                            </div>
                        </div>
                    </div>

                    {/* 제출 버튼 */}
                    <button
                        type="submit"
                        className="w-full px-4 py-3 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors font-bold"
                    >
                        임시보호 신청하기
                    </button>
                </form>
            </main>
        </div>
    );
};

export default RescueProtection;