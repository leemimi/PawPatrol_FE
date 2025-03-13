import React, { useState, useEffect, useCallback, useRef } from 'react';
import { RadiusControl } from '../components/RadiusControl';
import { DollarSign } from 'lucide-react';
import { ControlButtons } from '../components/ControlButtons';
import { useKakaoMap } from '@/hooks/UseKakaoMap';
import { usePetData } from '../hooks/UsePetData';
import { useShelterAnimalsData } from '../hooks/UseShelterAnimalsData';
import { useGeolocation } from '../hooks/UseGeolocation.jsx';
import { useCustomOverlays } from '../hooks/UseCustomOverlays';
import { CommonList } from '../components/CommonList';
import { CommonCard } from '../components/CommonCard';
import RewardPoster from '../components/RewardPoster';
import { useNavigate } from 'react-router-dom';  
import WriteButton from '../components/WriteButton';
import NotificationButton from '../components/NotificationButton';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import NotificationService from '../api/AlarmApiService';
import { PetApiService } from '../api/PetApiService';

if (typeof global === 'undefined') {
    window.global = window;
}

const Map = () => {
    const navigate = useNavigate();  
    const defaultPosition = { lat: 37.497939, lng: 127.027587 };

    // localStorage에서 마지막 위치 정보 불러오기
    const getSavedPosition = () => {
        const savedPosition = localStorage.getItem('lastMapPosition');
        return savedPosition ? JSON.parse(savedPosition) : defaultPosition;
    };

    // localStorage에서 마지막 선택한 반경 불러오기
    const getSavedRange = () => {
        const savedRange = localStorage.getItem('lastMapRange');
        return savedRange ? Number(savedRange) : 3;
    };

    const [selectedRange, setSelectedRange] = useState(getSavedRange());
    const [selectedPet, setSelectedPet] = useState(null);
    const [showList, setShowList] = useState(false);
    const [currentPosition, setCurrentPosition] = useState(getSavedPosition());
    const [isCardVisible, setIsCardVisible] = useState(false);
    const [isMarkerTransitioning, setIsMarkerTransitioning] = useState(false);
    const [showRewardPoster, setShowRewardPoster] = useState(false);
    const [rewardPosterData, setRewardPosterData] = useState(null);


    // 알림 관련 상태
    const [notification, setNotification] = useState(null);
    const [showNotification, setShowNotification] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const stompClientRef = useRef(null);
    const [currentNotification, setCurrentNotification] = useState(null);

    // 초기 렌더링 및 데이터 로딩 추적을 위한 ref
    const initialLoadRef = useRef(false);
    const modeChangeRef = useRef(false);

    const { map, setMarkers, circleRef, updateCenterMarker } = useKakaoMap(currentPosition);

    // 위치와 마커를 동시에 업데이트하는 함수 생성
    const updatePosition = useCallback((newPosition) => {
        setCurrentPosition(newPosition);
        updateCenterMarker(newPosition);

        // 새 위치를 localStorage에 저장
        localStorage.setItem('lastMapPosition', JSON.stringify(newPosition));
    }, [updateCenterMarker]);

    // 펫 데이터 관련 훅 사용
    const {
        pets,
        fetchPets
    } = usePetData(currentPosition, selectedRange);

    // 보호소 동물 데이터 관련 훅 사용
    const {
        shelters,
        fetchShelters
    } = useShelterAnimalsData(currentPosition, selectedRange);

    // 데이터 통합 로딩 함수
    const fetchAllData = useCallback((position, range) => {
        fetchPets(position, range);
        fetchShelters(position, range);
    }, [fetchPets, fetchShelters]);

    // 위치 관련 훅 사용
    const { getCurrentLocation } = useGeolocation(
        map,
        circleRef,
        (newPosition) => {
            updatePosition(newPosition);
            fetchAllData(newPosition, selectedRange);
        },
        updateCenterMarker // 마커 업데이트 함수 직접 전달
    );

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

    const handleNewNotification = useCallback((newNotification) => {
        setNotifications(prev => {
            const isDuplicate = prev.some(n => n.id === newNotification.id);
            if (isDuplicate) {
                return prev;
            }

            const formattedNotification = {
                ...newNotification,
                timestamp: new Date(newNotification.createdAt || Date.now()).getTime(),
                isRead: false
            };

            const updatedNotifications = [formattedNotification, ...prev]
                .sort((a, b) => b.timestamp - a.timestamp);

            // displayNotification(formattedNotification);

            return updatedNotifications;
        });
    }, []);

    const fetchInitialNotifications = useCallback(async () => {
        try {
            const response = await NotificationService.getNotifications();
            if (response && response.content) {
                const formattedNotifications = response.content.map(notification => ({
                    ...notification,
                    timestamp: new Date(notification.createdAt).getTime(),
                    isRead: notification.isRead
                }));
                
                setNotifications(formattedNotifications);
            }
        } catch (error) {
            console.error('알림을 불러오는데 실패했습니다:', error);
        }
    }, []);

    useEffect(() => {
            const client = new Client({
                webSocketFactory: () => {
                    return new SockJS(`${import.meta.env.VITE_CORE_API_BASE_URL}/ws`, null, {
                        transports: ['websocket', 'xhr-streaming', 'xhr-polling'],
                        withCredentials: true
                    });
                },
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
                const userId = getUserId();

                client.subscribe(`/queue/notification/${userId}`, function (message) {
                    try {
                        const notificationData = JSON.parse(message.body);

                        const newNotification = {
                            ...notificationData,
                            timestamp: Date.now(),
                            isRead: false
                        };

                        setNotifications(prev => [newNotification, ...prev]);

                        // displayNotification(newNotification);
                    } catch (error) {
                        console.error("Error parsing notification:", error);
                    }
                });
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
        
    }, [ handleNewNotification]);

    // 컴포넌트 마운트 시 초기 알림 로드
    useEffect(() => {
        fetchInitialNotifications();
    }, [fetchInitialNotifications]);

    const getUserId = () => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {};
        return userInfo.id || 1;
    };

    // 알림 표시 함수
    // const displayNotification = (data) => {
    //     setCurrentNotification({
    //         id: data.id,
    //         title: data.title,
    //         content: data.body,
    //         createdAt: data.createdAt || data.timestamp,
    //         type: data.type
    //     });
    //     setShowNotification(true);
    
    //     // 3초 후 알림만 닫기 (읽음 처리는 하지 않음)
    //     setTimeout(() => {
    //         setShowNotification(false);
    //         setCurrentNotification(null);
    //     }, 3000);
    // };
    

    // 알림 삭제 핸들러
    const handleClearNotification = async (notification) => {
        try {
            await NotificationService.deleteNotification(notification.id);
            
            setNotifications(prev =>
                prev.filter(notif => notif.id !== notification.id)
            );
        } catch (error) {
            console.error('알림 삭제 실패:', error);
        }
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

        showTestRewardPoster();

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
            circleRef.current.setRadius(selectedRange * 1000); // 초기 원 반경 설정
            circleRef.current.setMap(map);
        }
    }, [currentPosition, map, circleRef, selectedRange]);

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
                localStorage.setItem('lastMapPosition', JSON.stringify(finalPosition));
                localStorage.setItem('lastMapRange', selectedRange.toString());
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            // 컴포넌트 언마운트 시에도 현재 위치 저장
            localStorage.setItem('lastMapPosition', JSON.stringify(currentPosition));
            localStorage.setItem('lastMapRange', selectedRange.toString());
        };
    }, [map, currentPosition, selectedRange]);

    // 반경 변경 핸들러
    const handleRangeChange = useCallback((newRange) => {
        setIsMarkerTransitioning(true);
        setSelectedRange(newRange);

        // 선택한 반경을 localStorage에 저장
        localStorage.setItem('lastMapRange', newRange.toString());

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

                    // 마커 위치 확인 및 업데이트
                    updateCenterMarker(currentPosition);

                    fetchAllData(currentPosition, newRange);

                    // 위치 구독 업데이트
                    if (stompClientRef.current && stompClientRef.current.connected) {
                        const subscription = {
                            userId: getUserId(),
                            latitude: currentPosition.lat,
                            longitude: currentPosition.lng,
                            radius: newRange * 1000, // 미터 단위로 변환
                            includeMyPosts: true
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
    }, [circleRef, currentPosition, fetchAllData, updateCenterMarker]);

    // 맵 드래그 종료 이벤트 useEffect
    useEffect(() => {
        if (map) {
            const handleDragEnd = () => {
                const center = map.getCenter();
                const newPosition = {
                    lat: center.getLat(),
                    lng: center.getLng()
                };
                updatePosition(newPosition);

                cleanupOverlays();
                // 드래그 후 바로 데이터 가져오기 (debounce 제거)
                fetchAllData(newPosition, selectedRange);

                // 위치 구독 업데이트
                if (stompClientRef.current && stompClientRef.current.connected) {
                    const subscription = {
                        userId: getUserId(),
                        latitude: newPosition.lat,
                        longitude: newPosition.lng,
                        radius: selectedRange * 1000, // 미터 단위로 변환
                        includeMyPosts: true
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
    }, [map, selectedRange, fetchAllData, updatePosition]);

    // 선택된 항목에 따른 카드 가시성 useEffect
    useEffect(() => {
        if (selectedPet) {
            setTimeout(() => setIsCardVisible(true), 50);
        } else {
            setIsCardVisible(false);
        }
    }, [selectedPet]);

    // showFacilities 변경 시 모드 변경 플래그 설정
    useEffect(() => {
        modeChangeRef.current = true;
    }, []);

    // 펫 데이터 변경 시 오버레이 업데이트
    useEffect(() => {
        if (map) {
            const allData = [...pets, ...shelters];
            if (allData.length > 0) {
                createCustomOverlays(allData);
            }
        }
    }, [map, pets, shelters, createCustomOverlays]);

    // 초기 데이터 로딩 useEffect
    useEffect(() => {
        if (map && !initialLoadRef.current) {
            initialLoadRef.current = true;
            fetchAllData(currentPosition, selectedRange);
        }
    }, [map, currentPosition, selectedRange, fetchAllData]);

    // 모드 변경 시 오버레이 및 데이터 관리
    useEffect(() => {
        if (map && modeChangeRef.current) {
            modeChangeRef.current = false;

            cleanupOverlays();
            fetchAllData(currentPosition, selectedRange);
        }
    }, [
        map,
        currentPosition,
        selectedRange,
        fetchAllData,
        cleanupOverlays
    ]);

    // 알림 목록 가져오기
    const fetchNotifications = useCallback(async () => {
        try {
          const response = await NotificationService.getNotifications();
          console.log('받은 알림 데이터:', response);
          
          if (response && response.content) {
            console.log('알림 목록:', response.content);
            
            const formattedNotifications = response.content.map(notification => ({
              ...notification,
              timestamp: new Date(notification.createdAt).getTime(),
              isRead: notification.isRead
            }));
            
            setNotifications(formattedNotifications);
          } else {
            console.log('알림 데이터에 content가 없습니다:', response);
          }
        } catch (error) {
          console.error('알림을 불러오는데 실패했습니다:', error);
        }
      }, []);

    // 컴포넌트 마운트 시 알림 목록 가져오기
    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);


    // 알림 읽음 처리
    const handleNotificationRead = async (notification) => {
        console.log('알림 읽음 처리:', notification);
        try {
            await NotificationService.markAsRead(notification.id);
            // 알림 목록 업데이트
            setNotifications(prev => 
                prev.map(notif => 
                    notif.id === notification.id
                        ? { ...notif, isRead: true }
                        : notif
                )
            )

            if (notification.post.id) {
                navigate(`/PetPostDetail/${notification.post.id}`);
            }

        } catch (error) {
            console.error('알림 읽음 처리 실패:', error);
        }
    };

    // Fixed the function definition here to avoid duplicate declaration
    const showTestRewardPoster = async (forceShow = false) => {
        if (!forceShow) {
            // 24시간 내에 '표시하지 않기'를 체크했는지 확인
            const lastHiddenTime = localStorage.getItem('lastPosterHiddenTime');
            const now = new Date().getTime();
            const oneDayInMs = 24 * 60 * 60 * 1000; // 24시간을 밀리초로 표현

            // 마지막으로 숨겨진 시간이 있고, 24시간이 지나지 않았으면 표시하지 않음
            if (lastHiddenTime && (now - Number(lastHiddenTime)) < oneDayInMs) {
                return;
            }
        }

        try {
            // 여기서 먼저 API 호출해서 데이터 확인
            const result = await PetApiService.fetchRewardPosts();

            if (result && result.content) {
                // 보상금이 null이 아닌 게시글만 필터링
                const filteredPosters = result.content.filter(post => post.reward !== null && post.reward > 0);

                if (filteredPosters.length > 0) {
                    // 보상금 게시글이 있을 때만 포스터 표시
                    setRewardPosterData(filteredPosters);
                    setShowRewardPoster(true); // 확인 후 표시
                } else {
                    // 보상금 게시글이 없을 때는 표시하지 않음
                    console.log("보상금이 설정된 게시글이 없습니다.");
                }
            } else {
                console.log("데이터 형식이 올바르지 않거나 게시글이 없습니다.");
            }
        } catch (error) {
            console.error("보상금 게시글 데이터 로딩 실패:", error);
        }
    };

    const getDontShowPreference = () => {
        const lastHiddenTime = localStorage.getItem('lastPosterHiddenTime');
        if (!lastHiddenTime) return false;

        const now = new Date().getTime();
        const oneDayInMs = 24 * 60 * 60 * 1000;

        // 24시간이 지나지 않았다면 true 반환
        return (now - Number(lastHiddenTime)) < oneDayInMs;
    };

    const [dontShowFor24Hours, setDontShowFor24Hours] = useState(getDontShowPreference());

    return (
        <div className="h-screen w-full bg-orange-50/30 relative overflow-hidden">
            {/* 알림 팝업 */}
            {showNotification && currentNotification && (
                <div 
                    className="fixed top-4 right-4 z-50 bg-white rounded-xl shadow-lg max-w-xs w-full overflow-hidden transition-all duration-300 ease-in-out transform translate-y-0 cursor-pointer"
                    onClick={() => {
                        setShowNotification(false);
                        handleNotificationRead(currentNotification);
                    }}
                >
                    <div className="p-4 border-l-4 border-orange-500">
                        <div className="flex-1">
                            <h3 className="text-sm font-semibold text-amber-800">
                                {currentNotification.title}
                            </h3>
                            <p className="mt-1 text-sm text-amber-600">
                                {currentNotification.content}
                            </p>
                            <span className="mt-2 text-xs text-amber-400">
                                {new Date(currentNotification.createdAt).toLocaleString()}
                            </span>
                        </div>
                    </div>
                    <div 
                        className="h-1 bg-orange-100"
                        style={{
                            animation: 'timeoutProgress 3s linear forwards'
                        }}
                    />
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
                        onListClick={() => setShowList(!showList)}
                    />
                    <button
                        onClick={() => showTestRewardPoster(true)}
                        className="fixed bottom-52 left-4 z-40 bg-white rounded-full p-3 shadow-lg text-red-600 hover:text-red-500 transition-colors border-2 border-red-100"
                        title="현상금 전단지 테스트"
                    >
                        <DollarSign size={24} />
                    </button>

                    {/* 알림 버튼 컴포넌트 - 글쓰기 버튼 위에 배치 */}
                    <NotificationButton
                        notifications={notifications}
                        onViewNotification={handleNotificationRead}
                        onClearNotification={handleClearNotification}
                    />

                    <WriteButton
                        onSelectMissingPost={handleSelectMissingPost}
                        onSelectReportPost={handleSelectReportPost}
                    />

                    {/* 공통 카드 컴포넌트 */}
                    {selectedPet && !showList && (
                        <div className={`absolute bottom-16 left-0 right-0 max-h-[70vh] overflow-auto p-4 bg-white rounded-t-3xl shadow-lg border-t-2 border-orange-100 z-50 transition-all duration-300 ease-in-out ${isCardVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
                            }`}>
                            <CommonCard
                                item={selectedPet}
                                type="pet"
                                onClose={() => {
                                    setSelectedPet(null);
                                }}
                            />
                        </div>
                    )}

                    {/* 공통 리스트 컴포넌트 */}
                    {showList && (
                        <div className="absolute bottom-16 left-0 right-0 max-h-[70vh] overflow-auto z-50 bg-white rounded-t-3xl shadow-lg">
                            <CommonList
                                items={[...pets, ...shelters]}
                                type="pet"
                                onItemClick={(item) => {
                                    setSelectedPet(item);
                                    setShowList(false);
                                }}
                                onClose={() => {
                                    setShowList(false);
                                }}
                            />
                        </div>
                    )}

                    {showRewardPoster && (
                        <RewardPoster
                            posters={rewardPosterData}
                            initialIndex={0}
                            onClose={() => setShowRewardPoster(false)}
                            dontShowFor24Hours={dontShowFor24Hours}
                            setDontShowFor24Hours={setDontShowFor24Hours}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

// CSS 애니메이션 추가
const styles = `
@keyframes timeoutProgress {
    from { width: 100%; }
    to { width: 0%; }
}
`;

// style 태그 생성 및 추가
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

// Export statement at the top level
export default Map;