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
import { PetCard } from '../components/PetCard';
import WriteButton from '../components/WriteButton';
import NotificationButton from '../components/NotificationButton';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { PetApiService } from '../api/PetApiService';

// window.global 설정
if (typeof global === 'undefined') {
    window.global = window;
}

const Map = () => {
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

    useEffect(() => {
        if (currentPosition) {
            // WebSocket 연결 및 구독 초기화
            if (stompClientRef.current) {
                stompClientRef.current.deactivate(); // 기존 연결 종료
            }

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

                // 구독: 실종/발견 게시글
                // 개인화된 알림 구독 - 현재 로그인한 사용자 ID 사용
  const userId = getUserId();
  const userSpecificTopic = `/user/${userId}/queue/notifications`;
  
  client.subscribe(userSpecificTopic, function (message) {
    try {
      const notificationData = JSON.parse(message.body);
      console.log("Personal notification received:", notificationData);
      
      // 알림에 타임스탬프와 읽음 상태 확인
      const newNotification = {
        ...notificationData,
        timestamp: notificationData.timestamp || Date.now(),
        read: notificationData.read !== undefined ? notificationData.read : false
      };
      
      // 알림 상태 업데이트 (최근 알림이 맨 위로)
      setNotifications(prev => [newNotification, ...prev]);
      
      // 알림 표시
      displayNotification(newNotification);
    } catch (error) {
      console.error("Error parsing notification:", error);
    }
  });

                // 사용자 위치 기반 구독 등록
                if (currentPosition) {
                    const subscription = {
                        userId: getUserId(),
                        latitude: currentPosition.lat,
                        longitude: currentPosition.lng,
                        radius: selectedRange * 1000,
                        includeMyPosts: true // 내 게시글도 포함
                    };
                    client.publish({
                        destination: '/app/location/subscribe',
                        body: JSON.stringify(subscription)
                    });

                    // 개인화된 알림 구독
                    client.subscribe('/user/queue/notifications', function (message) {
                        try {
                            const notificationData = JSON.parse(message.body);
                            console.log("Personalized notification received:", notificationData);

                            // 알림에 타임스탬프와 읽음 상태 추가
                            const newNotification = {
                                ...notificationData,
                                timestamp: Date.now(),
                                read: false
                            };

                            // 알림 상태 업데이트 (최근 알림이 맨 위로)
                            setNotifications(prev => [newNotification, ...prev]);

                            // 알림 표시
                            displayNotification(newNotification);
                        } catch (error) {
                            console.error("Error parsing notification:", error);
                        }
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
    }, [currentPosition, selectedRange]);


    const getUserId = () => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {};
        return userInfo.id || 1;
    };

    // 알림 표시 함수
    const displayNotification = (data) => {
        setNotification(data);
        setShowNotification(true);

        // 알림 자동 닫기
        setTimeout(() => {
            setShowNotification(false);
        }, 5000); // 5초 후 자동으로 닫힘
    };

    // 알림 처리 핸들러
    const handleViewNotification = (notification) => {
        // 알림을 읽음 상태로 변경
  setNotifications(prev =>
    prev.map(notif =>
      notif.id === notification.id ? { ...notif, read: true } : notif
    )
  );
  
  // 위치 정보 추출 - 구조에 따라 다르게 접근
  const latitude = notification.latitude || notification.postData?.latitude;
  const longitude = notification.longitude || notification.postData?.longitude;
  
  // 해당 위치로 지도 이동
  if (latitude && longitude && map) {
    const position = new window.kakao.maps.LatLng(latitude, longitude);
    map.setCenter(position);
    
    // 현재 위치 업데이트
    updatePosition({
      lat: latitude,
      lng: longitude
    });
    };
    // 게시글 ID가 있으면 해당 게시글로 이동
  const postId = notification.postId || notification.postData?.id;
  if (postId) {
    console.log('상세 페이지로 이동:', postId);
    navigate(`/PetPostDetail/${postId}`);
  }
};

    // 알림 삭제 핸들러
    const handleClearNotification = (notification) => {
        setNotifications(prev =>
            prev.filter(notif => notif.id !== notification.id)
        );
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

    // 알림 닫기 핸들러
    const handleCloseNotification = () => {
        setShowNotification(false);
    };

    // 알림 클릭 핸들러 (해당 게시글로 이동)
    const handleNotificationClick = () => {
        if (notification && notification.postId) {
            // 알림을 읽음 상태로 변경
            setNotifications(prev =>
                prev.map(notif =>
                    notif.id === notification.id ? { ...notif, read: true } : notif
                )
            );

            // 또는 게시글이 있는 위치로 맵 이동
            if (notification.latitude && notification.longitude && map) {
                const position = new window.kakao.maps.LatLng(
                    notification.latitude,
                    notification.longitude
                );
                map.setCenter(position);

                // 새 위치 설정
                updatePosition({
                    lat: notification.latitude,
                    lng: notification.longitude
                });

                // 알림 닫기
                setShowNotification(false);
            }
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
            setShowRewardPoster(true);
            const result = await PetApiService.fetchRewardPosts();

            if (result && result.content && result.content.length > 0) {
                // 보상금이 null이 아닌 게시글만 필터링
                const filteredPosters = result.content.filter(post => post.reward !== null && post.reward > 0);
                setRewardPosterData(filteredPosters);
            } else {
                console.error("보상금이 설정된 게시글이 없습니다.");
                setRewardPosterData([]);
            }
        } catch (error) {
            console.error("보상금 게시글 데이터 로딩 실패:", error);
            setRewardPosterData([]);
        }
    };


    return (
        <div className="h-screen w-full bg-orange-50/30 relative overflow-hidden">
            {/* 알림 팝업 */}
            {/* 알림 팝업 */}
{showNotification && notification && (
  <div className="fixed top-4 right-4 z-50 bg-white rounded-lg shadow-lg max-w-xs w-full p-4 flex flex-col transition-all duration-300 ease-in-out">
    <div className="flex justify-between items-start mb-2">
      <h4 className="font-bold text-orange-600 text-sm">
        {notification.type === 'COMMENT' 
          ? '댓글 알림' 
          : notification.status === 'FINDING' 
            ? '실종 신고' 
            : '목격 신고'}
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
        {notification.message || 
         (notification.content?.length > 50
          ? notification.content.substring(0, 50) + '...'
          : notification.content)}
      </p>
      {notification.commentContent && (
        <p className="text-xs text-gray-600 mt-1 italic">
          "{notification.commentContent.length > 40
            ? notification.commentContent.substring(0, 40) + '...'
            : notification.commentContent}"
        </p>
      )}
      <div className="flex items-center mt-2 text-xs text-gray-500">
        <span className="mr-2">
          {notification.type === 'COMMENT'
            ? `댓글 작성자: ${notification.commentAuthorNickname}`
            : `작성자: ${notification.nickname}`}
        </span>
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
                        onViewNotification={handleViewNotification}
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

export default Map;