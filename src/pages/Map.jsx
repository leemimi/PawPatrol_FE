import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Header } from '../components/Header';
import { RadiusControl } from '../components/RadiusControl';
import { PetCard } from '../components/PetCard';
import { ControlButtons } from '../components/ControlButtons';
import { useKakaoMap } from '../hooks/useKakaoMap';
import PetList from '../components/PetList';
import _ from 'lodash';

const Map = () => {
    const centerPosition = { lat: 37.498095, lng: 127.027610 };
    
    // 상태 관리
    const [selectedRange, setSelectedRange] = useState(3);
    const [selectedPet, setSelectedPet] = useState(null);
    const [showList, setShowList] = useState(false);
    const [lostPets, setLostPets] = useState([]);
    const [currentPosition, setCurrentPosition] = useState(centerPosition);
    const [isCardVisible, setIsCardVisible] = useState(false);
    const [isMarkerTransitioning, setIsMarkerTransitioning] = useState(false);
    
    // 카카오맵 커스텀 훅 사용
    const { map, setMarkers, circleRef } = useKakaoMap(currentPosition);

    // 마커 생성 함수
    const createMarkers = useCallback((pets) => {
        if (!map) return;
        
        const newMarkers = pets.map(pet => {
            const marker = new window.kakao.maps.Marker({
                position: new window.kakao.maps.LatLng(pet.position.lat, pet.position.lng),
                map: map
            });
            
            // 마커 클릭시 해당 펫 정보 표시
            window.kakao.maps.event.addListener(marker, 'click', () => {
                setSelectedPet(pet);
            });
    
            return marker;
        });
    
        setMarkers(newMarkers);
    }, [map, setMarkers]);

    useEffect(() => {
        console.log("currentPosition 변경:", currentPosition);
    }, [currentPosition]);

    // 데이터 가져오기 (디바운스 적용)
    const fetchLostPets = useCallback(
        _.debounce(async () => {
            try {
                const response = await axios.get('http://localhost:8090/api/lost-found/find', {
                    credentials: 'include',
                });
                
                if (response.data.resultCode === "200") {
                    const transformedData = response.data.data.content.map(pet => ({
                        id: pet.foundId,
                        breed: pet.breed,
                        age: new Date().getFullYear() - new Date(pet.birthDate).getFullYear(),
                        gender: pet.gender === 'MALE' ? '수컷' : '암컷',
                        status: '찾는중',
                        image: '/api/placeholder/160/160',
                        time: new Date(pet.findTime).toLocaleString(),
                        location: '위치 정보',
                        position: { 
                            lat: pet.latitude,
                            lng: pet.longitude
                        },
                        characteristics: pet.characteristics,
                        name: pet.name,
                        size: pet.size
                    }));
                    
                    setLostPets(transformedData);
                    createMarkers(transformedData);
                }
            } catch (error) {
                console.error('Failed to fetch lost pets:', error);
            }
        }, 500),
        [createMarkers]
    );

    // 현재 위치 가져오기
    const getCurrentLocation = useCallback(() => {
        if (!navigator.geolocation) {
            console.error('Geolocation is not supported by this browser.');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                setCurrentPosition(pos);
                
                if (map) {
                    const moveLatLon = new window.kakao.maps.LatLng(pos.lat, pos.lng);
                    map.setCenter(moveLatLon);
                    if (circleRef.current) {
                        circleRef.current.setPosition(moveLatLon);  // 원 위치 갱신
                    }
                    fetchLostPets(pos, selectedRange);
                }
            },
            (error) => {
                console.error('Geolocation failed:', error);
            }
        );
    }, [map, circleRef, selectedRange, fetchLostPets]);

    useEffect(() => {
        if (map && circleRef.current) {
            circleRef.current.setMap(map);
        }
    }, [map, currentPosition]);

    // 반경 변경 핸들러
    const handleRangeChange = useCallback((newRange) => {
        setIsMarkerTransitioning(true);
        setSelectedRange(newRange);
        
        if (circleRef.current) {
            const currentRadius = circleRef.current.getRadius();
            const targetRadius = newRange * 1000;
            const steps = 20;
            const increment = (targetRadius - currentRadius) / steps;
            
            let step = 0;
            const animate = () => {
                if (step < steps) {
                    circleRef.current.setRadius(currentRadius + (increment * step));
                    step++;
                    requestAnimationFrame(animate);
                } else {
                    circleRef.current.setRadius(targetRadius);
                    setIsMarkerTransitioning(false);
                    fetchLostPets(currentPosition, newRange);
                }
            };
            
            animate();
        }
    }, [circleRef, currentPosition, fetchLostPets]);

    // 지도 드래그 이벤트
    useEffect(() => {
        if (map) {
            const handleDragEnd = () => {
                const center = map.getCenter();
                const newPosition = {
                    lat: center.getLat(),
                    lng: center.getLng()
                };
                setCurrentPosition(newPosition);
                fetchLostPets(newPosition, selectedRange);
            };

            window.kakao.maps.event.addListener(map, 'dragend', handleDragEnd);
            return () => {
                window.kakao.maps.event.removeListener(map, 'dragend', handleDragEnd);
            };
        }
    }, [map, selectedRange, fetchLostPets]);

    // 선택된 펫 카드 애니메이션
    useEffect(() => {
        if (selectedPet) {
            setTimeout(() => setIsCardVisible(true), 50);
        } else {
            setIsCardVisible(false);
        }
    }, [selectedPet]);

    // 초기 데이터 로드
    useEffect(() => {
        fetchLostPets(currentPosition, selectedRange);
    }, []);

    return (
        <div className="h-screen w-full bg-orange-50/30 relative overflow-hidden">
            <Header />
            
            <div className="h-full pt-14">
                <div className="relative h-full">
                    <div id="map" className="w-full h-full overflow-visible" />
                    
                    <RadiusControl
                        selectedRange={selectedRange}
                        onRangeChange={handleRangeChange}
                        isTransitioning={isMarkerTransitioning}
                    />
                    
                    <ControlButtons
                        onLocationClick={getCurrentLocation}
                        onListClick={() => setShowList(!showList)}
                    />
                </div>
            </div>

            {selectedPet && !showList && (
                <div className={`fixed bottom-0 left-0 right-0 p-4 bg-white rounded-t-3xl shadow-lg border-t-2 border-orange-100 z-50 transition-all duration-300 ease-in-out ${
                    isCardVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
                }`}>
                    <PetCard pet={selectedPet} onClose={() => setSelectedPet(null)} />
                </div>
            )}
                        
            {showList && (
                <PetList 
                    pets={lostPets}
                    onPetClick={(pet) => {
                        setSelectedPet(pet);
                        setShowList(false);
                    }}
                    onClose={() => setShowList(false)}
                />
            )}
        </div>
    );
};

export default Map;
