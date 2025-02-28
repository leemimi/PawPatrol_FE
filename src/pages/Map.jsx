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
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const Map = () => {
    const centerPosition = { lat: 37.497939, lng: 127.027587 };

    const [selectedRange, setSelectedRange] = useState(10);
    const [selectedPet, setSelectedPet] = useState(null);
    const [selectedFacility, setSelectedFacility] = useState(null);
    const [showList, setShowList] = useState(false);
    const [showFacilitiesList, setShowFacilitiesList] = useState(false);
    const [currentPosition, setCurrentPosition] = useState(centerPosition);
    const [isCardVisible, setIsCardVisible] = useState(false);
    const [isMarkerTransitioning, setIsMarkerTransitioning] = useState(false);
    const [showFacilities, setShowFacilities] = useState(false);
    
    // 알림 관련 상태
    const [notification, setNotification] = useState(null);
    const [showNotification, setShowNotification] = useState(false);
    const stompClientRef = useRef(null);
    
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

    useEffect(() => {
        if (currentPosition) {
            // WebSocket 연결 및 구독 초기화
            if (stompClientRef.current) {
                stompClientRef.current.deactivate(); // 기존 연결 종료
            }
    
            const client = new Client({
                webSocketFactory: () => new SockJS('http://localhost:8090/ws'),
                connectHeaders: {},
                debug: function (str) {
                    console.log(str);
                },
                reconnectDelay: 5000,
                heartbeatIncoming: 4000,
                heartbeatOutgoing: 4000
            });
    
            client.onConnect = function (frame) {
                console.log('Connected to WebSocket: ' + frame);
    
                // 구독: 실종/발견 게시글
                client.subscribe('/topic/lost-found-posts', function (message) {
                    const lostFoundPost = JSON.parse(message.body);
                    displayNotification(lostFoundPost); // 알림 표시
                });
    
                // 사용자 위치 기반 구독 등록
                if (currentPosition) {
                    const subscription = {
                        userId: getUserId(),
                        latitude: currentPosition.lat,
                        longitude: currentPosition.lng,
                        radius: selectedRange * 1000
                    };
                    client.publish({
                        destination: '/app/location/subscribe',
                        body: JSON.stringify(subscription)
                    });
    
                    // 개인화된 알림 구독
                    client.subscribe('/user/queue/notifications', function(message) {
                        const notificationData = JSON.parse(message.body);
                        displayNotification(notificationData); // 알림 표시
                    });
                }
            };
    
            client.onStompError = function (frame) {
                console.error('STOMP error:', frame.headers['message']);
            };
    
            client.activate();
            stompClientRef.current = client;
    
            return () => {
                if (stompClientRef.current) {
                    stompClientRef.current.deactivate(); // 컴포넌트 언마운트 시 연결 종료
                }
            };
        }
    }, [currentPosition, selectedRange]); // currentPosition, selectedRange 변경 시마다 실행
    

    // 사용자 ID 가져오기 함수 (실제 구현에 맞게 수정 필요)
    const getUserId = () => {
        // localStorage나 상태 관리 라이브러리에서 사용자 정보 가져오기
        const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {};
        return userInfo.id || 1; // 기본값으로 1 반환
    };

    // 알림 표시 함수
    const displayNotification = (data) => {
        setNotification(data);
        setShowNotification(true);
        
        //알림 자동 닫기
        setTimeout(() => {
            setShowNotification(false);
        }, 1000000);
    };

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
                    
                    // 위치 구독 업데이트
                    if (stompClientRef.current && stompClientRef.current.connected) {
                        const subscription = {
                            userId: getUserId(),
                            latitude: currentPosition.lat,
                            longitude: currentPosition.lng,
                            radius: newRange * 1000 // 미터 단위로 변환
                        };
                        
                        stompClientRef.current.publish({
                            destination: '/app/location/subscribe',
                            body: JSON.stringify(subscription)
                        });
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
                
                // 위치 구독 업데이트
                if (stompClientRef.current && stompClientRef.current.connected) {
                    const subscription = {
                        userId: getUserId(),
                        latitude: newPosition.lat,
                        longitude: newPosition.lng,
                        radius: selectedRange * 1000 // 미터 단위로 변환
                    };
                    
                    stompClientRef.current.publish({
                        destination: '/app/location/subscribe',
                        body: JSON.stringify(subscription)
                    });
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

    // 시설/펫 토글 핸들러
    const handleFacilitiesToggle = () => {
        setShowFacilities(prev => !prev);
        
        // 선택된 항목 초기화
        setSelectedPet(null);
        setSelectedFacility(null);
        setShowList(false);
        setShowFacilitiesList(false);
    };

    // 알림 닫기 핸들러
    const handleCloseNotification = () => {
        setShowNotification(false);
    };
    
    // 알림 클릭 핸들러 (해당 게시글로 이동)
    const handleNotificationClick = () => {
        if (notification && notification.postId) {
            // 알림에 해당하는 게시글로 이동하는 로직
            // 예: 게시글 상세 페이지로 이동
            // navigate(`/post/${notification.postId}`);
            
            // 또는 게시글이 있는 위치로 맵 이동
            if (notification.latitude && notification.longitude && map) {
                const position = new window.kakao.maps.LatLng(
                    notification.latitude, 
                    notification.longitude
                );
                map.setCenter(position);
                
                // 새 위치 설정
                setCurrentPosition({
                    lat: notification.latitude,
                    lng: notification.longitude
                });
                
                // 알림 닫기
                setShowNotification(false);
            }
        }
    };

    return (
        <div className="h-screen w-full bg-orange-50/30 relative overflow-hidden">
            {/* 알림 팝업 */}
            {showNotification && notification && (
                <div className="fixed top-4 right-4 z-50 bg-white rounded-lg shadow-lg max-w-xs w-full p-4 flex flex-col transition-all duration-300 ease-in-out animate-fadeIn">
                    <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-orange-600 text-sm">
                            {notification.status === 'LOST' ? '실종 신고' : '발견 신고'}
                        </h4>
                        <button 
                            onClick={handleCloseNotification}
                            className="p-1 ml-2 text-gray-400 hover:text-gray-600"
                        >
                            ✕
                        </button>
                    </div>
                    <div 
                        className="cursor-pointer" 
                        onClick={handleNotificationClick}
                    >
                        <p className="text-sm text-gray-800 font-medium">
                            {notification.content?.length > 50 
                                ? notification.content.substring(0, 50) + '...' 
                                : notification.content}
                        </p>
                        <div className="flex items-center mt-2 text-xs text-gray-500">
                            <span className="mr-2">작성자: {notification.nickname}</span>
                            {notification.distance && (
                                <span>약 {Math.round(notification.distance)}m 거리</span>
                            )}
                        </div>
                    </div>
                </div>
            )}

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