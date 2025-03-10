import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useKakaoMap } from '@/hooks/UseKakaoMap';
import { useGeolocation } from '../../hooks/UseGeolocation.jsx';
import { useFacilitiesData } from '../../hooks/UseFacilitiesData.jsx';
import { useFacilityOverlays } from '@/hooks/UseFacilityOverlays';

import { RadiusControl } from '../../components/RadiusControl';
import { ControlButtons } from '../../components/ControlButtons';
import { CommonCard } from '@/components/CommonCard';
import { CommonList } from '@/components/CommonList';
import { RescueGuide } from './components/RescueGuide';
import { AlertCircle } from 'lucide-react';

const Rescue = () => {
    const navigate = useNavigate();
    const centerPosition = { lat: 37.497939, lng: 127.027587 };

    // 기본 상태들
    const [currentPosition, setCurrentPosition] = useState(centerPosition);
    const [selectedRange, setSelectedRange] = useState(3);
    const [isMarkerTransitioning, setIsMarkerTransitioning] = useState(false);
    const [showRescueGuide, setShowRescueGuide] = useState(true);
    const [showNearbyHospitals, setShowNearbyHospitals] = useState(false);
    const [selectedFacility, setSelectedFacility] = useState(null);
    const [isCardVisible, setIsCardVisible] = useState(false);
    const [showList, setShowList] = useState(false);

    useEffect(() => {
        if (selectedFacility) {
            setTimeout(() => setIsCardVisible(true), 50);
        } else {
            setIsCardVisible(false);
        }
    }, [selectedFacility]);

    // 지도 관련 훅
    const { map, setMarkers, circleRef } = useKakaoMap(currentPosition);

    // 위치 관련 훅
    const { getCurrentLocation } = useGeolocation(map, circleRef, (newPosition) => {
        setCurrentPosition(newPosition);
        if (showNearbyHospitals) {
            fetchFacilities(newPosition, selectedRange);
        }
    });

    // 시설(병원) 데이터 훅
    const {
        facilities,
        fetchFacilities,
        debouncedFetchFacilities
    } = useFacilitiesData(currentPosition, selectedRange);

    // selectedFacility 선택 핸들러 추가 - useCallback으로 메모이제이션
    const handleSelectFacility = useCallback((facility) => {
        // 이미 선택된 시설인 경우 다시 선택하지 않음
        if (selectedFacility && selectedFacility.id === facility.id) {
            return;
        }
        setSelectedFacility(facility);
        setShowRescueGuide(false); // 구조 가이드 닫기
        setShowList(false); // 리스트 닫기
    }, [selectedFacility]);

    // useFacilityOverlays 훅 사용 부분 수정
    const {
        facilityOverlays,
        createFacilityCustomOverlays,
        cleanupFacilityOverlays
    } = useFacilityOverlays({
        map,
        selectedFacility,
        onSelectFacility: handleSelectFacility // 새로운 핸들러 사용
    });

    // 기본 스타일 설정
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

    // 원형 반경 위치 설정
    useEffect(() => {
        if (map && circleRef.current) {
            const moveLatLon = new window.kakao.maps.LatLng(currentPosition.lat, currentPosition.lng);
            circleRef.current.setPosition(moveLatLon);
            circleRef.current.setMap(map);
        }
    }, [currentPosition, map, circleRef]);

    // 반경 변경 핸들러
    const handleRangeChange = (newRange) => {
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

                    if (showNearbyHospitals) {
                        fetchFacilities(currentPosition, newRange);
                    }
                }
            };

            animate();
        }
    };

    // 병원 목록 보기 버튼 핸들러
    const handleShowHospitalList = () => {
        setSelectedFacility(null); // 선택된 병원 초기화
        setShowRescueGuide(false); // 가이드 닫기
        setShowList(true); // 리스트 표시
    };

    // 현재 위치 변경시 병원 정보 가져오기
    useEffect(() => {
        if (currentPosition) {
            fetchFacilities(currentPosition, selectedRange);
        }
    }, [currentPosition, selectedRange]);

    // 시설 데이터 변경 시 오버레이 업데이트
    useEffect(() => {
        if (map && facilities.length > 0) {
            createFacilityCustomOverlays(facilities);
        }
    }, [map, facilities, createFacilityCustomOverlays]);

    return (
        <div className="h-screen w-full bg-orange-50/30 relative overflow-hidden">
            <div className="h-full w-full">
                <div className="relative h-full w-full">
                    <div id="map" className="w-full h-full overflow-visible" />

                    {/* 반경 컨트롤 */}
                    <RadiusControl
                        selectedRange={selectedRange}
                        onRangeChange={handleRangeChange}
                        isTransitioning={isMarkerTransitioning}
                    />

                    {/* 컨트롤 버튼 */}
                    <ControlButtons
                        onLocationClick={getCurrentLocation}
                        onListClick={() => setShowList(true)}
                        onFacilitiesToggle={() => { }}
                    />

                    {/* 선택된 병원 정보 카드 */}
                    {selectedFacility && !showRescueGuide && !showList && (
                        <div className={`absolute bottom-16 left-0 right-0 max-h-[70vh] overflow-auto p-4 bg-white rounded-t-3xl shadow-lg border-t-2 border-orange-100 z-50 transition-all duration-300 ease-in-out ${isCardVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
                            }`}>
                            <CommonCard
                                item={selectedFacility}
                                type="facility"
                                onClose={() => {
                                    setSelectedFacility(null);
                                    setShowRescueGuide(true); // 구조 가이드 다시 열기
                                }}
                            />
                        </div>
                    )}

                    {/* 병원 목록 */}
                    {showList && (
                        <div className="absolute bottom-16 left-0 right-0 max-h-[70vh] overflow-auto z-50 bg-white rounded-t-3xl shadow-lg">
                            <CommonList
                                items={facilities}
                                type="facility"
                                onItemClick={(facility) => {
                                    setSelectedFacility(facility);
                                    setShowList(false);
                                }}
                                onClose={() => {
                                    setShowList(false);
                                }}
                            />
                        </div>
                    )}

                    {/* 구조 가이드 모달 */}
                    {showRescueGuide && (
                        <RescueGuide
                            onClose={() => setShowRescueGuide(false)}
                            navigate={navigate}
                            onShowHospitalList={handleShowHospitalList}
                            showNearbyHospitals={showNearbyHospitals}
                            setShowNearbyHospitals={setShowNearbyHospitals}
                            fetchFacilities={() => fetchFacilities(currentPosition, selectedRange)}
                            currentPosition={currentPosition}
                            selectedRange={selectedRange}
                        />
                    )}

                    {/* 가이드가 닫혔을 때 보여줄 버튼 */}
                    {!showRescueGuide && !selectedFacility && !showList && (
                        <div className="absolute bottom-20 right-4 flex flex-col gap-2 z-50">
                            <button
                                onClick={() => setShowRescueGuide(true)}
                                className="bg-orange-500 text-white rounded-full p-3 shadow-lg"
                            >
                                <AlertCircle size={24} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Rescue;