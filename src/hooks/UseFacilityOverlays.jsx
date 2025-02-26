import { useState, useCallback, useRef, useEffect } from 'react';

export const useFacilityOverlays = ({ map, selectedFacility, onSelectFacility }) => {
    const [facilityOverlays, setFacilityOverlays] = useState([]);
    // Use a ref to access current overlays without causing dependency cycles
    const overlaysRef = useRef([]);
    // 현재 줌 레벨 상태 추가
    const [zoomLevel, setZoomLevel] = useState(map ? map.getLevel() : 3);
    
    // 지도 줌 이벤트 리스너 추가
    useEffect(() => {
        if (!map) return;
        
        // 초기 줌 레벨 설정
        setZoomLevel(map.getLevel());
        
        // 줌 변경 이벤트 리스너
        const zoomChangeHandler = () => {
            const newLevel = map.getLevel();
            setZoomLevel(newLevel);
            
            // 줌 레벨 변경 시 오버레이 다시 그리기
            if (overlaysRef.current.length > 0) {
                createFacilityCustomOverlays(overlaysRef.current.map(o => o.facility));
            }
        };
        
        // 이벤트 리스너 등록
        window.kakao.maps.event.addListener(map, 'zoom_changed', zoomChangeHandler);
        
        // 클린업 함수
        return () => {
            window.kakao.maps.event.removeListener(map, 'zoom_changed', zoomChangeHandler);
        };
    }, [map]);
    
    // 시설 오버레이 생성 함수 (반경 계산 제거)
    const createFacilityCustomOverlays = useCallback((facilities) => {
        if (!map) return [];

        // 기존 오버레이 제거 - use ref instead of state to avoid dependency cycle
        const clearOverlays = () => {
            overlaysRef.current.forEach(overlay => {
                if (overlay) overlay.setMap(null);
            });
        };
        
        clearOverlays();
        const newOverlays = [];
        
        // 줌 레벨에 따른 크기 계산
        // 줌 레벨이 클수록(멀수록) 작게, 작을수록(가까울수록) 크게
        const currentZoom = map.getLevel();
        // 기본 크기 설정 (중간 줌 레벨 3 기준)
        const baseSize = 14;
        const baseFontSize = 13;
        const basePadding = 5;
        
        // 줌 레벨에 따른 크기 조정 (1~7 레벨 기준)
        const sizeMultiplier = Math.max(0.7, 1.2 - (currentZoom * 0.1)); // 레벨이 커질수록 작아짐
        
        // 아이콘 크기와 글꼴 크기 계산
        const iconSize = Math.max(10, Math.round(baseSize * sizeMultiplier));
        const fontSize = Math.max(9, Math.round(baseFontSize * sizeMultiplier));
        const padding = Math.max(3, Math.round(basePadding * sizeMultiplier));
        
        facilities.forEach(facility => {
            const facilityPosition = new window.kakao.maps.LatLng(
                facility.position.lat, 
                facility.position.lng
            );
            
            const markerPosition = facilityPosition;
            const facilityId = facility.id || `facility-${Math.random().toString(36).substr(2, 9)}`;
            
            // ID 비교 로직 강화 - 문자열로 변환하여 비교
            const selectedId = selectedFacility ? String(selectedFacility.id) : '';
            const currentId = String(facilityId);
            const isSelected = selectedFacility && selectedId === currentId;
            
            // 선택된 시설만 강조 표시, 나머지는 기본 스타일
            const bgColor = isSelected ? '#FF7E22' : '#FFFFFF';
            const textColor = isSelected ? '#FFFFFF' : '#333333';
            const boxShadow = isSelected ? '0 3px 8px rgba(0,0,0,0.3)' : '0 2px 6px rgba(0,0,0,0.1)';
            const borderWidth = isSelected ? '3px' : '1px';
            const borderColor = isSelected ? '#FFFFFF' : '#CCCCCC';
            const zIndex = isSelected ? 4 : 3;
            const pinStrokeColor = isSelected ? '#FFFFFF' : '#666666';
            const pinFillColor = isSelected ? '#FF7E22' : 'none';
            
            const content = `
                <div class="custom-overlay facility-marker" data-id="${facilityId}" style="cursor: pointer;">
                    <div class="marker-content" style="
                        padding: ${padding}px ${padding * 2}px;
                        border-radius: 20px;
                        background-color: ${bgColor};
                        color: ${textColor};
                        font-size: ${fontSize}px;
                        font-weight: 600;
                        box-shadow: ${boxShadow};
                        white-space: nowrap;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border: ${borderWidth} solid ${borderColor};
                        transform: translateY(-5px);
                    ">
                        <svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="${pinFillColor}" stroke="${pinStrokeColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 5px;">
                            <path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 7 8 11.7z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        ${facility.name}
                    </div>
                </div>
            `;

            const customOverlay = new window.kakao.maps.CustomOverlay({
                position: markerPosition,
                content: content,
                xAnchor: 0.5,
                yAnchor: 1,
                zIndex: zIndex
            });

            // 오버레이에 facility 객체 참조 저장
            customOverlay.facility = facility;
            
            customOverlay.setMap(map);
            newOverlays.push(customOverlay);

            // DOM이 생성된 후 이벤트 리스너 추가
            setTimeout(() => {
                const marker = document.querySelector(`.facility-marker[data-id="${facilityId}"]`);
                if (marker) {
                    marker.addEventListener('click', () => {
                        onSelectFacility(facility);
                    });
                }
            }, 100);
        });
        
        // 새 오버레이 상태 업데이트
        overlaysRef.current = newOverlays;
        setFacilityOverlays(newOverlays);
        return newOverlays;
        
    }, [map, selectedFacility, onSelectFacility, zoomLevel]); // zoomLevel 의존성 추가
    
    // 모든 시설 오버레이 삭제
    const cleanupFacilityOverlays = useCallback(() => {
        // Use ref instead of state to avoid dependency cycle
        overlaysRef.current.forEach(overlay => {
            if (overlay) overlay.setMap(null);
        });
        overlaysRef.current = [];
        setFacilityOverlays([]);
    }, []);

    return {
        facilityOverlays,
        createFacilityCustomOverlays,
        cleanupFacilityOverlays,
        zoomLevel
    };
};