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
    const defaultPosition = { lat: 37.497939, lng: 127.027587 };
    
    // localStorage에서 마지막 위치 정보 불러오기
    const getSavedPosition = () => {
        const savedPosition = localStorage.getItem('lastRescuePosition');
        return savedPosition ? JSON.parse(savedPosition) : defaultPosition;
    };
    
    // localStorage에서 마지막 선택한 반경 불러오기
    const getSavedRange = () => {
        const savedRange = localStorage.getItem('lastRescueRange');
        return savedRange ? Number(savedRange) : 3;
    };

    // 기본 상태들
    const [currentPosition, setCurrentPosition] = useState(getSavedPosition());
    const [selectedRange, setSelectedRange] = useState(getSavedRange());
    const [isMarkerTransitioning, setIsMarkerTransitioning] = useState(false);
    const [showRescueGuide, setShowRescueGuide] = useState(true);
    const [showNearbyHospitals, setShowNearbyHospitals] = useState(false);
    const [selectedFacility, setSelectedFacility] = useState(null);
    const [isCardVisible, setIsCardVisible] = useState(false);
    const [showList, setShowList] = useState(false);

    // 디버깅을 위한 로깅 추가
    useEffect(() => {
        console.log("showNearbyHospitals 상태 변경:", showNearbyHospitals);
    }, [showNearbyHospitals]);

    useEffect(() => {
        if (selectedFacility) {
            setTimeout(() => setIsCardVisible(true), 50);
        } else {
            setIsCardVisible(false);
        }
    }, [selectedFacility]);

    // 지도 관련 훅
    const { map, setMarkers, circleRef, updateCenterMarker } = useKakaoMap(currentPosition);

    // 시설(병원) 데이터 훅 - 무조건 데이터를 가져오도록 수정
    const {
        facilities,
        fetchFacilities,
        debouncedFetchFacilities
    } = useFacilitiesData(currentPosition, selectedRange);

    // 디버깅을 위한 로깅 추가
    useEffect(() => {
        console.log("시설 데이터 변경:", facilities?.length || 0);
    }, [facilities]);

    // 위치와 마커를 동시에 업데이트하는 함수 생성
    const updatePosition = useCallback((newPosition) => {
        setCurrentPosition(newPosition);
        if (updateCenterMarker) updateCenterMarker(newPosition);
        
        // 새 위치를 localStorage에 저장
        localStorage.setItem('lastRescuePosition', JSON.stringify(newPosition));
        
        // 시설 데이터 업데이트 - 무조건 가져오도록 수정
        if (typeof fetchFacilities === 'function') {
            fetchFacilities(newPosition, selectedRange);
            console.log("새 위치에서 시설 데이터 요청:", newPosition);
        }
    }, [fetchFacilities, selectedRange, updateCenterMarker]);

    // 위치 관련 훅
    const { getCurrentLocation } = useGeolocation(map, circleRef, updateCenterMarker, (newPosition) => {
        updatePosition(newPosition);
    });

    // 페이지 이탈 감지
    useEffect(() => {
        // 사용자가 페이지를 떠날 때 최종 위치 저장
        const handleBeforeUnload = () => {
            if (map) {
                const center = map.getCenter();
                const finalPosition = {
                    lat: center.getLat(),
                    lng: center.getLng()
                };
                localStorage.setItem('lastRescuePosition', JSON.stringify(finalPosition));
                localStorage.setItem('lastRescueRange', selectedRange.toString());
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            // 컴포넌트 언마운트 시에도 현재 위치 저장
            localStorage.setItem('lastRescuePosition', JSON.stringify(currentPosition));
            localStorage.setItem('lastRescueRange', selectedRange.toString());
        };
    }, [map, currentPosition, selectedRange]);

    // selectedFacility 선택 핸들러 추가 - useCallback으로 메모이제이션
    const handleSelectFacility = useCallback((facility) => {
        // 이미 선택된 시설인 경우 다시 선택하지 않음
        if (selectedFacility && selectedFacility.id === facility.id) {
            return;
        }
        console.log("시설 선택:", facility);
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
            circleRef.current.setRadius(selectedRange * 1000); // 초기 원 반경 설정
            circleRef.current.setMap(map);
        }
    }, [currentPosition, map, circleRef, selectedRange]);

    // 지도 클릭 이벤트 추가
    useEffect(() => {
        if (map) {
            const handleMapClick = (mouseEvent) => {
                // 클릭한 위치 좌표 가져오기
                const latlng = mouseEvent.latLng;
                
                // 새 위치 객체 생성
                const newPosition = {
                    lat: latlng.getLat(),
                    lng: latlng.getLng()
                };
                
                console.log("지도 클릭:", newPosition);
                
                // 위치 업데이트
                updatePosition(newPosition);
            };
            
            // 클릭 이벤트 리스너 등록
            window.kakao.maps.event.addListener(map, 'click', handleMapClick);
            
            // 클린업 함수
            return () => {
                window.kakao.maps.event.removeListener(map, 'click', handleMapClick);
            };
        }
    }, [map, updatePosition]);

    // 지도 드래그 종료 이벤트 추가
    useEffect(() => {
        if (map) {
            const handleDragEnd = () => {
                // 지도 중심 좌표 가져오기
                const center = map.getCenter();
                
                // 새 위치 객체 생성
                const newPosition = {
                    lat: center.getLat(),
                    lng: center.getLng()
                };
                
                console.log("지도 드래그 종료:", newPosition);
                
                // 위치 업데이트
                updatePosition(newPosition);
            };
            
            // 드래그 종료 이벤트 리스너 등록
            window.kakao.maps.event.addListener(map, 'dragend', handleDragEnd);
            
            // 클린업 함수
            return () => {
                window.kakao.maps.event.removeListener(map, 'dragend', handleDragEnd);
            };
        }
    }, [map, updatePosition]);

    // 반경 변경 핸들러
    const handleRangeChange = (newRange) => {
        console.log("반경 변경:", newRange);
        setIsMarkerTransitioning(true);
        setSelectedRange(newRange);
        
        // 선택한 반경을 localStorage에 저장
        localStorage.setItem('lastRescueRange', newRange.toString());

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

                    // 마커 위치 확인
                    if (updateCenterMarker) updateCenterMarker(currentPosition);
                    
                    // 무조건 병원 정보를 가져오도록 수정
                    if (typeof fetchFacilities === 'function') {
                        fetchFacilities(currentPosition, newRange);
                        console.log("반경 변경 후 시설 데이터 요청:", currentPosition, newRange);
                    }
                }
            };

            animate();
        }
    };

    // 시설(병원) 닫기 핸들러
    const handleCloseFacility = useCallback(() => {
        setSelectedFacility(null);
        // 구조 가이드를 자동으로 열지 않음
    }, []);
    
    // 병원 목록 보기 버튼 핸들러
    const handleShowHospitalList = useCallback(() => {
        console.log("병원 목록 보기 클릭");
        setSelectedFacility(null); // 선택된 병원 초기화
        setShowRescueGuide(false); // 가이드 닫기
        
        // 병원 데이터 강제 로드
        if (typeof fetchFacilities === 'function') {
            console.log("병원 목록 보기 - 데이터 강제 로드");
            fetchFacilities(currentPosition, selectedRange);
        }
        
        // 병원 보기 활성화
        setShowNearbyHospitals(true);
        
        // 약간 지연 후 목록 표시 (데이터 로드 시간 확보)
        setTimeout(() => {
            setShowList(true);
        }, 300);
    }, [currentPosition, fetchFacilities, selectedRange]);

    // 병원 표시 상태가 변경될 때 데이터 로드
    useEffect(() => {
        if (showNearbyHospitals && typeof fetchFacilities === 'function') {
            console.log("showNearbyHospitals 변경으로 시설 데이터 요청");
            fetchFacilities(currentPosition, selectedRange);
        }
    }, [showNearbyHospitals, currentPosition, selectedRange, fetchFacilities]);

    // 컴포넌트 마운트 시 초기 데이터 로드
    useEffect(() => {
        if (typeof fetchFacilities === 'function') {
            console.log("초기 시설 데이터 로드");
            fetchFacilities(currentPosition, selectedRange);
        }
    }, []);

    // 시설 데이터 변경 시 오버레이 업데이트
    useEffect(() => {
        if (map && facilities && facilities.length > 0 && typeof createFacilityCustomOverlays === 'function') {
            console.log("오버레이 생성:", facilities.length);
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
                        onListClick={() => {
                            console.log("목록 버튼 클릭");
                            if (!showList) {
                                // 병원 정보 강제 로드
                                if (typeof fetchFacilities === 'function') {
                                    fetchFacilities(currentPosition, selectedRange);
                                }
                                setTimeout(() => setShowList(true), 100);
                            } else {
                                setShowList(false);
                            }
                        }}
                        onFacilitiesToggle={() => {
                            console.log("시설 토글 버튼 클릭");
                            const newValue = !showNearbyHospitals;
                            setShowNearbyHospitals(newValue);
                            if (newValue && typeof fetchFacilities === 'function') {
                                fetchFacilities(currentPosition, selectedRange);
                            }
                        }}
                    />

                    {/* 선택된 병원 정보 카드 */}
                    {selectedFacility && !showRescueGuide && !showList && (
                        <div className={`absolute bottom-16 left-0 right-0 max-h-[70vh] overflow-auto p-4 bg-white rounded-t-3xl shadow-lg border-t-2 border-orange-100 z-50 transition-all duration-300 ease-in-out ${isCardVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
                            }`}>
                            <CommonCard
                                item={selectedFacility}
                                type="facility"
                                onClose={() => {
                                    handleCloseFacility();
                                }}
                            />
                        </div>
                    )}

                    {/* 병원 목록 */}
                    {showList && (
                        <div className="absolute bottom-16 left-0 right-0 max-h-[70vh] overflow-auto z-50 bg-white rounded-t-3xl shadow-lg">
                            <div className="p-4 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900">
                                    주변 병원 목록 {facilities ? `(${facilities.length})` : '(0)'}
                                </h3>
                                {(!facilities || facilities.length === 0) && (
                                    <p className="text-sm text-red-500 mt-2">
                                        주변에 병원 정보가 없습니다. 다른 위치를 선택해 보세요.
                                    </p>
                                )}
                            </div>
                            <CommonList
                                items={facilities || []}
                                type="facility"
                                onItemClick={(facility) => {
                                    console.log("목록에서 시설 선택:", facility);
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
                            setShowNearbyHospitals={(value) => {
                                console.log("setShowNearbyHospitals 호출:", value);
                                setShowNearbyHospitals(value);
                                if (value && typeof fetchFacilities === 'function') {
                                    fetchFacilities(currentPosition, selectedRange);
                                }
                            }}
                            fetchFacilities={() => {
                                if (typeof fetchFacilities === 'function') {
                                    console.log("RescueGuide에서 fetchFacilities 호출");
                                    fetchFacilities(currentPosition, selectedRange);
                                }
                            }}
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