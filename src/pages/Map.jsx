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
    
    const [selectedRange, setSelectedRange] = useState(3);
    const [selectedPet, setSelectedPet] = useState(null);
    const [showList, setShowList] = useState(false);
    const [lostPets, setLostPets] = useState([]);
    const [currentPosition, setCurrentPosition] = useState(centerPosition);
    const [isCardVisible, setIsCardVisible] = useState(false);
    const [isMarkerTransitioning, setIsMarkerTransitioning] = useState(false);
    const [isLostMode, setIsLostMode] = useState(true);  
    
    const { map, setMarkers, circleRef } = useKakaoMap(currentPosition);

    const createMarkers = useCallback((pets) => {
        if (!map) return;
    
        // status에 따른 마커 이미지 정의
        const getMarkerImage = (status) => {
            const imageSize = new window.kakao.maps.Size(22, 32); // 크기를 조금 키움
        let markerColor;
        
        switch(status) {
            case 'FINDING':
                markerColor = '#FFA000';
                break;
            case 'FOUND':
                markerColor = '#F44336';
                break;
            case 'FOSTERING':
                markerColor = '#4CAF50';
                break;
            default:
                markerColor = '#757575';
        }

        const svg = `
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="32" viewBox="0 0 22 32">
                <path d="M11 0C4.934 0 0 4.934 0 11c0 8.25 11 21 11 21s11-12.75 11-21c0-6.066-4.934-11-11-11z" 
                      fill="${markerColor}"/>
                <circle cx="11" cy="11" r="4.5" fill="white"/>
            </svg>
        `;


        const url = 'data:image/svg+xml;base64,' + btoa(svg);
    
            return new window.kakao.maps.MarkerImage(url, imageSize);
        };
    
        const newMarkers = pets.map(pet => {
            const marker = new window.kakao.maps.Marker({
                position: new window.kakao.maps.LatLng(pet.position.lat, pet.position.lng),
                map: map,
                image: getMarkerImage(pet.status)
            });
            
            window.kakao.maps.event.addListener(marker, 'click', () => {
                setSelectedPet(pet);
            });
    
            return marker;
        });
    
        setMarkers(newMarkers);
    }, [map, setMarkers]);

    // API 호출 함수 분리
    const fetchData = async (position, range, mode) => {
        const apiUrl = mode 
            ? 'http://localhost:8090/api/lost-found/lost/map'
            : 'http://localhost:8090/api/lost-found/find/map';

        try {
            const response = await axios.get(apiUrl, {
                params: {
                    latitude: position.lat,
                    longitude: position.lng,
                    radius: range * 1000
                },
                credentials: 'include',
            });

            if (response.data.resultCode === "200") {
                const transformedData = response.data.data.map(pet => {
                    if (mode) {
                        return {
                            id: pet.lostId,
                            title: pet.title,
                            content: pet.content,
                            status: pet.status,
                            image: '/api/placeholder/160/160',
                            time: pet.lostTime,
                            location: pet.location,
                            position: {
                                lat: pet.latitude,
                                lng: pet.longitude
                            },
                            ownerPhone: pet.ownerPhone,
                            tags: pet.tags
                        };
                    } else {
                        return {
                            id: pet.foundId,
                            breed: pet.breed,
                            age: pet.birthDate ? new Date().getFullYear() - new Date(pet.birthDate).getFullYear() : null,
                            gender: pet.gender === 'MALE' ? '수컷' : '암컷',
                            status: pet.status,
                            image: '/api/placeholder/160/160',
                            time: new Date(pet.findTime).toLocaleString(),
                            location: pet.location,
                            position: {
                                lat: pet.latitude,
                                lng: pet.longitude
                            },
                            characteristics: pet.characteristics,
                            name: pet.name,
                            size: pet.size,
                            title: pet.title,
                            content: pet.content,
                            tags: pet.tags
                        };
                    }
                });
                
                setLostPets(transformedData);
                createMarkers(transformedData);
            }
        } catch (error) {
            console.error('Failed to fetch pets:', error);
        }
    };

    // 드래그용 디바운스 함수
    const debouncedFetchForDrag = useCallback(
        _.debounce((position, range, mode) => {
            fetchData(position, range, mode);
        }, 500),
        []
    );

    // 일반 데이터 가져오기 함수
    const fetchLostPets = useCallback((position, range) => {
        fetchData(position, range, isLostMode);
    }, [isLostMode]);

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
                        circleRef.current.setPosition(moveLatLon);
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
            const moveLatLon = new window.kakao.maps.LatLng(currentPosition.lat, currentPosition.lng);
            circleRef.current.setPosition(moveLatLon);
            circleRef.current.setMap(map);
        }
    }, [currentPosition, map, circleRef]);

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

    useEffect(() => {
        if (map) {
            const handleDragEnd = () => {
                const center = map.getCenter();
                const newPosition = {
                    lat: center.getLat(),
                    lng: center.getLng()
                };
                setCurrentPosition(newPosition);
                debouncedFetchForDrag(newPosition, selectedRange, isLostMode);
                fetchData(newPosition, selectedRange, isLostMode);
            };

            window.kakao.maps.event.addListener(map, 'dragend', handleDragEnd);
            return () => {
                window.kakao.maps.event.removeListener(map, 'dragend', handleDragEnd);
            };
        }
    }, [map, selectedRange, isLostMode, debouncedFetchForDrag]);

    useEffect(() => {
        if (selectedPet) {
            setTimeout(() => setIsCardVisible(true), 50);
        } else {
            setIsCardVisible(false);
        }
    }, [selectedPet]);

    useEffect(() => {
        fetchLostPets(currentPosition, selectedRange);
    }, []);

    const handleModeChange = useCallback((mode) => {
        setIsLostMode(mode);
        // 모드 변경 시 즉시 새로운 데이터 가져오기
        fetchData(currentPosition, selectedRange, mode);
    }, [currentPosition, selectedRange]);

    return (
        <div className="h-screen w-full bg-orange-50/30 relative overflow-hidden">
            <Header 
                onModeChange={handleModeChange}
                isLostMode={isLostMode}
            />
            
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