import { useState, useEffect, useRef } from 'react';

export const useKakaoMap = (initialPosition) => {
    const [mapInstance, setMapInstance] = useState(null);
    const markersRef = useRef([]);
    const circleRef = useRef(null);
    const mapRef = useRef(null);

    // 지도 초기화
    useEffect(() => {
        const loadMap = () => {
            if (!window.kakao || !window.kakao.maps) {
                setTimeout(loadMap, 1000);
                return;
            }

            if (!mapRef.current) {
                const container = document.getElementById("map");
                const options = {
                    center: new window.kakao.maps.LatLng(
                        initialPosition.lat,
                        initialPosition.lng
                    ),
                    level: 3
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
                    radius: 30000,
                    strokeWeight: 3,
                    strokeColor: '#FB923C',
                    strokeOpacity: 1,
                    strokeStyle: 'dashed',
                    fillColor: '#FB923C',
                    fillOpacity: 0.15,
                });

                circle.setMap(newMap);
                circleRef.current = circle;
            } else {
                const moveLatLon = new window.kakao.maps.LatLng(
                    initialPosition.lat,
                    initialPosition.lng
                );
                mapRef.current.setCenter(moveLatLon);
            }
        };

        loadMap();

        return () => {
            if (circleRef.current) {
                circleRef.current.setMap(null);
            }
            markersRef.current.forEach(marker => marker.setMap(null));
        };
    }, [initialPosition.lat, initialPosition.lng]);

    const setMarkers = (newMarkers) => {
        // 기존 마커 제거
        markersRef.current.forEach(marker => marker.setMap(null));
        // 새 마커 설정
        markersRef.current = newMarkers;
        // 지도에 마커 표시
        newMarkers.forEach(marker => marker.setMap(mapRef.current));
    };


    return {
        map: mapInstance,  // mapRef.current 대신 mapInstance 반환
        setMarkers,
        circleRef,
        getMarkers: () => markersRef.current,
    };
};