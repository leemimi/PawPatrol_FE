import React, { useState, useRef, useEffect } from 'react'; 
import { ChevronLeft, MapPin, Calendar, Camera, X } from 'lucide-react'; 
import { useNavigate, useParams } from 'react-router-dom'; 
import axios from 'axios';

const Lostmypetfix = () => {
  const navigate = useNavigate();
  const { postId } = useParams();  // Use `useParams` to get the `postId` from the URL
  const fileInputRef = useRef(null);
  const [images, setImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [formData, setFormData] = useState({
    content: null,
    location: "서울시 강남구",
    lostTime: "2025-02-20T10:30:00",
    findTime: null,
    status: "FINDING",
    latitude: 37.5665,
    longitude: 126.978,
  });
  console.log(postId); // Check the value of postId

  useEffect(() => {
        const script = document.createElement("script");
        script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${import.meta.env.VITE_KAKAO_MAP_API_KEY}&autoload=true`;
      
        script.onerror = () => {
          console.error("Failed to load Kakao Maps API.");
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
      
                console.log("Latitude:", lat, "Longitude:", lng);
              });
            });
          } else {
            console.error("Kakao Maps is not available.");
          }
        };
      
        document.body.appendChild(script);
      
        return () => {
          document.body.removeChild(script);
        };
      }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Update the handleImageUpload function
const handleImageUpload = (e) => {
  const files = Array.from(e.target.files);
  
  // Combine new files with existing ones (up to 5)
  const combinedImages = [...images, ...files].slice(0, 5);
  setImages(combinedImages);
  
  // Create and combine preview URLs for all images
  const newPreviewUrls = files.map((file) => URL.createObjectURL(file));
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
    
    const metadataJson = JSON.stringify(formData);
    const formDataToSend = new FormData();
    formDataToSend.append("metadata", metadataJson);
    images.forEach((image) => formDataToSend.append("images", image));
  
    // Ensure postId is correctly being passed as a string or number
    const postUrl = `http://localhost:8090/api/v1/lost-foundposts/${postId}`;
  
    try {
      const response = await axios.put(postUrl, formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("실종 신고가 성공적으로 수정되었습니다.");
      console.log(response.data);
      navigate(-1); // Navigate back after success
    } catch (error) {
      console.error("게시글 수정 중 오류 발생:", error);
      alert("게시글 수정에 실패했습니다.");
    }
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
            <h1 className="text-lg font-bold text-orange-900">실종 게시글 수정</h1>
          </div>
        </div>
      </header>

      {/* Main Form */}
      <main className="pt-14 pb-20 px-4">
        <form onSubmit={handleSubmit} className="space-y-6">
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

          {/* Location & Map */}
                     <div className="bg-white p-4 rounded-2xl border-2 border-orange-100">
                      <div className="flex items-center gap-2 text-orange-400 mb-2">
                        <MapPin size={20} strokeWidth={2.5} />
                        <span className="font-medium">발견 위치</span>
                      </div>
                      <div id="kakaoMap" style={{ width: "100%", height: "300px" }}></div>
                      <button
                        type="button"
                        onClick={() => alert(`위도: ${formData.latitude}, 경도: ${formData.longitude}, 주소: ${formData.location}`)}
                        className="w-full px-4 py-2 mt-4 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors"
                      >
                        위치 등록하기
                      </button>
                    </div>

          <div className="bg-white p-4 rounded-2xl border-2 border-orange-100">
            <div className="flex items-center gap-2 text-orange-400 mb-2">
              <Calendar size={20} strokeWidth={2.5} />
              <span className="font-medium">제보 시간</span>
            </div>
            <input
              type="datetime-local"
              name="lostTime"
              value={formData.lostTime}
              onChange={handleChange}
              className="w-full text-orange-900 focus:outline-none"
            />
          </div>

          <div className="bg-white p-4 rounded-2xl border-2 border-orange-100">
            <input
              type="text"
              name="content"
              placeholder="내용입력"
              value={formData.content}
              onChange={handleChange}
              className="w-full text-orange-900 placeholder-orange-300 focus:outline-none"
            />
          </div>

          

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
              <option value="FINDING">찾는 중</option>
              <option value="FOSTERING">임보 중</option>
              <option value="SIGHTED">발견됨</option>
              <option value="FOUND">주인 찾기 완료</option>
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full px-4 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors"
          >
            수정하기
          </button>
        </form>
      </main>
    </div>
  );
};

export default Lostmypetfix;
