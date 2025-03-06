import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DaumPostcode from 'react-daum-postcode';

// 보호소 검색 모달 컴포넌트
const ShelterSearchModal = ({ isOpen, onClose, onSelectShelter }) => {
    const [openPostcode, setOpenPostcode] = useState(false);

    // 신규 보호소 등록 폼 데이터
    const [newShelter, setNewShelter] = useState({
        name: '',
        phone: '',
        address: '',
        detailAddress: ''
    });

    // 주소 선택 이벤트
    const handleAddressComplete = (data) => {
        let selectedAddress = '';
        if (data.sido) selectedAddress += data.sido + ' ';
        if (data.sigungu) selectedAddress += data.sigungu + ' ';
        if (data.bname) selectedAddress += data.bname;

        setNewShelter(prev => ({
            ...prev,
            address: selectedAddress
        }));
        setOpenPostcode(false);
    };

    // 신규 보호소 정보 입력 핸들러
    const handleNewShelterChange = (e) => {
        const { name, value } = e.target;
        setNewShelter(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // 신규 보호소 등록 제출
    const handleSubmitNewShelter = () => {
        // 필수 필드 검증
        if (!newShelter.name || !newShelter.phone || !newShelter.address || !newShelter.detailAddress) {
            alert('모든 필드를 입력해주세요.');
            return;
        }

        // 신규 보호소 정보 전달
        const fullAddress = `${newShelter.address} ${newShelter.detailAddress}`.trim();
        onSelectShelter({
            name: newShelter.name,
            phone: newShelter.phone,
            address: fullAddress
        });
        onClose();
    };

    // 모달이 닫힐 때 상태 초기화
    useEffect(() => {
        if (!isOpen) {
            setNewShelter({
                name: '',
                phone: '',
                address: '',
                detailAddress: ''
            });
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-auto">
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200">
                    <h2 className="text-xl font-semibold">신규 보호소 등록</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">보호소 이름</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={newShelter.name}
                            onChange={handleNewShelterChange}
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-orange-500"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">전화번호</label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={newShelter.phone}
                            onChange={handleNewShelterChange}
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-orange-500"
                            placeholder="예: 02-1234-5678"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700">주소</label>
                        <div className="relative">
                            <input
                                type="text"
                                id="address"
                                name="address"
                                value={newShelter.address}
                                readOnly
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-orange-500"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setOpenPostcode(true)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 px-3 py-1 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600"
                            >
                                검색
                            </button>
                        </div>
                        {openPostcode && (
                            <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                                <div className="bg-white rounded-lg p-4 w-full max-w-md relative">
                                    <button
                                        onClick={() => setOpenPostcode(false)}
                                        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                                    >
                                        ✕
                                    </button>
                                    <DaumPostcode
                                        onComplete={handleAddressComplete}
                                        style={{ height: '400px' }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="detailAddress" className="block text-sm font-medium text-gray-700">상세 주소</label>
                        <input
                            type="text"
                            id="detailAddress"
                            name="detailAddress"
                            value={newShelter.detailAddress}
                            onChange={handleNewShelterChange}
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-orange-500"
                            placeholder="상세 주소를 입력하세요"
                            required
                        />
                    </div>

                    <div className="flex gap-2 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600"
                        >
                            취소
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmitNewShelter}
                            className="flex-1 px-4 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600"
                        >
                            등록하기
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShelterSearchModal;