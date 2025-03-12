import { useState, useEffect, useRef } from 'react';

export const useKakaoMap = (initialPosition) => {
    const [mapInstance, setMapInstance] = useState(null);
    const markersRef = useRef([]);
    const circleRef = useRef(null);
    const mapRef = useRef(null);
    const centerMarkerRef = useRef(null); // 현재 위치 마커를 위한 ref 추가

    // 지도 초기화
    useEffect(() => {
        console.log("useKakaoMap effect triggered with position:", initialPosition);

        const loadMap = () => {
            if (!window.kakao || !window.kakao.maps) {
                setTimeout(loadMap, 1000);
                return;
            }

            if (!mapRef.current) {
                const container = document.getElementById("map");
                if (!container) {
                    console.error("Map container not found");
                    return;
                }

                const options = {
                    center: new window.kakao.maps.LatLng(
                        initialPosition.lat,
                        initialPosition.lng
                    ),
                    level: 5
                };

                const newMap = new window.kakao.maps.Map(container, options);
                mapRef.current = newMap;
                setMapInstance(newMap);

                // 원 생성
                const circle = new window.kakao.maps.Circle({
                    center: new window.kakao.maps.LatLng(
                        initialPosition.lat,
                        initialPosition.lng
                    ),
                    radius: 3000,
                    strokeWeight: 3,
                    strokeColor: '#FB923C',
                    strokeOpacity: 1,
                    strokeStyle: 'dashed',
                    fillColor: '#FB923C',
                    fillOpacity: 0.15,
                });

                circle.setMap(newMap);
                circleRef.current = circle;

                // 현재 위치 마커 생성
                createCenterMarker(newMap, initialPosition);
            } else {
                console.log("Updating existing map with position:", initialPosition);
                const moveLatLon = new window.kakao.maps.LatLng(
                    initialPosition.lat,
                    initialPosition.lng
                );
                mapRef.current.setCenter(moveLatLon);

                if (circleRef.current) {
                    circleRef.current.setPosition(moveLatLon);
                }

                // 위치가 변경되면 마커 위치도 업데이트
                updateCenterMarker(initialPosition);
            }
        };

        loadMap();

        // 클린업 함수
        return () => {
            if (circleRef.current) {
                circleRef.current.setMap(null);
            }
            if (centerMarkerRef.current) {
                centerMarkerRef.current.setMap(null);
            }
            markersRef.current.forEach(marker => marker.setMap(null));
        };
    }, [initialPosition.lat, initialPosition.lng]);

    // 현재 위치 마커 생성 함수 (매번 새로 생성)
    const createCenterMarker = (map, position) => {
        console.log("Creating center marker at position:", position);

        // 기존 마커가 있으면 명시적으로 제거
        if (centerMarkerRef.current) {
            centerMarkerRef.current.setMap(null);
            centerMarkerRef.current = null;
        }

        // 현재 위치 마커 생성
        const markerPosition = new window.kakao.maps.LatLng(position.lat, position.lng);

        // 커스텀 오버레이로 현재 위치 표시
        const centerMarker = new window.kakao.maps.CustomOverlay({
            position: markerPosition,
            content: '<div style="position:relative; width:16px; height:16px; background-color:#FB923C; border:2px solid white; border-radius:50%; box-shadow: 0 0 5px rgba(0,0,0,0.3); z-index:100;"></div>',
            yAnchor: 0.5,
            xAnchor: 0.5,
            zIndex: 10
        });

        // 맵에 마커 추가
        centerMarker.setMap(map);
        centerMarkerRef.current = centerMarker;
    };

    // 현재 위치 마커 업데이트 함수
    const updateCenterMarker = (position) => {
        console.log("updateCenterMarker called with position:", position);

        if (!position || !position.lat || !position.lng) {
            console.error("Invalid position for marker update:", position);
            return;
        }

        if (mapRef.current) {
            // 위치가 변경되었을 때 새 마커를 생성하는 방식으로 변경
            // (기존 마커 위치 업데이트 대신)
            createCenterMarker(mapRef.current, position);
        } else {
            console.error("Map reference not available for marker update");
        }
    };

    const setMarkers = (newMarkers) => {
        // 기존 마커 제거
        markersRef.current.forEach(marker => marker.setMap(null));
        // 새 마커 설정
        markersRef.current = newMarkers;
        // 지도에 마커 표시
        newMarkers.forEach(marker => marker.setMap(mapRef.current));
    };

    return {
        map: mapInstance,
        setMarkers,
        circleRef,
        getMarkers: () => markersRef.current,
        updateCenterMarker,
    };
};