import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useKakaoMap } from '@/hooks/UseKakaoMap';
import { RadiusControl } from '../../components/RadiusControl';
import { ControlButtons } from '../../components/ControlButtons';
import { useGeolocation } from '../../hooks/UseGeolocation.jsx';
import { useFacilitiesData } from '../../hooks/UseFacilitiesData.jsx';
import { useFacilityOverlays } from '@/hooks/UseFacilityOverlays';
import { CommonCard } from '@/components/CommonCard';
import { CommonList } from '@/components/CommonList';
import { ChevronDown, ChevronUp, AlertCircle, X, Phone, Bookmark, MapPin, Info, Plus } from 'lucide-react';

const Rescue = () => {
    const navigate = useNavigate();
    const centerPosition = { lat: 37.497939, lng: 127.027587 };

    // 기본 상태들
    const [currentPosition, setCurrentPosition] = useState(centerPosition);
    const [selectedRange, setSelectedRange] = useState(3);
    const [isMarkerTransitioning, setIsMarkerTransitioning] = useState(false);
    const [showRescueGuide, setShowRescueGuide] = useState(true);
    const [currentStep, setCurrentStep] = useState(0);
    const [animalInjured, setAnimalInjured] = useState(null); // null: 선택 전, true: A많이 다침, false: 경미한 부상
    const [showNearbyHospitals, setShowNearbyHospitals] = useState(false);
    const [showEmergencyContacts, setShowEmergencyContacts] = useState(false);
    const [showAllContacts, setShowAllContacts] = useState(false);
    const [showHospitals, setShowHospitals] = useState(false);
    const [selectedFacility, setSelectedFacility] = useState(null);
    const [isCardVisible, setIsCardVisible] = useState(false);
    const [showList, setShowList] = useState(false);

    // 구조 단계 상태 정의
    const steps = [
        { id: 'intro', title: '유기동물 발견시 상황에 맞게 조치하세요' },
        { id: 'check-injured', title: '동물이 많이 다쳤나요?' },
        { id: 'emergency', title: '긴급 동물 발견시 대처요령' },
        { id: 'mild-case', title: '이런 동물은 구조를 미뤄보세요' },
        { id: 'report', title: '제보글 작성하기' },
        { id: 'temp-care', title: '임시보호 신청하기' }
    ];

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

    // 다음 단계로 이동하는 함수
    const goToNextStep = () => {
        setCurrentStep(prev => prev + 1);
    };

    // 이전 단계로 이동하는 함수
    const goToPrevStep = () => {
        setCurrentStep(prev => Math.max(0, prev - 1));
    };

    // 동물 상태 선택 핸들러
    const handleAnimalCondition = (isInjured) => {
        setAnimalInjured(isInjured);
        if (isInjured) {
            // 많이 다쳤을 경우 병원 표시
            setShowNearbyHospitals(true);
            fetchFacilities(currentPosition, selectedRange);
            setCurrentStep(2); // 긴급 대처요령으로 이동
        } else {
            // 경미한 경우
            setCurrentStep(3); // 구조 미루기 안내로 이동
        }
    };

    // 제보글 작성 페이지로 이동
    const goToReportPage = () => {
        navigate('/report-post');
    };

    // 임시보호 신청 페이지로 이동
    const goToTempCarePage = () => {
        navigate('/temp-care-application');
    };

    // 응급 연락처 표시 토글
    const toggleEmergencyContacts = () => {
        setShowEmergencyContacts(prev => !prev);
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

    // 병원 목록 보기 버튼 핸들러
    const handleShowHospitalList = () => {
        setSelectedFacility(null); // 선택된 병원 초기화
        setShowRescueGuide(false); // 가이드 닫기
        setShowList(true); // 리스트 표시
    };

    // 긴급 연락처 데이터
    const emergencyContactsData = [
        { region: '서울', location: '서울시 관악구 관악로 1', phone: '02-880-8659', organization: '서울대학교 수의과대학', type: '위탁' },
        { region: '경기', location: '경기도 평택시 진위면 동천길 132-93', phone: '031-8008-6212', organization: '경기도청 동물보호과', type: '직영' },
        { region: '인천', location: '인천시 연수구 송도동 13-20 (솔찬공원내)', phone: '032-858-9702', organization: '인천시 보건환경연구원', type: '직영' },
        { region: '강원', location: '강원도 춘천시 강원대학길 1', phone: '033-250-7504', organization: '강원대학교 수의과대학', type: '직영' },
        { region: '부산', location: '부산시 사하구 낙동남로 1240-2', phone: '051-209-2091', organization: '낙동강 에코센터', type: '직영' },
        { region: '대전', location: '대전시 유성구 궁동 대학로 99', phone: '042-821-7930', organization: '충남대학교 수의과대학', type: '위탁' },
        { region: '울산', location: '울산시 남구 옥동 506-3', phone: '052-256-5322', organization: '울산대공원', type: '직영' },
        { region: '충북', location: '충북 청주시 청원구 양청4길 45', phone: '043-216-3328', organization: '충북대학교 수의과대학', type: '위탁' },
        { region: '충남', location: '충남 예산군 예산읍 대학로 54', phone: '041-334-1666', organization: '공주대학교 산학협력단', type: '위탁' },
        { region: '전북', location: '전북 익산시 고봉로 79번지', phone: '063-850-0983', organization: '전북대학교 수의과대학', type: '위탁' },
        { region: '전남', location: '전남 순천시 순천만길 922-15', phone: '061-749-4800', organization: '순천시 환경보호과', type: '직영' },
        { region: '경북', location: '경북 안동시 도산면 퇴계로 2150-44', phone: '054-840-8250', organization: '경상북도 산림자원개발원', type: '직영' },
        { region: '경남', location: '경남 진주시 진주대로 501(가좌동 900)', phone: '055-754-9575', organization: '경상대학교 수의과대학', type: '위탁' },
        { region: '제주', location: '제주도 제주시 산천단남길 42', phone: '064-752-9982', organization: '제주대학 수의학과대학', type: '직영' },
        { region: '광주', location: '광주시 서구 유촌동 719-2일원', phone: '062-613-6651', organization: '광주시 보건환경연구원', type: '직영' }
    ];

    // ChevronRight 컴포넌트 (Lucide 패키지에 없어서 임시로 만듦)
    const ChevronRight = ({ size, className }) => (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
    );

    // 렌더링할 단계 내용 결정
    const renderStepContent = () => {
        switch (currentStep) {
            case 0: // 인트로
                return (
                    <div className="space-y-4">
                        <p className="text-lg font-medium text-orange-800">유기동물을 발견하셨나요?</p>
                        <p className="text-sm text-gray-700">아래 내용을 참고하여 상황에 맞게 조치해주세요.</p>

                        <div className="space-y-2 mt-4">
                            <button
                                className="flex items-center justify-between w-full p-3 bg-orange-100 rounded-lg text-left"
                                onClick={() => setCurrentStep(1)}
                            >
                                <div className="flex items-center">
                                    <AlertCircle size={18} className="text-orange-500 mr-2" />
                                    <span className="font-medium text-orange-700">동물이 많이 다쳤나요?</span>
                                </div>
                                <ChevronRight size={18} className="text-orange-500" />
                            </button>

                            <button
                                className="flex items-center justify-between w-full p-3 bg-orange-100 rounded-lg text-left"
                                onClick={toggleEmergencyContacts}
                            >
                                <div className="flex items-center">
                                    <Phone size={18} className="text-orange-500 mr-2" />
                                    <span className="font-medium text-orange-700">긴급 연락처 안내</span>
                                </div>
                                {showEmergencyContacts ? (
                                    <ChevronUp size={18} className="text-orange-500" />
                                ) : (
                                    <ChevronDown size={18} className="text-orange-500" />
                                )}
                            </button>

                            {showEmergencyContacts && (
                                <div className="p-3 bg-white rounded-lg border border-orange-200 text-sm">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-medium text-orange-700">야생동물 구조 관련 단체 및 기관</h4>
                                        <div className="text-xs text-gray-500">총 {emergencyContactsData.length}개 기관</div>
                                    </div>

                                    {/* 연락처 목록 컨테이너 */}
                                    <div className={`${showAllContacts ? 'max-h-64 overflow-y-auto pr-1 mb-2' : ''}`}>
                                        {/* 항상 보이는 연락처 (3개) */}
                                        {(showAllContacts ? emergencyContactsData : emergencyContactsData.slice(0, 3)).map((contact, index) => (
                                            <div key={index} className="py-2 border-b border-gray-100 last:border-b-0">
                                                <div className="flex justify-between items-center">
                                                    <span className="font-medium text-gray-800">{contact.region}</span>
                                                    <a href={`tel:${contact.phone.replace(/-/g, '')}`} className="text-blue-500 font-medium">
                                                        {contact.phone}
                                                    </a>
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1 flex justify-between">
                                                    <span className="truncate mr-2">{contact.organization}</span>
                                                    <span className="text-orange-500">{contact.type}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* 더보기/접기 버튼 */}
                                    <div className="text-center mt-2">
                                        <button
                                            onClick={() => setShowAllContacts(!showAllContacts)}
                                            className="text-orange-500 text-xs bg-orange-50 px-3 py-1 rounded-full hover:bg-orange-100 transition-colors"
                                        >
                                            {showAllContacts ? '접기 ▲' : '더보기 ▼'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                );

            case 1: // 동물 상태 체크
                return (
                    <div className="space-y-4 pb-16">
                        <p className="text-lg font-medium text-orange-800">동물의 상태를 확인해주세요</p>
                        <p className="text-sm text-gray-700">동물의 상태에 따라 적절한 조치 방법이 달라집니다.</p>

                        <div className="grid grid-cols-1 gap-3 mt-4">
                            <button
                                className="p-4 bg-red-100 rounded-lg text-left hover:bg-red-200 transition-colors"
                                onClick={() => handleAnimalCondition(true)}
                            >
                                <h3 className="font-bold text-red-700 mb-1">많이 다쳤어요</h3>
                                <p className="text-sm text-gray-600">사고를 당했거나 응급 치료가 필요해 보입니다.</p>
                            </button>

                            <button
                                className="p-4 bg-orange-100 rounded-lg text-left hover:bg-orange-200 transition-colors"
                                onClick={() => handleAnimalCondition(false)}
                            >
                                <h3 className="font-bold text-orange-700 mb-1">경미하게 다쳤거나 건강해 보여요</h3>
                                <p className="text-sm text-gray-600">특별한 응급 처치가 필요없어 보입니다.</p>
                            </button>
                        </div>
                    </div>
                );

            case 2: // 긴급 대처 요령
                return (
                    <div className="space-y-4 pb-16">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium text-orange-800">긴급동물 발견시 대처요령</h3>
                            {showNearbyHospitals && (
                                <button
                                    className="px-3 py-1 bg-blue-500 text-white text-sm rounded-full"
                                    onClick={handleShowHospitalList}
                                >
                                    근처 병원 보기
                                </button>
                            )}
                        </div>

                        <div className="p-3 bg-white rounded-lg border border-orange-200 space-y-3">
                            <p className="text-sm font-medium text-red-600">차량 사고 등으로 인해 긴급 치료를 요할 시 동물을 인근 동물병원으로 옮기셔야합니다.</p>

                            <div className="p-2 bg-orange-50 rounded text-sm">
                                <p className="font-medium text-orange-800 mb-1">먼저 읽어주세요!</p>
                                <p className="text-gray-700">긴급하게 치료 및 보호를 필요로 하는 동물을 발견했을 때엔 동물단체의 도움을 즉각적으로 받을 수 없습니다. 왜냐하면 동물 구조 및 보호조치는 119시스템처럼 바로 출동을 할 수 있는 여건이 안되어 있기 때문입니다.</p>
                            </div>

                            <div>
                                <h4 className="font-medium text-orange-700">동물이송</h4>
                                <p className="text-sm text-gray-700">대부분의 목격자들이 동물 이송을 난감해 하는데 이는 그리 어려운 일이 아닙니다. 마음을 진정시키고 다음과 같이 침착하게 대처해 주십시오. 작은 동물일 경우 그대로 품에 안아서 택시를 이용하는 방법도 있으며, 조금 큰 동물은 주변의 상가나 주변인에게 도움을 요청, 종이 박스 같은 것에 담아서 이송하는 방법도 있습니다.</p>
                            </div>

                            <div>
                                <h4 className="font-medium text-orange-700">중대형의 개일 경우</h4>
                                <p className="text-sm text-gray-700">통증 때문에 난폭한 행동을 할 수 있으므로 119에 도움을 요청하십시오. 지역에 따라 119가 출동하기를 난감해 하는 경우도 있습니다. 그럴 경우, 난폭한 개를 보통의 사람이 이송할 경우 인재로 이어지게 되면 어차피 119가 출동해야 한다는 것을 주지시키고, 사전 예방을 위한 조치라는 것을 잘 설득하셔서 도움을 받으십시오.</p>
                            </div>
                        </div>

                        <div className="flex justify-between mt-4">
                            <button
                                className="px-4 py-2 bg-orange-500 text-white rounded-lg"
                                onClick={() => setCurrentStep(4)}
                            >
                                다음: 제보글 작성하기
                            </button>
                        </div>
                    </div>
                );

            case 3: // 구조 미룰 경우
                return (
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-orange-800">이런 동물은 구조를 미뤄보세요</h3>

                        <div className="p-3 bg-white rounded-lg border border-orange-200 space-y-3 max-h-96 overflow-y-auto">
                            <p className="text-sm text-gray-700">육안으로 보아 건강상태가 비교적 양호한, 그러나 다소 초췌한 발바리들을 만날지라도 모두 구조의 대상으로 보지 말아주십시오.</p>

                            <div>
                                <p className="text-sm text-gray-700">대다수의 발바리들은 주인의 관리로부터 자유롭게 키워지는 경우가 많아 행동 반경이 넓습니다. 인근지역 어딘가에 집이 있는 경우가 많으므로 떠돌이 개라고 추정될 경우엔 즉각적으로 잡는 것보다는 시간을 두고 지켜보는 것이 좋습니다.</p>
                            </div>

                            <div>
                                <h4 className="font-medium text-orange-700">어린 아기 고양이</h4>
                                <p className="text-sm text-gray-700">엄마 고양이로부터 떨어진 아기 고양이를 섣불리 만지셔서는 안되며 데려오는 일도 신중하셔야 합니다. 엄마 고양이와 함께 이동 중에 떨어져 있을 수도 있기 때문입니다. 이럴 경우에는 시간을 두고 엄마 고양이가 찾으러 올 때까지 기다려야 합니다.</p>
                            </div>
                        </div>

                        <div className="flex justify-between">
                            <button
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg"
                                onClick={goToPrevStep}
                            >
                                이전
                            </button>
                            <button
                                className="px-4 py-2 bg-orange-500 text-white rounded-lg"
                                onClick={() => setCurrentStep(4)}
                            >
                                다음: 제보글 작성하기
                            </button>
                        </div>
                    </div>
                );

            case 4: // 제보글 작성
                return (
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-orange-800">제보글 작성하기</h3>
                        <p className="text-sm text-gray-700">동물의 주인을 찾을 수 있도록 제보글을 작성해주세요.</p>

                        <div className="p-3 bg-white rounded-lg border border-orange-200">
                            <p className="text-sm font-medium text-orange-700 mb-2">주인을 찾아보는 일은 꼭 해주셔야 합니다.</p>
                            <p className="text-sm text-gray-700">구조자는 구조 동물에 대해 주인을 찾을 수 있도록 노력해 주시기 바랍니다. 동물이 버려진 것이 아니라 집을 나왔다가 길을 잃은 것이라면 주인이 애타게 찾고 있을 겁니다. 동물 입장에서도 입양보다는 주인을 찾는 것이 우선이며 더 좋은 일입니다.</p>
                        </div>

                        <button
                            className="w-full p-3 bg-orange-500 text-white rounded-lg flex items-center justify-center"
                            onClick={goToReportPage}
                        >
                            <MapPin size={18} className="mr-2" />
                            제보글 작성하러 가기
                        </button>

                        <div className="flex justify-between">
                            <button
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg"
                                onClick={goToPrevStep}
                            >
                                이전
                            </button>
                            <button
                                className="px-4 py-2 bg-orange-500 text-white rounded-lg"
                                onClick={() => setCurrentStep(5)}
                            >
                                다음: 임시보호 신청
                            </button>
                        </div>
                    </div>
                );

            case 5: // 임시보호 신청
                return (
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-orange-800">임시보호 신청하기</h3>
                        <p className="text-sm text-gray-700">동물을 임시로 보호할 수 있나요? 주인을 찾지 못한 경우 임시보호가 필요합니다.</p>

                        <div className="p-3 bg-white rounded-lg border border-orange-200">
                            <p className="text-sm text-gray-700">긴급한 동물은 가능한 구조자가 임시보호해 주시면서 동물단체를 통해 입양될 수 있도록 해주시기 바랍니다. 모든 동물 단체는 늘어만 가는 집 없는 동물로 인해 한계상황에 처해 있고, 누구에게나 임시보호는 힘에 겨운 일입니다.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                className="p-3 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors"
                                onClick={goToTempCarePage}
                            >
                                <Bookmark size={18} className="mx-auto mb-2" />
                                <span className="text-sm font-medium">임시보호 가능해요</span>
                            </button>

                            <button
                                className="p-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                onClick={() => {
                                    // 메인으로 돌아가기
                                    setShowRescueGuide(false);
                                }}
                            >
                                <Info size={18} className="mx-auto mb-2" />
                                <span className="text-sm font-medium">다른 방법 찾아볼게요</span>
                            </button>
                        </div>

                        <button
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg mt-4"
                            onClick={goToPrevStep}
                        >
                            이전
                        </button>
                    </div>
                );

            default:
                return null;
        }
    };

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
                        <div className={`absolute bottom-16 left-0 right-0 max-h-[70vh] overflow-auto p-4 bg-white rounded-t-3xl shadow-lg border-t-2 border-orange-100 z-50 transition-all duration-300 ease-in-out ${
                            isCardVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
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
                        <div
                            className="absolute inset-x-0 bottom-0 bg-white rounded-t-3xl shadow-xl border-t-2 border-orange-100 z-50 transition-all duration-300"
                            style={{
                                height: '70%',  /* 화면의 70% 높이 차지 - 더 많은 공간 확보 */
                                maxHeight: 'calc(100vh - 80px)'  /* 상단 여백 더 줄임 */
                            }}
                        >
                            <div className="w-16 h-1 bg-gray-300 rounded-full mx-auto mt-2"></div>

                            <div className="flex justify-between items-center p-4 border-b border-orange-100 sticky top-0 bg-white z-10">
                                <div className="flex items-center">
                                    {currentStep > 0 && (
                                        <button
                                            onClick={goToPrevStep}
                                            className="mr-3 p-1 text-gray-500 hover:text-gray-700"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="24"
                                                height="24"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <polyline points="15 18 9 12 15 6"></polyline>
                                            </svg>
                                        </button>
                                    )}
                                    <h2 className="text-xl font-bold text-orange-800">
                                        {steps[currentStep].title}
                                    </h2>
                                </div>
                                <button
                                    onClick={() => setShowRescueGuide(false)}
                                    className="p-1 text-gray-400 hover:text-gray-600"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div
                                className="p-4 overflow-y-auto pb-20"
                                style={{ height: 'calc(100% - 70px)' }}
                            >
                                {renderStepContent()}
                            </div>
                        </div>
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