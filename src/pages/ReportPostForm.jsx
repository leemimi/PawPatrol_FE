import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, MapPin, Calendar, Camera, X, Plus, Link } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useLocation } from 'react-router-dom'; // Ensure useLocation is imported
import { KakaoMapApiService } from '../api/kakaoRestApiService';
import Swal from 'sweetalert2';

const ReportPostForm = ({ formType = "standalone" }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [images, setImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [lostPostId, setLostPostId] = useState(null);
  const [formData, setFormData] = useState({
    content: "",
    latitude: null,
    longitude: null,
    location: null,
    lostTime: null,
    findTime: "2025-02-20T10:30:00",
    status: "SIGHTED", // 상태
    petId: null,
    animalType: null
  });

  const location = useLocation(); // Use the location hook

  useEffect(() => {
    if (location.state?.animalType) {
      const animalType = location.state.animalType;
      let defaultContent = "";
      if (animalType === "DOG") {
        defaultContent = "강아지를 발견했어요. 제발 도와주세요.";
      } else if (animalType === "CAT") {
        defaultContent = "고양이를 발견했어요. 제발 도와주세요.";
      } else {
        defaultContent = "반려동물을 발견했어요. 제발 도와주세요.";
      }

      setFormData(prevFormData => ({
        ...prevFormData,
        animalType: location.state.animalType,
        content: defaultContent
      }));
    }
  }, [location.state?.animalType]);


  useEffect(() => {
    const script = document.createElement("script");
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${import.meta.env.VITE_KAKAO_MAP_API_KEY}&autoload=true`;

    script.onerror = () => {
      // console.error("Failed to load Kakao Maps API.");
    };

    script.onload = () => {
      if (window.kakao && window.kakao.maps) {
        window.kakao.maps.load(() => {
          const mapContainer = document.getElementById("kakaoMap");
          const mapOption = {
            center: new window.kakao.maps.LatLng(37.497939, 127.027587), // 기본 서울 중심 좌표
            level: 3, // 줌 레벨
          };
          const map = new window.kakao.maps.Map(mapContainer, mapOption);

          // 마커 초기화
          const marker = new window.kakao.maps.Marker({
            map: map,
            position: map.getCenter(), // 초기 위치 설정 (지도 중심)
          });

          // 지도 클릭 시 마커 위치 갱신
          window.kakao.maps.event.addListener(map, "click", function (mouseEvent) {
            const lat = mouseEvent.latLng.getLat();
            const lng = mouseEvent.latLng.getLng();

            // 클릭된 위치로 마커 이동
            marker.setPosition(mouseEvent.latLng);

            // formData 상태 업데이트 (주소 없이 위도, 경도만 저장)
            setFormData((prevState) => ({
              ...prevState,
              latitude: lat,
              longitude: lng,
            }));

            // console.log("Latitude:", lat, "Longitude:", lng);
          });
        });
      } else {
        // console.error("Kakao Maps is not available.");
      }
    };

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);


  const handleLocationRegister = async () => {
    if (formData.latitude && formData.longitude) {
      try {
        // KakaoMapApiService를 사용하여 좌표를 주소로 변환
        const response = await KakaoMapApiService.getAddressFromCoords(
          formData.longitude,
          formData.latitude
        );

        // console.log("좌표→주소 변환 응답:", response);

        let address = "";

        if (response.resultCode === "200" &&
          response.data.documents &&
          response.data.documents.length > 0) {

          // 도로명 주소 우선, 없으면 지번 주소 사용
          if (response.data.documents[0].road_address) {
            address = response.data.documents[0].road_address.address_name;
          } else if (response.data.documents[0].address) {
            address = response.data.documents[0].address.address_name;
          }

          // 상태 업데이트
          setFormData(prev => ({
            ...prev,
            location: address
          }));
          Swal.fire({
            icon: 'success',
            title: '위치 등록 완료',
            text: `위치가 등록되었습니다. 주소: ${address}`,
            confirmButtonText: '확인'
          });
        } else {
          // 주소 변환 결과가 없는 경우
          const locationText = `위도: ${formData.latitude}, 경도: ${formData.longitude}`;

          setFormData(prev => ({
            ...prev,
            location: locationText
          }));
          Swal.fire({
            title: '오류',
            text: `${locationText}\n(주소 정보를 찾을 수 없습니다)`,
            icon: 'error',
            confirmButtonText: '확인'
          });
        }
      } catch (error) {
        // console.error("주소 변환 중 오류 발생:", error);

        // 오류 시 좌표 정보만 저장
        const locationText = `위도: ${formData.latitude}, 경도: ${formData.longitude}`;

        setFormData(prev => ({
          ...prev,
          location: locationText
        }));
        Swal.fire({
          title: '오류',
          text: `${locationText}\n(주소 변환 중 오류가 발생했습니다)`,
          icon: 'error',
          confirmButtonText: '확인'
        });
      }
    } else {
      Swal.fire({
        title: '오류',
        text: "먼저 지도에서 위치를 선택해주세요.",
        icon: 'error',
        confirmButtonText: '확인'
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const maxSize = 5 * 1024 * 1024; // 5MB 제한

    // 필터링: 크기가 5MB를 넘는 파일은 제외
    const validFiles = files.filter((file) => file.size <= maxSize);

    if (validFiles.length !== files.length) {
      Swal.fire({
        title: '오류',
        text: "파일 크기가 5MB를 초과한 파일이 있습니다. 5MB 이하의 파일만 업로드 가능합니다.",
        icon: 'error',
        confirmButtonText: '확인'
      });
    }

    // Combine new valid files with existing ones (up to 5)
    const combinedImages = [...images, ...validFiles].slice(0, 5);
    setImages(combinedImages);

    // Create and combine preview URLs for all valid images
    const newPreviewUrls = validFiles.map((file) => URL.createObjectURL(file));
    const combinedPreviewUrls = [...previewUrls, ...newPreviewUrls].slice(0, 5);
    setPreviewUrls(combinedPreviewUrls);

    // Reset the file input to allow selecting the same file again
    e.target.value = null;
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
    setPreviewUrls(previewUrls.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();


    if (!formData.location) {
      Swal.fire({
        title: '오류',
        text: "위치를 입력해주세요.",
        icon: 'error',
        confirmButtonText: '확인'
      });
      return;
    }
    const metadataJson = JSON.stringify(formData);
    const formDataToSend = new FormData();
    formDataToSend.append("metadata", metadataJson);
    images.forEach((image) => formDataToSend.append("images", image));

    // API endpoint selection based on formType

    let apiUrl = `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/lost-foundposts`; // 독립게시글

    try {
      const response = await axios.post(
        apiUrl,
        formDataToSend,
        {
          headers: { "Content-Type": "multipart/form-data" }
        }
      );
      Swal.fire({
        icon: 'success',
        title: '발견 신고 등록 완료',
        text: "발견 신고가 성공적으로 등록되었습니다.",
        confirmButtonText: '확인'
      });
      if (location.state?.returnPath === "/rescue") {
        localStorage.setItem('rescueReportData', JSON.stringify({
          postId: response.data.data.id,
          timestamp: new Date().getTime() // 데이터 유효성 검증용 타임스탬프
        }));
        navigate(location.state.returnPath, {
          state: location.state.returnState || {}
        });
      } else {
        navigate("/");
      }
    } catch (error) {
      Swal.fire({
        title: '오류',
        text: "게시글 등록에 실패했습니다.",
        icon: 'error',
        confirmButtonText: '확인'
      });
    }
  };

  const handleLostPostSelect = (selectedPostId) => {
    setLostPostId(selectedPostId);
  };

  return (
    <div className="min-h-screen bg-orange-50">

      {/* Header */}
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
              {formType === "linked" ? "연관 발견 신고" : "반려동물 발견 신고"}
            </h1>
          </div>
        </div>
      </header>

      {/* Main Form */}
      <main className="pt-14 pb-20 px-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Link to Lost Post (only for linked type) */}
          {formType === "linked" && (
            <div className="bg-white p-4 rounded-2xl border-2 border-orange-100">
              <div className="flex items-center gap-2 text-orange-400 mb-2">
                <Link size={20} strokeWidth={2.5} />
                <span className="font-medium">연관 실종 게시글</span>
              </div>
              <input
                type="text"
                value={lostPostId || ""}
                onChange={(e) => setLostPostId(e.target.value)}
                placeholder="실종 게시글 ID를 입력하세요"
                className="w-full text-orange-900 placeholder-orange-300 focus:outline-none"
              />
            </div>
          )}

          <p>동물 타입: {formData.animalType}</p>

          {/* Image Upload */}
          <div className="bg-white p-4 rounded-2xl border-2 border-orange-100">
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

          {/* Title & Content */}
          <div className="bg-white p-4 rounded-2xl border-2 border-orange-100">
            <textarea
              name="content"
              placeholder="내용을 입력하세요"
              value={formData.content}
              onChange={handleChange}
              className="w-full h-32 text-orange-900 placeholder-orange-300 focus:outline-none resize-none"
            />
          </div>

          {/* 지도로 위치 선택 */}
          <div className="bg-white p-4 rounded-2xl border-2 border-orange-100">
            <div className="flex items-center gap-2 text-orange-400 mb-2">
              <MapPin size={20} strokeWidth={2.5} />
              <span className="font-medium">발견 위치</span>
            </div>

            {/* 지도로 위치 선택 */}
            <div id="kakaoMap" style={{ width: "100%", height: "300px" }}></div>

            {/* 선택된 위치와 등록 버튼을 한 줄로 배치 */}
            <div className="flex items-center gap-2 mt-3">
              <div className="flex-1 overflow-hidden">
                <input
                  type="text"
                  name="location"
                  placeholder="지도에서 위치를 선택하세요"
                  value={formData.location || ''}
                  onChange={handleChange}
                  className="w-full text-orange-900 focus:outline-none p-2 border rounded-md truncate"
                />
              </div>
              <button
                type="button"
                onClick={handleLocationRegister}
                className="whitespace-nowrap px-4 py-2 bg-orange-500 text-white rounded-lg shadow-md hover:bg-orange-600 transition"
              >
                위치 등록하기
              </button>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border-2 border-orange-100">
            <div className="flex items-center gap-2 text-orange-400 mb-2">
              <Calendar size={20} strokeWidth={2.5} />
              <span className="font-medium">발견 시간</span>
            </div>
            <input
              type="datetime-local"
              name="findTime"
              value={formData.findTime}
              onChange={handleChange}
              className="w-full text-orange-900 focus:outline-none"
            />
          </div>

          {/* Status */}
          <div className="bg-white p-4 rounded-2xl border-2 border-orange-100">
            <div className="flex items-center gap-2 text-orange-400 mb-2">
              <span className="font-medium">상태 선택</span>
            </div>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full p-2 text-orange-900 border rounded-md"
            >
              <option value="SIGHTED">목격</option>
              <option value="FOSTERING">임보 중</option>
              <option value="SHELTER">보호소</option>
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full px-4 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors"
          >
            등록하기
          </button>
        </form>
      </main>
    </div>
  );
};

export default ReportPostForm;
