import React from 'react';
import { Home, Clock } from 'lucide-react';

const ApplyModal = ({
    isOpen,
    applicationType,
    applyReason,
    setApplyReason,
    isSubmitting,
    handleCancel,
    handleSubmit
}) => {
    if (!isOpen) return null;

    const getProtectionTypeBadge = (type) => {
        if (type === 'adoption') {
            return (
                <div className="flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-600 rounded-full text-xs">
                    <Home size={12} />
                    <span>입양</span>
                </div>
            );
        } else {
            return (
                <div className="flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-600 rounded-full text-xs">
                    <Clock size={12} />
                    <span>임시보호</span>
                </div>
            );
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-5 w-full max-w-md">
                <h3 className="text-lg font-medium mb-1">
                    {applicationType === 'adoption' ? '입양 신청하기' : '임시보호 신청하기'}
                </h3>

                {/* Application type badge */}
                <div className="mb-4">
                    {getProtectionTypeBadge(applicationType)}
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                        신청 사유
                    </label>
                    <textarea
                        className="w-full border border-gray-300 rounded-lg p-3 text-sm resize-none h-32"
                        placeholder="신청 사유를 입력해주세요"
                        value={applyReason}
                        onChange={(e) => setApplyReason(e.target.value)}
                        disabled={isSubmitting}
                    />
                </div>
                <div className="flex justify-end gap-2">
                    <button
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium"
                        onClick={handleCancel}
                        disabled={isSubmitting}
                    >
                        취소
                    </button>
                    <button
                        className={`px-4 py-2 text-white rounded-lg text-sm font-medium
                            ${applicationType === 'adoption'
                                ? 'bg-indigo-500 hover:bg-indigo-600'
                                : 'bg-amber-500 hover:bg-amber-600'}`}
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? '제출 중...' : '신청하기'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ApplyModal;