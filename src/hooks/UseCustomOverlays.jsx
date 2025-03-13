import { useState, useCallback, useRef } from 'react';

export const useCustomOverlays = ({ map, selectedRange, selectedPet, onSelectPet }) => {
    const [customOverlays, setCustomOverlays] = useState([]);
    const overlaysRef = useRef([]);

    const getStatusColor = useCallback((status) => {
        switch (status) {
            case 'FINDING':
                return '#FFA000'; // 황색
            case 'SIGHTED':
                return '#F44336'; // 적색
            case 'SHELTER':
                return '#4CAF50'; // 녹색
            case 'SHELTER_ANIMAL':
                return '#2196F3'; // 파란색
            default:
                return '#757575'; // 회색
        }
    }, []);

    const getStatusText = useCallback((status) => {
        switch (status) {
            case 'FINDING':
                return '찾는중';
            case 'SIGHTED':
                return '목격';
            case 'SHELTER':
                return '보호중';
            case 'SHELTER_ANIMAL':
                return '보호소';
            case 'FOSTERING':
                    return '임보중';
            default:
                return '상태 미정';
        }
    }, []);

    const cleanupExistingOverlays = useCallback(() => {
        overlaysRef.current.forEach(overlay => {
            if (overlay) overlay.setMap(null);
        });
        overlaysRef.current = [];
    }, []);

    const createCustomOverlays = useCallback((pets) => {
        if (!map) return;

        cleanupExistingOverlays();

        const newOverlays = pets.reduce((acc, pet) => {
            if (pet.distanceFromCenter > selectedRange) {
                return acc;
            }

            const item = pet;
            // Use item?.pet?.imageUrl if available, otherwise fall back to item?.image
            const imageUrl = item?.pet?.imageUrl || item?.image;

            const position = new window.kakao.maps.LatLng(pet.position.lat, pet.position.lng);
            const statusColor = getStatusColor(pet.status);
            const statusText = getStatusText(pet.status);

            const isSelected = selectedPet && selectedPet.id === pet.id;
            const markerSize = isSelected ? 50 : 45;
            const borderWidth = isSelected ? 4 : 3;
            const labelFontSize = isSelected ? '12px' : '10px';
            const labelPadding = isSelected ? '3px 8px' : '2px 6px';
            const labelMarginTop = isSelected ? '6px' : '4px';

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
            markerBorder.style.position = 'relative'; // Important for positioning the text

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

            const petImage = document.createElement('div');
            petImage.style.width = '100%';
            petImage.style.height = '100%';
            
            // Always set the background image to the determined image URL
            petImage.style.backgroundImage = `url(${imageUrl})`;
            petImage.style.backgroundSize = 'cover';
            petImage.style.backgroundPosition = 'center';
            petImage.style.borderRadius = '50%';
            
            // Image load error handling
            petImage.addEventListener('error', () => {
                petImage.style.backgroundImage = 'none';
                petImage.style.backgroundColor = '#F5F5F5';
                
                // If the image fails to load, show pet's info or a default text
                const petDisplayText = item?.pet?.breed || item?.pet?.name || item?.breed || item?.animalType || "동물";
                
                const textElement = document.createElement('div');
                textElement.textContent = petDisplayText;
                textElement.style.fontSize = '10px';
                textElement.style.fontWeight = 'bold';
                textElement.style.color = '#333';
                textElement.style.textAlign = 'center';
                textElement.style.width = '100%';
                textElement.style.position = 'absolute';
                textElement.style.top = '50%';
                textElement.style.left = '50%';
                textElement.style.transform = 'translate(-50%, -50%)';
                
                petImage.appendChild(textElement);
            });

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

            markerBorder.appendChild(petImage);
            container.appendChild(markerBorder);
            container.appendChild(statusLabel);

            const overlay = new window.kakao.maps.CustomOverlay({
                position: position,
                content: container,
                map: map,
                zIndex: isSelected ? 11 : 10
            });

            container.onclick = () => {
                onSelectPet(pet);
            };

            acc.push(overlay);
            return acc;
        }, []);

        overlaysRef.current = newOverlays;
        setCustomOverlays(newOverlays);
    }, [map, getStatusColor, getStatusText, selectedRange, selectedPet, onSelectPet, cleanupExistingOverlays]);

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
