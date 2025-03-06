import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, MapPin, Calendar, Camera, X, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const RescueReport = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const mapContainerRef = useRef(null);
    const [mapInstance, setMapInstance] = useState(null);
    const [marker, setMarker] = useState(null);

    const [images, setImages] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);

    const [formData, setFormData] = useState({
        title: '',
        content: '',
        animalType: 'DOG',
        latitude: 37.5665,
        longitude: 126.978,
        locationDescription: '',
        discoveredDate: new Date().toISOString().split('T')[0],
        contact: '',
        status: 'FOUND'
    });

    // 카카오맵 초기화
    useEffect(() => {
        const script = document.createElement('script');
        script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${import.meta.env.VITE_KAKAO_MAP_API_KEY}&autoload=true`;

        script.onerror = () => {
            console.error('Failed to load Kakao Maps API.');
        };

        script.onload = () => {
            if (window.kakao && window.kakao.maps) {
                window.kakao.maps.load(() => {
                    const mapContainer = mapContainerRef.current;
                    const mapOption = {
                        center: new window.kakao.maps.LatLng(formData.latitude, formData.longitude),
                        level: 3
                    };

                    const map = new window.kakao.maps.Map(mapContainer, mapOption);
                    setMapInstance(map);

                    // 초기 마커 설정
                    const markerPosition = new window.kakao.maps.LatLng(formData.latitude, formData.longitude);
                    const newMarker = new window.kakao.maps.Marker({
                        position: markerPosition,
                        map: map
                    });
                    setMarker(newMarker);

                    // 지도 클릭 이벤트
                    window.kakao.maps.event.addListener(map, 'click', function (mouseEvent) {
                        const latlng = mouseEvent.latLng;

                        // 마커 위치 업데이트
                        newMarker.setPosition(latlng);

                        // 폼 데이터 업데이트
                        setFormData(prev => ({
                            ...prev,
                            latitude: latlng.getLat(),
                            longitude: latlng.getLng()
                        }));
                    });
                });
            }
        };

        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

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

        if (!formData.title.trim()) {
            alert('제목을 입력해주세요');
            return;
        }

        if (!formData.content.trim()) {
            alert('내용을 입력해주세요');
            return;
        }

        if (images.length === 0) {
            alert('최소 한 장 이상의 사진을 등록해주세요');
            return;
        }

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
                'http://localhost:8090/api/v1/lost-foundposts',
                submitData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            alert('제보글이 성공적으로 등록되었습니다.');
            console.log(response.data);
            navigate('/map'); // 지도 페이지로 돌아가기
        } catch (error) {
            console.error('제보글 등록 중 오류 발생:', error);
            alert('게시글 등록에 실패했습니다.');
        }
    };

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
                            발견 동물 제보하기
                        </h1>
                    </div>
                </div>
            </header>

            {/* 메인 폼 */}
            <main className="pt-14 pb-20 px-4">
                <div className="bg-white p-4 rounded-2xl border-2 border-orange-100 mb-6">
                    <div className="flex items-center gap-2">
                        <AlertCircle size={20} className="text-orange-500" />
                        <h2 className="font-bold text-orange-800">제보글 작성 안내</h2>
                    </div>
                    <p className="text-sm text-gray-700 mt-2">
                        발견한 동물의 정보를 상세히 기록하면 주인을 찾는데 큰 도움이 됩니다.
                        특히 발견 위치와 시간, 특징을 최대한 자세히 적어주세요.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* 기본 정보 */}
                    <div className="bg-white p-4 rounded-2xl border-2 border-orange-100">
                        <h3 className="font-bold text-orange-800 mb-3">기본 정보</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="ex) 강아지를 발견했습니다. 주인을 찾아주세요."
                                    required
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">동물 종류</label>
                                <select
                                    name="animalType"
                                    value={formData.animalType}
                                    onChange={handleChange}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                                >
                                    <option value="DOG">개</option>
                                    <option value="CAT">고양이</option>
                                    <option value="OTHER">기타</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">상세 내용</label>
                                <textarea
                                    name="content"
                                    value={formData.content}
                                    onChange={handleChange}
                                    placeholder="동물의 특징, 상태, 발견 상황 등을 자세히 적어주세요."
                                    rows={5}
                                    required
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                                ></textarea>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">연락처</label>
                                <input
                                    type="text"
                                    name="contact"
                                    value={formData.contact}
                                    onChange={handleChange}
                                    placeholder="연락 가능한 전화번호나 이메일을 입력해주세요"
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 이미지 업로드 */}
                    <div className="bg-white p-4 rounded-2xl border-2 border-orange-100">
                        <h3 className="font-bold text-orange-800 mb-3">사진 등록</h3>
                        <p className="text-sm text-gray-600 mb-3">동물의 모습을 잘 보여주는 사진을 등록해주세요 (최대 5장)</p>

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

                    {/* 발견 위치 정보 */}
                    <div className="bg-white p-4 rounded-2xl border-2 border-orange-100">
                        <div className="flex items-center gap-2 mb-3">
                            <MapPin size={20} className="text-orange-500" />
                            <h3 className="font-bold text-orange-800">발견 위치</h3>
                        </div>

                        <div className="space-y-4">
                            <div ref={mapContainerRef} style={{ width: "100%", height: "300px" }} className="rounded-lg border border-gray-300"></div>

                            <p className="text-sm text-gray-600">
                                지도를 클릭하여 발견 위치를 정확히 표시해주세요.
                            </p>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">위치 설명</label>
                                <textarea
                                    name="locationDescription"
                                    value={formData.locationDescription}
                                    onChange={handleChange}
                                    placeholder="예: OO아파트 앞 공원, OO역 인근 골목길 등 위치에 대한 추가 설명"
                                    rows={2}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                                ></textarea>
                            </div>
                        </div>
                    </div>

                    {/* 발견 시간 */}
                    <div className="bg-white p-4 rounded-2xl border-2 border-orange-100">
                        <div className="flex items-center gap-2 mb-3">
                            <Calendar size={20} className="text-orange-500" />
                            <h3 className="font-bold text-orange-800">발견 날짜</h3>
                        </div>

                        <input
                            type="date"
                            name="discoveredDate"
                            value={formData.discoveredDate}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                        />
                    </div>

                    {/* 제출 버튼 */}
                    <button
                        type="submit"
                        className="w-full px-4 py-3 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors font-bold"
                    >
                        제보글 등록하기
                    </button>
                </form>
            </main>
        </div>
    );
}

export default RescueReport;
