import React, { useEffect } from 'react';

const PetEditModal = ({ isOpen, onClose, onSubmit, petFormData, setPetFormData, pet }) => {

    if (!isOpen) return null;

    // pet이 없는 경우에 대한 처리
    if (!pet) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-8 rounded-lg">
                    <p>반려동물 정보를 불러올 수 없습니다.</p>
                    <button
                        onClick={onClose}
                        className="mt-4 px-4 py-2 bg-orange-500 text-white rounded"
                    >
                        닫기
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg w-full max-w-2xl">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">반려동물 정보 수정</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        {/* 숨겨진 ID 필드 추가 */}
                        <input
                            type="hidden"
                            name="id"
                            value={pet.id}
                        />
                        {/* 이름과 품종은 수정 불가능하므로 읽기 전용으로 표시 */}
                        <div className="px-3 py-2 border rounded bg-gray-100">
                            <span className="text-gray-600">이름: {pet.name}</span>
                        </div>
                        <div className="px-3 py-2 border rounded bg-gray-100">
                            <span className="text-gray-600">품종: {pet.breed}</span>
                        </div>

                        {/* 성별도 수정 불가능 */}
                        <div className="px-3 py-2 border rounded bg-gray-100">
                            <span className="text-gray-600">성별: {pet.gender === 'M' ? '남자' : '여자'}</span>
                        </div>
                        {/* 수정 가능한 필드들 */}
                        <select
                            className="px-3 py-2 border rounded"
                            value={petFormData.size}
                            onChange={e => setPetFormData({ ...petFormData, size: e.target.value })}
                            required
                        >
                            <option value="SMALL">소형</option>
                            <option value="MEDIUM">중형</option>
                            <option value="LARGE">대형</option>
                        </select>
                        <input
                            type="text"
                            placeholder="나이"
                            className="px-3 py-2 border rounded"
                            value={petFormData.estimatedAge}
                            onChange={e => setPetFormData({ ...petFormData, estimatedAge: e.target.value })}
                            required
                        />
                        <input
                            type="text"
                            placeholder="동물등록번호"
                            className="px-3 py-2 border rounded"
                            value={petFormData.registrationNo}
                            onChange={e => setPetFormData({ ...petFormData, registrationNo: e.target.value })}
                            required
                        />
                        <input
                            type="text"
                            placeholder="건강상태"
                            className="px-3 py-2 border rounded"
                            value={petFormData.healthCondition}
                            onChange={e => setPetFormData({ ...petFormData, healthCondition: e.target.value })}
                            required
                        />
                    </div>
                    <textarea
                        placeholder="특징"
                        className="w-full px-3 py-2 border rounded"
                        value={petFormData.feature}
                        onChange={e => setPetFormData({ ...petFormData, feature: e.target.value })}
                        required
                    />
                    <div className="space-y-2">
                        <span className="block text-sm text-gray-600">
                            반려동물 사진 (변경하지 않으려면 비워두세요)
                        </span>
                        <div className="relative">
                            <input
                                type="file"
                                id="pet-image-edit"
                                accept="image/*"
                                className="hidden"
                                onChange={e => setPetFormData({ ...petFormData, image: e.target.files[0] })}
                            />
                            <label
                                htmlFor="pet-image-edit"
                                className="flex items-center justify-center px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                            >
                                <svg
                                    className="w-5 h-5 mr-2 text-gray-500"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                </svg>
                                <span className="text-sm text-gray-600">사진 변경하기</span>
                            </label>
                            {petFormData.image && (
                                <span className="block mt-2 text-sm text-gray-500">
                                    선택된 파일: {petFormData.image.name}
                                </span>
                            )}
                            {!petFormData.image && pet?.imageUrl && (
                                <div className="mt-2">
                                    <p className="text-sm text-gray-500">현재 이미지:</p>
                                    <img
                                        src={pet.imageUrl}
                                        alt={pet.name}
                                        className="mt-1 w-20 h-20 object-cover rounded"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end space-x-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">
                            취소
                        </button>
                        <button type="submit" className="px-4 py-2 bg-orange-500 text-white rounded">
                            수정하기
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PetEditModal;
