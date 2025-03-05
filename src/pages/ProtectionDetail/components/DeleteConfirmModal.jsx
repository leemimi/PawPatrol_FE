import React from 'react';

const DeleteConfirmModal = ({ isOpen, isSubmitting, handleCancel, handleConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-5 w-full max-w-md">
                <h3 className="text-lg font-medium mb-4">삭제 확인</h3>
                <p className="mb-4 text-gray-700">
                    정말로 이 동물 정보를 삭제하시겠습니까?
                </p>
                <div className="flex justify-end gap-2">
                    <button
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium"
                        onClick={handleCancel}
                        disabled={isSubmitting}
                    >
                        취소
                    </button>
                    <button
                        className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium"
                        onClick={handleConfirm}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? '삭제 중...' : '삭제하기'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmModal;