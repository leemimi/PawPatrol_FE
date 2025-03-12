import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, MapPin, Calendar, Camera, X, Plus, Pencil, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { KakaoMapApiService } from '../api/kakaoRestApiService';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

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
    content: null,
    latitude: 37.5665,
    longitude: 126.978,
    location: null,
    lostTime: "2025-02-20T10:30:00",
    findTime: null,
    status: "FINDING", // 상태
    petId: null,
    animalType: null,
    reward: null
  });

  // SweetAlert2 React 컨텐츠 래퍼
  const MySwal = withReactContent(Swal);

  // 커스텀 스타일 정의
  const swalCustomClass = {
    popup: 'rounded-3xl shadow-xl border-4 border-orange-100',
    title: 'text-orange-800 font-bold',
    confirmButton: 'rounded-full px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white transition-colors',
    actions: 'mt-4',
    icon: 'text-orange-500'
  };

  // SweetAlert2 토스트 스타일 커스터마이징
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    customClass: {
      popup: 'rounded-xl border-2 border-orange-200 shadow-lg',
      title: 'text-sm font-medium text-orange-800 ml-2'
    },
    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    }
  });

  // 기존 코드 유지...
  useEffect(() => {
    const fetchPets = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/animals/list`);
        setPetsData(response.data.data);
      } catch (error) {
        console.error("Failed to fetch pets:", error);
        Toast.fire({
          icon: 'error',
          title: '반려동물 목록을 불러오는데 실패했습니다.'
        });
      }
    };

    fetchPets();
  }, []);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${import.meta.env.VITE_KAKAO_MAP_API_KEY}&autoload=true`;

    script.onerror = () => {
      console.error("Failed to load Kakao Maps API.");
      Toast.fire({
        icon: 'error',
        title: '카카오맵 API 로드에 실패했습니다.'
      });
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
        Toast.fire({
          icon: 'error',
          title: '카카오맵을 사용할 수 없습니다.'
        });
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

        console.log("좌표→주소 변환 응답:", response);

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

          // 성공 시 심플한 알림
          MySwal.fire({
            icon: 'success',
            title: '위치가 등록되었습니다',
            showConfirmButton: false,
            timer: 1500,
            customClass: swalCustomClass,
            iconColor: '#F97316',
            background: '#fff8f5'
          });
        } else {
          // 주소 변환 결과가 없는 경우
          const locationText = `위도: ${formData.latitude}, 경도: ${formData.longitude}`;

          setFormData(prev => ({
            ...prev,
            location: locationText
          }));

          MySwal.fire({
            icon: 'info',
            title: '위치가 등록되었습니다',
            html: `<p class="text-orange-700">(주소 정보를 찾을 수 없습니다)</p>`,
            customClass: swalCustomClass,
            confirmButtonText: '확인',
            iconColor: '#60A5FA',
            background: '#f0f9ff'
          });
        }
      } catch (error) {
        console.error("주소 변환 중 오류 발생:", error);

        // 오류 시 좌표 정보만 저장
        const locationText = `위도: ${formData.latitude}, 경도: ${formData.longitude}`;

        setFormData(prev => ({
          ...prev,
          location: locationText
        }));

        MySwal.fire({
          icon: 'warning',
          title: '위치가 등록되었습니다',
          html: `<p class="text-orange-600">(주소 변환 중 오류가 발생했습니다)</p>`,
          customClass: swalCustomClass,
          confirmButtonText: '확인',
          iconColor: '#FFB020',
          background: '#fffbeb'
        });
      }
    } else {
      MySwal.fire({
        icon: 'error',
        title: '위치를 선택해주세요',
        text: '먼저 지도에서 위치를 선택해주세요.',
        customClass: swalCustomClass,
        confirmButtonText: '확인',
        iconColor: '#EF4444',
        background: '#fff5f5'
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleRewardChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setFormData({
      ...formData,
      reward: value === '' || parseInt(value) === 0 ? null : parseInt(value)
    });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const maxSize = 5 * 1024 * 1024; // 5MB 제한

    // 필터링: 크기가 5MB를 넘는 파일은 제외
    const validFiles = files.filter((file) => file.size <= maxSize);

    if (validFiles.length !== files.length) {
      Toast.fire({
        icon: 'warning',
        title: '5MB 이하의 파일만 업로드 가능합니다.',
        iconColor: '#FFB020',
        background: '#fffbeb'
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

  const handlePetSelect = (pet) => {
    setSelectedPet(pet);
    setFormData(prev => {
      const updatedFormData = {
        ...prev,
        petId: pet.id
      };
      return updatedFormData;
    });
    setShowPetSelection(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Ensure a pet is selected and location is provided
    if (!selectedPet) {
      MySwal.fire({
        icon: 'error',
        title: '반려동물을 선택해주세요',
        text: '실종 신고를 위해 반려동물 선택이 필요합니다.',
        customClass: swalCustomClass,
        confirmButtonText: '확인',
        iconColor: '#EF4444',
        background: '#fff5f5'
      });
      return;
    }

    if (!formData.location) {
      MySwal.fire({
        icon: 'error',
        title: '위치를 입력해주세요',
        text: '실종 위치 정보가 필요합니다.',
        customClass: swalCustomClass,
        confirmButtonText: '확인',
        iconColor: '#EF4444',
        background: '#fff5f5'
      });
      return;
    }

    const metadataJson = JSON.stringify(formData);
    const formDataToSend = new FormData();
    formDataToSend.append("metadata", metadataJson);

    // Check if images are selected before appending
    if (images.length > 0) {
      images.forEach((image) => formDataToSend.append("images", image));
    }

    let apiUrl = `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/lost-foundposts`;

    try {
      // 커스텀 로딩 팝업
      MySwal.fire({
        title: '등록 중...',
        html: '<div class="flex justify-center"><div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-orange-500"></div></div>',
        showConfirmButton: false,
        allowOutsideClick: false,
        customClass: {
          popup: 'rounded-3xl shadow-xl border-4 border-orange-100',
          title: 'text-orange-800 font-bold mt-4'
        },
        background: '#fff8f5'
      });

      const response = await axios.post(
        apiUrl,
        formDataToSend,
        {
          headers: { "Content-Type": "multipart/form-data" }
        }
      );

      // 성공 시 예쁜 성공 팝업
      MySwal.fire({
        icon: 'success',
        title: '등록 완료!',
        showConfirmButton: false,
        timer: 1500,
        customClass: swalCustomClass,
        iconColor: '#F97316',
        background: '#fff8f5'
      }).then(() => {
        navigate(-1);
      });

      console.log(response.data);
    } catch (error) {
      console.error("게시글 등록 중 오류 발생:", error);
      MySwal.fire({
        icon: 'error',
        title: '등록 실패',
        text: '게시글 등록 중 오류가 발생했습니다. 다시 시도해주세요.',
        customClass: swalCustomClass,
        confirmButtonText: '확인',
        iconColor: '#EF4444',
        background: '#fff5f5'
      });
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

      {/* Main Form - 나머지 코드는 유지 */}
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
            <div className="text-center mb-4">
              <p className="text-gray-700 text-sm">펫의 측면과 옆모습 사진을 업로드해주세요</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {/* 선택된 반려동물 이미지가 있을 경우 우선 표시 */}
              {selectedPet && selectedPet.imageUrl && (
                <div className="relative w-24 h-24">
                  <img
                    src={selectedPet.imageUrl}
                    alt={`${selectedPet.name} 기본 이미지`}
                    className="w-full h-full object-cover rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => removeDefaultImage()}
                    className="absolute -top-2 -right-2 bg-orange-500 text-white rounded-full p-1"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              {/* 추가된 이미지들 표시 */}
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

              {/* 이미지 추가 버튼 (기본 이미지 + 추가 이미지 합쳐서 5개 미만일 때만 표시) */}
              {(previewUrls.length + (selectedPet && selectedPet.imageUrl ? 1 : 0)) < 5 && (
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
              value={formData.content || ''}
              onChange={handleChange}
              className="w-full h-32 text-orange-900 placeholder-orange-300 focus:outline-none resize-none"
            />
          </div>

          {/* 보상금 입력 필드 - 원화 아이콘 위치 수정 */}
          <div className="bg-white p-4 rounded-2xl border-2 border-orange-100">
            <div className="flex items-center gap-2 text-orange-400 mb-2">
              <CreditCard size={20} strokeWidth={2.5} />
              <span className="font-medium">보상금</span>
            </div>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-gray-500">₩</span>
              <input
                type="text"
                name="reward"
                placeholder="보상금을 입력하세요 (선택사항)"
                value={formData.reward === null ? '' : formData.reward.toLocaleString('ko-KR')}
                onChange={handleRewardChange}
                className="w-full text-orange-900 focus:outline-none p-2 pl-8 border rounded-md"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2 ml-2">숫자만 입력 가능합니다</p>
          </div>

          {/* 지도로 위치 선택 */}
          <div className="bg-white p-4 rounded-2xl border-2 border-orange-100">
            <div className="flex items-center gap-2 text-orange-400 mb-2">
              <MapPin size={20} strokeWidth={2.5} />
              <span className="font-medium">실종 위치</span>
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
              <span className="font-medium">실종 시간</span>
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