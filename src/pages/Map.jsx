import React, { useState, useEffect, useCallback, useRef } from 'react';
import { RadiusControl } from '../components/RadiusControl';
import { ControlButtons } from '../components/ControlButtons';
import { useKakaoMap } from '@/hooks/UseKakaoMap';
import { usePetData } from '../hooks/UsePetData';
import { useFacilitiesData } from '../hooks/UseFacilitiesData.jsx';
import { useGeolocation } from '../hooks/UseGeolocation.jsx';
import { useCustomOverlays } from '../hooks/UseCustomOverlays';
import { useFacilityOverlays } from '../hooks/UseFacilityOverlays'; 
import { CommonList } from '../components/CommonList';
import { CommonCard } from '../components/CommonCard';
import { PetCard } from '../components/PetCard';
import WriteButton from '../components/WriteButton';

const Map = () => {
    const centerPosition = { lat: 37.56681460756078, lng: 126.98179903757568 };

    const [selectedRange, setSelectedRange] = useState(100);
    const [selectedPet, setSelectedPet] = useState(null);
    const [selectedFacility, setSelectedFacility] = useState(null);
    const [showList, setShowList] = useState(false);
    const [showFacilitiesList, setShowFacilitiesList] = useState(false);
    const [currentPosition, setCurrentPosition] = useState(centerPosition);
    const [isCardVisible, setIsCardVisible] = useState(false);
    const [isMarkerTransitioning, setIsMarkerTransitioning] = useState(false);
    const [showFacilities, setShowFacilities] = useState(false);
    
    // 초기 렌더링 및 데이터 로딩 추적을 위한 ref
    const initialLoadRef = useRef(false);
    const modeChangeRef = useRef(false);
    
    const { map, setMarkers, circleRef } = useKakaoMap(currentPosition);
    
    // 펫 데이터 관련 훅 사용
    const { 
        pets, 
        fetchPets, 
        debouncedFetchPets 
    } = usePetData(currentPosition, selectedRange);
    
    // 시설 데이터 관련 훅 사용
    const { 
        facilities, 
        fetchFacilities, 
        debouncedFetchFacilities 
    } = useFacilitiesData(currentPosition, selectedRange);
    
    // 위치 관련 훅 사용
    const { getCurrentLocation } = useGeolocation(map, circleRef, (newPosition) => {
        setCurrentPosition(newPosition);
        if (showFacilities) {
            fetchFacilities(newPosition, selectedRange);
        } else {
            fetchPets(newPosition, selectedRange);
        }
    });
    
    // 펫 오버레이 관련 훅 사용
    const { 
        customOverlays, 
        createCustomOverlays, 
        cleanupOverlays 
    } = useCustomOverlays({
        map,
        selectedRange,
        selectedPet,
        onSelectPet: setSelectedPet
    });

    // 시설 오버레이 관련 훅 사용
    const { 
        facilityOverlays, 
        createFacilityCustomOverlays, 
        cleanupFacilityOverlays 
    } = useFacilityOverlays({
        map,
        selectedFacility,
        onSelectFacility: setSelectedFacility
    });

    const handleSelectMissingPost = () => {
        console.log('실종글 작성 버튼 클릭됨');
        // 여기에 실종글 작성 페이지로 이동 또는 모달 표시 로직 추가
        // 예: 라우팅 또는 상태 관리를 통한 모달 표시
    };

    const handleSelectReportPost = () => {
        console.log('제보글 작성 버튼 클릭됨');
        // 여기에 제보글 작성 페이지로 이동 또는 모달 표시 로직 추가
        // 예: 라우팅 또는 상태 관리를 통한 모달 표시
    };

    // 기존 스타일 설정 useEffect
    useEffect(() => {
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

    // 원형 반경 위치 설정 useEffect
    useEffect(() => {
        if (map && circleRef.current) {
            const moveLatLon = new window.kakao.maps.LatLng(currentPosition.lat, currentPosition.lng);
            circleRef.current.setPosition(moveLatLon);
            circleRef.current.setMap(map);
        }
    }, [currentPosition, map, circleRef]);

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
                    
                    // 현재 모드에 따라 다른 데이터 페치
                    if (showFacilities) {
                        fetchFacilities(currentPosition, newRange);
                    } else {
                        fetchPets(currentPosition, newRange);
                    }
                }
            };

            animate();
        }
    }, [circleRef, currentPosition, fetchPets, fetchFacilities, showFacilities]);

    // 맵 드래그 종료 이벤트 useEffect
    useEffect(() => {
        if (map) {
            const handleDragEnd = () => {
                const center = map.getCenter();
                const newPosition = {
                    lat: center.getLat(),
                    lng: center.getLng()
                };
                setCurrentPosition(newPosition);
                
                // 현재 모드에 따라 다른 데이터 페치
                if (showFacilities) {
                    debouncedFetchFacilities(newPosition, selectedRange);
                } else {
                    debouncedFetchPets(newPosition, selectedRange);
                }
            };

            window.kakao.maps.event.addListener(map, 'dragend', handleDragEnd);
            return () => {
                window.kakao.maps.event.removeListener(map, 'dragend', handleDragEnd);
            };
        }
    }, [map, selectedRange, debouncedFetchPets, debouncedFetchFacilities, showFacilities]);

    // 선택된 항목에 따른 카드 가시성 useEffect
    useEffect(() => {
        if (selectedPet || selectedFacility) {
            setTimeout(() => setIsCardVisible(true), 50);
        } else {
            setIsCardVisible(false);
        }
    }, [selectedPet, selectedFacility]);

    // showFacilities 변경 시 모드 변경 플래그 설정
    useEffect(() => {
        modeChangeRef.current = true;
    }, [showFacilities]);

    // 펫 데이터 변경 시 오버레이 업데이트
    useEffect(() => {
        if (map && !showFacilities && pets.length > 0) {
            createCustomOverlays(pets);
        }
    }, [map, pets, showFacilities, createCustomOverlays]);

    // 시설 데이터 변경 시 오버레이 업데이트
    useEffect(() => {
        if (map && showFacilities && facilities.length > 0) {
            createFacilityCustomOverlays(facilities);
        }
    }, [map, facilities, showFacilities, createFacilityCustomOverlays]);
    
    // 선택된 시설이 변경될 때도 오버레이 업데이트
    useEffect(() => {
        if (map && showFacilities && facilities.length > 0 && selectedFacility) {
            createFacilityCustomOverlays(facilities);
        }
    }, [map, selectedFacility, facilities, showFacilities, createFacilityCustomOverlays]);

    // 초기 데이터 로딩 useEffect
    useEffect(() => {
        if (map && !initialLoadRef.current) {
            initialLoadRef.current = true;
            if (showFacilities) {
                fetchFacilities(currentPosition, selectedRange);
            } else {
                fetchPets(currentPosition, selectedRange);
            }
        }
    }, [map, currentPosition, selectedRange, showFacilities, fetchPets, fetchFacilities]);

    // 모드 변경 시 오버레이 및 데이터 관리
    useEffect(() => {
        if (map && modeChangeRef.current) {
            modeChangeRef.current = false;
            
            if (showFacilities) {
                cleanupOverlays();
                fetchFacilities(currentPosition, selectedRange);
            } else {
                cleanupFacilityOverlays();
                fetchPets(currentPosition, selectedRange);
            }
        }
    }, [
        map, 
        showFacilities, 
        currentPosition, 
        selectedRange, 
        fetchFacilities, 
        fetchPets, 
        cleanupOverlays, 
        cleanupFacilityOverlays
    ]);

    // // 컴포넌트 언마운트 시 오버레이 정리
    // useEffect(() => {
    //     return () => {
    //         cleanupOverlays();
    //         cleanupFacilityOverlays();
    //     };
    // }, [cleanupOverlays, cleanupFacilityOverlays]);

    // 시설/펫 토글 핸들러
    const handleFacilitiesToggle = () => {
        setShowFacilities(prev => !prev);
        
        // 선택된 항목 초기화
        setSelectedPet(null);
        setSelectedFacility(null);
        setShowList(false);
        setShowFacilitiesList(false);
    };

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
                        onListClick={() => {
                            if (showFacilities) {
                                setShowFacilitiesList(!showFacilitiesList);
                                setSelectedFacility(null);
                            } else {
                                setShowList(!showList);
                                setSelectedPet(null);
                            }
                        }}
                        onFacilitiesToggle={handleFacilitiesToggle}
                    />

                    <WriteButton 
                            onSelectMissingPost={handleSelectMissingPost}
                            onSelectReportPost={handleSelectReportPost}
                        />
                    
                    {/* 공통 카드 컴포넌트 */}
                    {(selectedPet || selectedFacility) && !(showList || showFacilitiesList) && (
                        <div className={`absolute bottom-16 left-0 right-0 max-h-[70vh] overflow-auto p-4 bg-white rounded-t-3xl shadow-lg border-t-2 border-orange-100 z-50 transition-all duration-300 ease-in-out ${
                            isCardVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
                        }`}>
                            <CommonCard 
                                item={selectedPet || selectedFacility} 
                                type={selectedPet ? 'pet' : 'facility'}
                                onClose={() => {
                                    setSelectedPet(null);
                                    setSelectedFacility(null);
                                }} 
                            />
                        </div>
                    )}
                    
                    {/* 공통 리스트 컴포넌트 */}
                    {(showList || showFacilitiesList) && (
                        <div className="absolute bottom-16 left-0 right-0 max-h-[70vh] overflow-auto z-50 bg-white rounded-t-3xl shadow-lg">
                            <CommonList 
                                items={showFacilities ? facilities : pets}
                                type={showFacilities ? 'facility' : 'pet'}
                                onItemClick={(item) => {
                                    if (showFacilities) {
                                        setSelectedFacility(item);
                                        setShowFacilitiesList(false);
                                    } else {
                                        setSelectedPet(item);
                                        setShowList(false);
                                    }
                                }}
                                onClose={() => {
                                    setShowList(false);
                                    setShowFacilitiesList(false);
                                }}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Map;