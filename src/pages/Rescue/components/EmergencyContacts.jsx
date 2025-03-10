import React, { useState } from 'react';

export const EmergencyContacts = () => {
    const [showAllContacts, setShowAllContacts] = useState(false);

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

    return (
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
    );
};

export default EmergencyContacts;