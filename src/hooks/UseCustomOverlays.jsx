import { useState, useCallback, useMemo, useRef } from 'react';

export const useCustomOverlays = ({ map, selectedRange, selectedPet, onSelectPet }) => {
    const [customOverlays, setCustomOverlays] = useState([]);
    // 현재 오버레이를 ref로 관리하여 의존성 배열에서 제거
    const overlaysRef = useRef([]);

    // Memoize color and status helper functions
    const getStatusColor = useCallback((status) => {
        switch(status) {
            case 'FINDING':
                return '#FFA000'; // 황색
            case 'SIGHTED':
                return '#F44336'; // 적색
            case 'SHELTER':
                return '#4CAF50'; // 녹색
            default:
                return '#757575'; // 회색
        }
    }, []);
    
    const getStatusText = useCallback((status) => {
        switch(status) {
            case 'FINDING':
                return '찾는중';
            case 'SIGHTED':
                return '목격';
            case 'SHELTER':
                return '보호중';
            default:
                return '상태 미정';
        }
    }, []);

    // 오버레이 정리 함수를 별도로 분리
    const cleanupExistingOverlays = useCallback(() => {
        overlaysRef.current.forEach(overlay => {
            if (overlay) overlay.setMap(null);
        });
        overlaysRef.current = [];
    }, []);

    // Memoize overlay creation to prevent unnecessary re-renders
    const createCustomOverlays = useCallback((pets) => {
        if (!map) return;
    
        // 기존 오버레이 제거
        cleanupExistingOverlays();
    
        // 새 오버레이 생성
        const newOverlays = pets.reduce((acc, pet) => {
            // 범위 체크 - 현재 선택된 범위 내에 있는 마커만 생성
            if (pet.distanceFromCenter > selectedRange) {
                return acc;
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
            container.style.transform = 'translate(-50%, -50%)';
            container.style.display = 'flex';
            container.style.flexDirection = 'column';
            container.style.alignItems = 'center';
            container.style.cursor = 'pointer';
            container.style.width = 'auto';
            container.style.zIndex = isSelected ? '11' : '10';
            
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
                glowEffect.style.border = `2px solid ${statusColor}80`;
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
                onSelectPet(pet);
            };
            
            acc.push(overlay);
            return acc;
        }, []);
        
        // ref와 state 모두 업데이트
        overlaysRef.current = newOverlays;
        setCustomOverlays(newOverlays);
    }, [map, getStatusColor, getStatusText, selectedRange, selectedPet, onSelectPet, cleanupExistingOverlays]);

    // Cleanup function
    const cleanupOverlays = useCallback(() => {
        cleanupExistingOverlays();
        setCustomOverlays([]);
    }, []);

    return {
        customOverlays,
        createCustomOverlays,
        cleanupOverlays
    };
};