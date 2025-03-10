import React, { useState, useEffect } from 'react';
import { X, AlertCircle, Phone, ChevronUp, ChevronDown, MapPin, Bookmark, Info } from 'lucide-react';
import { EmergencyContacts } from './EmergencyContacts';
import { StepContent } from './StepContent';
import { useLocation } from 'react-router-dom';

export const RescueGuide = ({
    onClose,
    navigate,
    onShowHospitalList,
    showNearbyHospitals,
    setShowNearbyHospitals,
    fetchFacilities,
    currentPosition,
    selectedRange
}) => {
    const location = useLocation();
    const [currentStep, setCurrentStep] = useState(0);
    const [animalInjured, setAnimalInjured] = useState(null);
    const [showEmergencyContacts, setShowEmergencyContacts] = useState(false);
    const [visitedSteps, setVisitedSteps] = useState([0]);
    const [showAnimalTypeModal, setShowAnimalTypeModal] = useState(false);
    const [selectedAnimalType, setSelectedAnimalType] = useState(null);

    // 구조 단계 상태 정의
    const steps = [
        { id: 'intro', title: '유기동물 발견시 상황에 맞게 조치하세요' },
        { id: 'check-injured', title: '동물이 많이 다쳤나요?' },
        { id: 'emergency', title: '긴급 동물 발견시 대처요령' },
        { id: 'mild-case', title: '이런 동물은 구조를 미뤄보세요' },
        { id: 'report', title: '제보글 작성하기' },
        { id: 'temp-care', title: '임시보호 신청하기' }
    ];

    // 단계 이동을 통합 관리하는 함수
    const goToStep = (step) => {
        setCurrentStep(step);
        setVisitedSteps(prev => [...prev, step]);
    };

    // 다음 단계로 이동하는 함수
    const goToNextStep = () => {
        const nextStep = currentStep + 1;
        goToStep(nextStep);
    };

    // 이전 단계로 이동하는 함수
    const goToPrevStep = () => {
        const currentIndex = visitedSteps.indexOf(currentStep);

        // 이전에 방문한 단계가 있으면 그 단계로 이동
        if (currentIndex > 0) {
            setCurrentStep(visitedSteps[currentIndex - 1]);
        } else {
            // 방문 기록이 없으면 기본적으로 한 단계 뒤로
            setCurrentStep(prev => Math.max(0, prev - 1));
        }
    };

    // 동물 상태 선택 핸들러
    const handleAnimalCondition = (isInjured) => {
        setAnimalInjured(isInjured);

        if (isInjured) {
            // 많이 다쳤을 경우 병원 표시
            setShowNearbyHospitals(true);
            fetchFacilities();
            goToStep(2); // 긴급 대처요령으로 이동
        } else {
            // 경미한 경우
            goToStep(3); // 구조 미루기 안내로 이동
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


    useEffect(() => {
        // returnToStep이 있으면 해당 단계로 이동
        if (location.state?.returnToStep !== undefined) {
            setCurrentStep(location.state.returnToStep);
            // 방문한 단계에도 추가 (필요한 경우)
            setVisitedSteps(prev => [...prev, location.state.returnToStep]);
        }
    }, [location.state]);

    return (
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
                    onClick={onClose}
                    className="p-1 text-gray-400 hover:text-gray-600"
                >
                    <X size={24} />
                </button>
            </div>

            <div
                className="p-4 overflow-y-auto pb-20"
                style={{ height: 'calc(100% - 70px)' }}
            >
                <StepContent
                    currentStep={currentStep}
                    goToStep={goToStep}
                    goToPrevStep={goToPrevStep}
                    handleAnimalCondition={handleAnimalCondition}
                    showEmergencyContacts={showEmergencyContacts}
                    toggleEmergencyContacts={toggleEmergencyContacts}
                    ChevronRight={ChevronRight}
                    showNearbyHospitals={showNearbyHospitals}
                    onShowHospitalList={onShowHospitalList}
                    goToReportPage={goToReportPage}
                    goToTempCarePage={goToTempCarePage}
                    onClose={onClose}
                    showAnimalTypeModal={showAnimalTypeModal}
                    setShowAnimalTypeModal={setShowAnimalTypeModal}
                    selectedAnimalType={selectedAnimalType}
                    setSelectedAnimalType={setSelectedAnimalType}
                    navigate={navigate}
                />
            </div>
        </div>
    );
};

export default RescueGuide;