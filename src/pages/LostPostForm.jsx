import React, { useState, useRef, useEffect} from 'react';
import { ChevronLeft, MapPin, Calendar, Camera, X, Plus, Pencil } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const LostPostForm = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [images, setImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [petsData, setPetsData] = useState([]);
  const [showPetSelection, setShowPetSelection] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);
  
  const [formData, setFormData] = useState({
    content: "강아지를 발견했어요. 제발 도와주세요.",
    latitude: 37.5665,
    longitude: 126.978,
    location: "서울시 강남구",
    lostTime: "2025-02-20T10:30:00",
    findTime: null,
    status: "SIGHTED", // 상태
    petId: null,
    animalType: null
  });

  // Fetch pets list
  useEffect(() => {
    const fetchPets = async () => {
      try {
        const response = await axios.get("http://localhost:8090/api/v1/animals/list");
        setPetsData(response.data.data); // This accesses the actual list of pets
        //console.log(petsData);  // Add this to check the response in the console

      } catch (error) {
        console.error("Failed to fetch pets:", error);
      }
    };
    
    fetchPets();
  }, []);

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

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    const newPreviewUrls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls(newPreviewUrls);
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
    setPreviewUrls(previewUrls.filter((_, i) => i !== index));
  };

  const handlePetSelect = (pet) => {
    setSelectedPet(pet);
    console.log(pet); // 확인하여 id가 존재하는지 확인

    setFormData(prev => {
      const updatedFormData = {
        ...prev,
        petId: pet.id
      };
      console.log(updatedFormData); // formData 값 확인
      return updatedFormData;
    });
    setShowPetSelection(false);
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    const metadataJson = JSON.stringify(formData);
    const formDataToSend = new FormData();
    formDataToSend.append("metadata", metadataJson);
    images.forEach((image) => formDataToSend.append("images", image));

    // API endpoint selection based on formType
    let apiUrl = "http://localhost:8090/api/v1/lost-foundposts"; 

    try {
      const response = await axios.post(
        apiUrl,
        formDataToSend,
        {
          headers: { "Content-Type": "multipart/form-data" }
        }
      );
      alert("발견 신고가 성공적으로 등록되었습니다.");
      console.log(response.data);
      navigate(-1);
    } catch (error) {
      console.error("게시글 등록 중 오류 발생:", error);
      alert("게시글 등록에 실패했습니다.");
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
            <h1 className="text-lg font-bold text-orange-900">
              {"반려동물 찾아주세요 신고글"}
            </h1>
          </div>
        </div>
      </header>

      {/* Main Form */}
      <main className="pt-14 pb-20 px-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Pet Selection */}
          <div className="bg-white p-4 rounded-2xl border-2 border-orange-100">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-orange-400">
                <Pencil size={20} strokeWidth={2.5} />
                <span className="font-medium">반려동물 선택</span>
              </div>
              <button
                type="button"
                onClick={() => setShowPetSelection(!showPetSelection)}
                className="px-3 py-1 bg-orange-500 text-white text-sm rounded-full hover:bg-orange-600 transition-colors"
              >
                {selectedPet ? "변경하기" : "선택하기"}
              </button>
            </div>
            
            {selectedPet && (
              <div className="flex items-center p-2 border rounded-lg">
                {selectedPet.imageUrl && (
                  <img 
                    src={selectedPet.imageUrl} 
                    alt={selectedPet.name} 
                    className="w-16 h-16 rounded-full object-cover mr-3"
                  />
                )}
                <div>
                  <p className="font-medium">{selectedPet.name}</p>
                  <p className="text-sm text-gray-500">{selectedPet.animalType} / {selectedPet.breed}</p>
                </div>
              </div>
            )}
            
            {showPetSelection && (
              <div className="mt-3 max-h-60 overflow-y-auto border rounded-lg">
                {petsData.length > 0 ? petsData.map((pet) => (
                  <div 
                    key={pet.id}
                    onClick={() => handlePetSelect(pet)}
                    className="flex items-center p-3 border-b hover:bg-orange-50 cursor-pointer"
                  >
                    {pet.imageUrl && (
                      <img 
                        src={pet.imageUrl} 
                        alt={pet.name} 
                        className="w-12 h-12 rounded-full object-cover mr-3"
                      />
                    )}
                    <div>
                      <p className="font-medium">{pet.name}</p>
                      <p className="text-sm text-gray-500">{pet.animalType} / {pet.breed}</p>
                    </div>
                  </div>
                )) : (
                  <p className="p-3 text-center text-gray-500">등록된 반려동물이 없습니다.</p>
                )}
              </div>
            )}
          </div>

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
                   className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg shadow-md hover:bg-orange-600 transition"
                 >
                   위치 등록하기
                 </button>
                     </div>

          <div className="bg-white p-4 rounded-2xl border-2 border-orange-100">
            <div className="flex items-center gap-2 text-orange-400 mb-2">
              <Calendar size={20} strokeWidth={2.5} />
              <span className="font-medium">발견 시간</span>
            </div>
            <input
              type="datetime-local"
              name="lostTime"
              value={formData.lostTime}
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
              
              <option value="FINDING">실종 신고</option>
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

export default LostPostForm;