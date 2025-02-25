import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { RadiusControl } from '../components/RadiusControl';
import { PetCard } from '../components/PetCard';
import { ControlButtons } from '../components/ControlButtons';
import { useKakaoMap } from '@/hooks/UseKakaoMap';
import PetList from '../components/PetList';
import _ from 'lodash';

const Map = () => {
    const centerPosition = { lat: 37.498095, lng: 127.027610 };

    const [selectedRange, setSelectedRange] = useState(3);
    const [selectedPet, setSelectedPet] = useState(null);
    const [showList, setShowList] = useState(false);
    const [pets, setPets] = useState([]);
    const [currentPosition, setCurrentPosition] = useState(centerPosition);
    const [isCardVisible, setIsCardVisible] = useState(false);
    const [isMarkerTransitioning, setIsMarkerTransitioning] = useState(false);
    const [customOverlays, setCustomOverlays] = useState([]);
    
    const { map, setMarkers, circleRef } = useKakaoMap(currentPosition);

    useEffect(() => {
        // 전체 문서 및 body 스타일 조정
        document.documentElement.style.height = '100%';
        document.body.style.height = '100%';
        document.body.style.margin = '0';
        document.body.style.padding = '0';
        document.body.style.overflow = 'hidden';
        
        return () => {
            document.documentElement.style.height = '';
            document.body.style.height = '';
            document.body.style.margin = '';
            document.body.style.padding = '';
            document.body.style.overflow = '';
        };
    }, []);

    // 커스텀 오버레이를 만들고 관리하는 함수
    const createCustomOverlays = useCallback((pets) => {
        if (!map) return;
    
        // 기존 오버레이 제거
        customOverlays.forEach(overlay => overlay.setMap(null));
        
        // 색상 정의
        const getStatusColor = (status) => {
            switch(status) {
                case 'FINDING':
                    return '#FFA000'; // 황색
                case 'SIGHTING':
                    return '#F44336'; // 적색
                case 'SHELTER':
                    return '#4CAF50'; // 녹색
                default:
                    return '#757575'; // 회색
            }
        };
        
        // 상태 텍스트 매핑
        const getStatusText = (status) => {
            switch(status) {
                case 'FINDING':
                    return '찾는중';
                case 'SIGHTING':
                    return '목격';
                case 'SHELTER':
                    return '보호중';
                default:
                    return '상태 미정';
            }
        };
        
        // 새 오버레이 생성
        const newOverlays = pets.map(pet => {
            // 범위 체크 - 현재 선택된 범위 내에 있는 마커만 생성
            if (pet.distanceFromCenter > selectedRange) {
                return null; // 범위를 벗어난 마커는 생성하지 않음
            }
            
            const imageUrl = pet.image || '/api/placeholder/60/60';
            const position = new window.kakao.maps.LatLng(pet.position.lat, pet.position.lng);
            const statusColor = getStatusColor(pet.status);
            const statusText = getStatusText(pet.status);
            
            // 선택된 펫인지 확인
            const isSelected = selectedPet && selectedPet.id === pet.id;
            
            // 마커 크기 설정 - 선택된 경우 더 크게
            const markerSize = isSelected ? 50 : 45;
            const borderWidth = isSelected ? 4 : 3;
            const labelFontSize = isSelected ? '12px' : '10px';
            const labelPadding = isSelected ? '3px 8px' : '2px 6px';
            const labelMarginTop = isSelected ? '6px' : '4px';
            
            // 전체 컨테이너 - 마커와 라벨을 함께 포함
            const container = document.createElement('div');
            container.className = 'marker-container';
            container.style.position = 'absolute';
            container.style.transform = 'translate(-50%, -50%)'; // 컨테이너 전체를 중앙 정렬
            container.style.display = 'flex';
            container.style.flexDirection = 'column';
            container.style.alignItems = 'center';
            container.style.cursor = 'pointer';
            container.style.width = 'auto'; // 너비를 자동으로 조정
            container.style.zIndex = isSelected ? '11' : '10'; // 선택된 마커를 더 앞에 표시
            
            // 마커 이미지 컨테이너 (테두리 역할)
            const markerBorder = document.createElement('div');
            markerBorder.style.width = `${markerSize}px`;
            markerBorder.style.height = `${markerSize}px`;
            markerBorder.style.borderRadius = '50%';
            markerBorder.style.border = `${borderWidth}px solid ${statusColor}`;
            markerBorder.style.boxSizing = 'border-box';
            markerBorder.style.overflow = 'hidden';
            markerBorder.style.backgroundColor = 'white';
            markerBorder.style.boxShadow = isSelected 
                ? `0 3px 8px rgba(0,0,0,0.4), 0 0 0 2px ${statusColor}30` 
                : '0 2px 6px rgba(0,0,0,0.3)';
            markerBorder.style.transition = 'all 0.2s ease-in-out';
            
            // 선택 효과 - 밝은 테두리 추가
            if (isSelected) {
                const glowEffect = document.createElement('div');
                glowEffect.style.position = 'absolute';
                glowEffect.style.top = '-3px';
                glowEffect.style.left = '-3px';
                glowEffect.style.width = `${markerSize + 6}px`;
                glowEffect.style.height = `${markerSize + 6}px`;
                glowEffect.style.borderRadius = '50%';
                glowEffect.style.backgroundColor = 'transparent';
                glowEffect.style.border = `2px solid ${statusColor}80`; // 반투명 테두리
                glowEffect.style.boxSizing = 'border-box';
                glowEffect.style.zIndex = '0';
                
                container.appendChild(glowEffect);
            }
            
            // 펫 이미지
            const petImage = document.createElement('div');
            petImage.style.width = '100%';
            petImage.style.height = '100%';
            petImage.style.backgroundImage = `url(${imageUrl})`;
            petImage.style.backgroundSize = 'cover';
            petImage.style.backgroundPosition = 'center';
            petImage.style.borderRadius = '50%';
            
            // 상태 표시 라벨
            const statusLabel = document.createElement('div');
            statusLabel.style.marginTop = labelMarginTop;
            statusLabel.style.padding = labelPadding;
            statusLabel.style.borderRadius = '10px';
            statusLabel.style.fontSize = labelFontSize;
            statusLabel.style.fontWeight = 'bold';
            statusLabel.style.color = 'white';
            statusLabel.style.backgroundColor = statusColor;
            statusLabel.style.boxShadow = '0 1px 3px rgba(0,0,0,0.2)';
            statusLabel.style.whiteSpace = 'nowrap';
            statusLabel.style.zIndex = '2';
            statusLabel.style.transition = 'all 0.2s ease-in-out';
            statusLabel.textContent = statusText;
            
            // 구성 요소 조립
            markerBorder.appendChild(petImage);
            container.appendChild(markerBorder);
            container.appendChild(statusLabel);
            
            // 커스텀 오버레이 생성
            const overlay = new window.kakao.maps.CustomOverlay({
                position: position,
                content: container,
                map: map,
                zIndex: isSelected ? 11 : 10
            });
            
            // 클릭 이벤트 추가
            container.onclick = () => {
                setSelectedPet(pet);
            };
            
            return overlay;
        }).filter(overlay => overlay !== null); // null 값 필터링
        
        setCustomOverlays(newOverlays);
    }, [map, customOverlays, selectedRange, selectedPet]);

    // 통합 API 호출 함수
    const fetchData = async (position, range) => {
        const apiUrl = 'http://localhost:8090/api/v1/lost-foundposts/map';

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
                const transformedData = response.data.data.map(post => {
                    const isLostPost = post.lostTime !== null; // lostTime이 있으면 LOST, 아니면 FOUND
                    
                    // 이미지 URL은 images 배열의 첫 번째 항목의 path에서 가져옴
                    const imageUrl = post.images && post.images.length > 0 
                        ? post.images[0].path 
                        : '/api/placeholder/160/160';
                    
                    return {
                        id: post.id,
                        content: post.content,
                        status: post.status,
                        image: imageUrl,
                        time: isLostPost 
                            ? post.lostTime 
                            : (post.findTime ? new Date(post.findTime).toLocaleString() : ''),
                        location: post.location,
                        position: {
                            lat: post.latitude,
                            lng: post.longitude
                        },
                        pet: post.pet, 
                        postType: isLostPost ? 'LOST' : 'FOUND',
                        author: post.author 
                    };
                });
                
                setPets(transformedData);
                createCustomOverlays(transformedData);
            }
        } catch (error) {
            console.error('Failed to fetch pets:', error);
        }
    };

    // 드래그용 디바운스 함수
    const debouncedFetchForDrag = useCallback(
        _.debounce((position, range) => {
            fetchData(position, range);
        }, 500),
        []
    );

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
                    fetchData(pos, selectedRange);
                }
            },
            (error) => {
                console.error('Geolocation failed:', error);
            }
        );
    }, [map, circleRef, selectedRange]);

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
                    fetchData(currentPosition, newRange);
                }
            };

            animate();
        }
    }, [circleRef, currentPosition]);

    useEffect(() => {
        if (map) {
            const handleDragEnd = () => {
                const center = map.getCenter();
                const newPosition = {
                    lat: center.getLat(),
                    lng: center.getLng()
                };
                setCurrentPosition(newPosition);
                debouncedFetchForDrag(newPosition, selectedRange);
            };

            window.kakao.maps.event.addListener(map, 'dragend', handleDragEnd);
            return () => {
                window.kakao.maps.event.removeListener(map, 'dragend', handleDragEnd);
            };
        }
    }, [map, selectedRange, debouncedFetchForDrag]);

    useEffect(() => {
        if (selectedPet) {
            setTimeout(() => setIsCardVisible(true), 50);
        } else {
            setIsCardVisible(false);
        }
    }, [selectedPet]);

    // 초기 데이터 로딩
    useEffect(() => {
        if (map) {
            fetchData(currentPosition, selectedRange);
        }
    }, [map, currentPosition, selectedRange]);

    // 컴포넌트 언마운트 시 오버레이 정리
    useEffect(() => {
        return () => {
            customOverlays.forEach(overlay => overlay.setMap(null));
        };
    }, [customOverlays]);

    return (
        <div className="h-screen w-full bg-orange-50/30 relative overflow-hidden">
            <div className="h-full w-full">
                <div className="relative h-full w-full">
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
                    
                    {/* PetCard 컴포넌트를 footer 위로 표시 */}
                    {selectedPet && !showList && (
                        <div className={`absolute bottom-16 left-0 right-0 max-h-[70vh] overflow-auto p-4 bg-white rounded-t-3xl shadow-lg border-t-2 border-orange-100 z-50 transition-all duration-300 ease-in-out ${
                            isCardVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
                        }`}>
                            <PetCard pet={selectedPet} onClose={() => setSelectedPet(null)} />
                        </div>
                    )}
                    
                    {/* PetList 컴포넌트를 footer 위로 표시 */}
                    {showList && (
                        <div className="absolute bottom-16 left-0 right-0 max-h-[70vh] overflow-auto z-50 bg-white rounded-t-3xl shadow-lg">
                            <PetList 
                                pets={pets}
                                onPetClick={(pet) => {
                                    setSelectedPet(pet);
                                    setShowList(false);
                                }}
                                onClose={() => setShowList(false)}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Map;
