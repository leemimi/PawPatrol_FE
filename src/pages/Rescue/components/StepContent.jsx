import React from 'react';
import { AlertCircle, Phone, ChevronUp, ChevronDown, MapPin, Bookmark, Info, CheckCircle } from 'lucide-react';
import { EmergencyContacts } from './EmergencyContacts';
import AnimalSelectionModal from '../../../components/AnimalSelectionModal';

export const StepContent = ({
    currentStep,
    goToStep,
    goToPrevStep,
    handleAnimalCondition,
    showEmergencyContacts,
    toggleEmergencyContacts,
    ChevronRight,
    showNearbyHospitals,
    onShowHospitalList,
    goToReportPage,
    goToTempCarePage,
    onClose,
    showAnimalTypeModal,
    setShowAnimalTypeModal,
    selectedAnimalType,
    setSelectedAnimalType,
    navigate
}) => {
    const hasRescueReportData = () => {
        const rescueReportDataStr = localStorage.getItem('rescueReportData');
        if (rescueReportDataStr) {
            try {
                const data = JSON.parse(rescueReportDataStr);
                return new Date().getTime() - data.timestamp < 3600000; // 1시간 이내
            } catch (e) {
                return false;
            }
        }
        return false;
    };


    switch (currentStep) {
        case 0: // 인트로
            return (
                <div className="space-y-4">
                    <p className="text-xl font-medium text-orange-800">유기동물을 발견하셨나요?</p>
                    <p className="text-base text-gray-700">아래 내용을 참고하여 상황에 맞게 조치해주세요.</p>

                    <div className="space-y-2 mt-4">
                        <button
                            className="flex items-center justify-between w-full p-3 bg-orange-100 rounded-lg text-left"
                            onClick={() => goToStep(1)}
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

                        {showEmergencyContacts && <EmergencyContacts />}
                    </div>
                </div>
            );

        case 1: // 동물 상태 체크
            return (
                <div className="space-y-4 pb-16">
                    <p className="text-xl font-medium text-orange-800">동물의 상태를 확인해주세요</p>
                    <p className="text-base text-gray-700">동물의 상태에 따라 적절한 조치 방법이 달라집니다.</p>

                    <div className="grid grid-cols-1 gap-3 mt-4">
                        <button
                            className="p-4 bg-red-100 rounded-lg text-left hover:bg-red-200 transition-colors"
                            onClick={() => handleAnimalCondition(true)}
                        >
                            <h3 className="text-lg font-bold text-red-700 mb-1">많이 다쳤어요</h3>
                            <p className="text-base text-gray-600">사고를 당했거나 응급 치료가 필요해 보입니다.</p>
                        </button>

                        <button
                            className="p-4 bg-orange-100 rounded-lg text-left hover:bg-orange-200 transition-colors"
                            onClick={() => handleAnimalCondition(false)}
                        >
                            <h3 className="text-lg font-bold text-orange-700 mb-1">경미하게 다쳤거나 건강해 보여요</h3>
                            <p className="text-base text-gray-600">특별한 응급 처치가 필요없어 보입니다.</p>
                        </button>
                    </div>
                </div>
            );

        case 2: // 긴급 대처 요령
            return (
                <div className="space-y-4 pb-16">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-medium text-orange-800">긴급동물 발견시 대처요령</h3>
                        {showNearbyHospitals && (
                            <button
                                className="px-3 py-1 bg-blue-500 text-white text-sm rounded-full"
                                onClick={onShowHospitalList}
                            >
                                근처 병원 보기
                            </button>
                        )}
                    </div>

                    <div className="p-3 bg-white rounded-lg border border-orange-200 space-y-3">
                        <p className="text-base font-medium text-red-600">차량 사고 등으로 인해 긴급 치료를 요할 시 동물을 인근 동물병원으로 옮기셔야합니다.</p>

                        <div className="p-2 bg-orange-50 rounded text-base">
                            <p className="font-medium text-orange-800 mb-1">먼저 읽어주세요!</p>
                            <p className="text-gray-700">긴급하게 치료 및 보호를 필요로 하는 동물을 발견했을 때엔 동물단체의 도움을 즉각적으로 받을 수 없습니다. 왜냐하면 동물 구조 및 보호조치는 119시스템처럼 바로 출동을 할 수 있는 여건이 안되어 있기 때문입니다.</p>
                        </div>

                        <div>
                            <h4 className="text-lg font-medium text-orange-700">동물이송</h4>
                            <p className="text-base text-gray-700">대부분의 목격자들이 동물 이송을 난감해 하는데 이는 그리 어려운 일이 아닙니다. 마음을 진정시키고 다음과 같이 침착하게 대처해 주십시오. 작은 동물일 경우 그대로 품에 안아서 택시를 이용하는 방법도 있으며, 조금 큰 동물은 주변의 상가나 주변인에게 도움을 요청, 종이 박스 같은 것에 담아서 이송하는 방법도 있습니다.</p>
                        </div>

                        <div>
                            <h4 className="text-lg font-medium text-orange-700">중대형의 개일 경우</h4>
                            <p className="text-base text-gray-700">통증 때문에 난폭한 행동을 할 수 있으므로 119에 도움을 요청하십시오. 지역에 따라 119가 출동하기를 난감해 하는 경우도 있습니다. 그럴 경우, 난폭한 개를 보통의 사람이 이송할 경우 인재로 이어지게 되면 어차피 119가 출동해야 한다는 것을 주지시키고, 사전 예방을 위한 조치라는 것을 잘 설득하셔서 도움을 받으십시오.</p>
                        </div>
                    </div>

                    <div className="mt-4">
                        <button
                            className="w-full p-4 bg-orange-500 text-white rounded-lg text-center hover:bg-orange-600 transition-colors"
                            onClick={() => goToStep(4)}
                        >
                            <span className="font-bold">다음 : 제보글 작성하기</span>
                        </button>
                    </div>
                </div>
            );

        case 3: // 구조 미룰 경우
            return (
                <div className="space-y-4">
                    <h3 className="text-xl font-medium text-orange-800">이런 동물은 구조를 미뤄보세요</h3>

                    <div className="p-3 bg-white rounded-lg border border-orange-200 space-y-3 max-h-96 overflow-y-auto">
                        <p className="text-base text-gray-700">육안으로 보아 건강상태가 비교적 양호한, 그러나 다소 초췌한 발바리들을 만날지라도 모두 구조의 대상으로 보지 말아주십시오.</p>

                        <div>
                            <p className="text-base text-gray-700">대다수의 발바리들은 주인의 관리로부터 자유롭게 키워지는 경우가 많아 행동 반경이 넓습니다. 인근지역 어딘가에 집이 있는 경우가 많으므로 떠돌이 개라고 추정될 경우엔 즉각적으로 잡는 것보다는 시간을 두고 지켜보는 것이 좋습니다.</p>
                        </div>

                        <div>
                            <h4 className="text-lg font-medium text-orange-700">어린 아기 고양이</h4>
                            <p className="text-base text-gray-700">엄마 고양이로부터 떨어진 아기 고양이를 섣불리 만지셔서는 안되며 데려오는 일도 신중하셔야 합니다. 엄마 고양이와 함께 이동 중에 떨어져 있을 수도 있기 때문입니다. 이럴 경우에는 시간을 두고 엄마 고양이가 찾으러 올 때까지 기다려야 합니다.</p>
                        </div>
                    </div>

                    <div className="mt-4">
                        <button
                            className="w-full p-4 bg-orange-500 text-white rounded-lg text-center hover:bg-orange-600 transition-colors"
                            onClick={() => goToStep(4)}
                        >
                            <span className="font-bold">다음 : 제보글 작성하기</span>
                        </button>
                    </div>
                </div>
            );

        case 4: // 제보글 작성
            return (
                <div className="space-y-4">
                    <h3 className="text-xl font-medium text-orange-800">제보글 작성하기</h3>
                    <p className="text-base text-gray-700">동물의 주인을 찾을 수 있도록 제보글을 작성해주세요.</p>

                    <div className="p-3 bg-white rounded-lg border border-orange-200">
                        <p className="text-base font-medium text-orange-700 mb-2">주인을 찾아보는 일은 꼭 해주셔야 합니다.</p>
                        <p className="text-base text-gray-700">구조자는 구조 동물에 대해 주인을 찾을 수 있도록 노력해 주시기 바랍니다. 동물이 버려진 것이 아니라 집을 나왔다가 길을 잃은 것이라면 주인이 애타게 찾고 있을 겁니다. 동물 입장에서도 입양보다는 주인을 찾는 것이 우선이며 더 좋은 일입니다.</p>
                    </div>

                    {hasRescueReportData() ? (
                        // 제보글 작성 완료한 경우
                        <div className="w-full p-4 bg-green-500 text-white rounded-lg flex items-center justify-center">
                            <CheckCircle size={18} className="mr-2" />
                            <span className="font-bold">제보글 작성 완료</span>
                        </div>
                    ) : (
                        // 제보글 작성하지 않은 경우
                        <button
                            className="w-full p-4 bg-orange-500 text-white rounded-lg flex items-center justify-center hover:bg-orange-600 transition-colors"
                            onClick={() => setShowAnimalTypeModal(true)}
                        >
                            <MapPin size={18} className="mr-2" />
                            <span className="font-bold">제보글 작성하러 가기</span>
                        </button>
                    )}

                    <div className="grid grid-cols-2 gap-3 mt-4">
                        <button
                            className="p-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex flex-col items-center justify-center"
                            onClick={() => goToStep(1)}
                        >
                            <span className="font-bold">이전</span>
                        </button>
                        <button
                            className="p-4 bg-orange-200 text-orange-700 rounded-lg hover:bg-orange-300 transition-colors flex flex-col items-center justify-center"
                            onClick={() => goToStep(5)}
                        >
                            <span className="font-bold">다음 : 임시보호 신청</span>
                        </button>
                    </div>

                    <AnimalSelectionModal
                        isOpen={showAnimalTypeModal}
                        onClose={() => setShowAnimalTypeModal(false)}
                        onSelect={setSelectedAnimalType}
                        selectedAnimalType={selectedAnimalType}
                        onConfirm={() => {
                            setShowAnimalTypeModal(false);

                            // 제보글 작성 페이지로 이동
                            navigate("/find-pet-report", {
                                state: {
                                    animalType: selectedAnimalType,
                                    returnPath: "/rescue",
                                    returnState: { returnToStep: 4 }
                                }
                            });
                        }}
                    />
                </div>
            );



        case 5: // 임시보호 신청

            // 제보글 데이터가 있는 경우 해당 데이터로 임시보호 신청 페이지로 이동
            const goToTempCareWithData = () => {
                const rescueReportDataStr = localStorage.getItem('rescueReportData');
                navigate('/register-animal', {
                    state: {
                        fromRescueReport: true,
                        rescueReportData: JSON.parse(rescueReportDataStr)
                    }
                });
            };

            // 제보글 데이터가 없는 경우 동물 선택 모달 표시
            const handleTempCareClick = () => {
                if (hasRescueReportData()) {
                    goToTempCareWithData();
                } else {
                    // 동물 선택 모달 표시
                    setShowAnimalTypeModal(true);
                }
            };

            return (
                <div className="space-y-4">
                    <h3 className="text-xl font-medium text-orange-800">임시보호 신청하기</h3>
                    <p className="text-base text-gray-700">동물을 임시로 보호할 수 있나요? 주인을 찾지 못한 경우 임시보호가 필요합니다.</p>

                    {hasRescueReportData() && (
                        <div className="p-3 bg-green-100 rounded-lg border border-green-200">
                            <p className="text-sm text-green-700 font-medium">
                                작성하신 제보글 정보가 임시보호 신청 시 자동으로 적용됩니다.
                            </p>
                        </div>
                    )}

                    <div className="p-3 bg-white rounded-lg border border-orange-200">
                        <p className="text-base text-gray-700">긴급한 동물은 가능한 구조자가 임시보호해 주시면서 동물단체를 통해 입양될 수 있도록 해주시기 바랍니다. 모든 동물 단체는 늘어만 가는 집 없는 동물로 인해 한계상황에 처해 있고, 누구에게나 임시보호는 힘에 겨운 일입니다.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            className="p-3 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors flex flex-col items-center"
                            onClick={handleTempCareClick}
                        >
                            <Bookmark size={18} className="mb-2" />
                            <span className="font-bold">임시보호 가능해요</span>
                            {hasRescueReportData() && (
                                <span className="text-xs mt-1">제보 정보 포함</span>
                            )}
                        </button>

                        <button
                            className="p-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex flex-col items-center"
                            onClick={onClose}
                        >
                            <Info size={18} className="mb-2" />
                            <span className="font-bold">다른 방법 찾아볼게요</span>
                        </button>
                    </div>

                    <button
                        className="w-full p-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors mt-4"
                        onClick={goToPrevStep}
                    >
                        <span className="font-bold">이전</span>
                    </button>

                    {/* 동물 선택 모달 추가 */}
                    <AnimalSelectionModal
                        isOpen={showAnimalTypeModal}
                        onClose={() => setShowAnimalTypeModal(false)}
                        onSelect={setSelectedAnimalType}
                        selectedAnimalType={selectedAnimalType}
                        onConfirm={() => {
                            setShowAnimalTypeModal(false);
                            navigate('/register-animal', {
                                state: {
                                    animalType: selectedAnimalType
                                }
                            });
                        }}
                    />
                </div>
            );

        default:
            return null;
    }
};

export default StepContent;