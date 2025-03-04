import React from 'react';
import { X, Check, Home, Clock } from 'lucide-react';

const ApplicationsModal = ({
    isOpen,
    onClose,
    applications,
    onApprove,
    onReject,
    title = "신청 목록"
}) => {
    // Protection type badge with improved design and matching background color
    const getProtectionTypeBadge = (type) => {
        if (type === 'ADOPTION') {
            return (
                <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 border border-blue-200 text-blue-900 rounded-full text-xs font-medium">
                    <Home size={12} />
                    <span>입양</span>
                </div>
            );
        } else {
            return (
                <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 border border-yellow-200 text-yellow-900 rounded-full text-xs font-medium">
                    <Clock size={12} />
                    <span>임시보호</span>
                </div>
            );
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
                    <button
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        onClick={onClose}
                    >
                        <X size={20} />
                    </button>
                </div>

                {applications && applications.length > 0 ? (
                    <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                        {applications.map((application, index) => (
                            <div key={index} className="bg-gray-50 border border-gray-100 p-4 rounded-lg shadow-sm hover:shadow-md transition-all">
                                <div className="flex justify-between items-center mb-3">
                                    <div className="flex items-center gap-2">
                                        {/* Protection type badge moved next to applicant name */}
                                        {getProtectionTypeBadge(application.protectionType)}
                                        <span className="font-medium text-gray-800">{application.applicantName}</span>
                                    </div>
                                    <span className="text-xs text-gray-500">
                                        {new Date(application.createdAt).toLocaleDateString()}
                                    </span>
                                </div>

                                <p className="text-sm text-gray-600 mb-3 bg-white p-2 rounded border border-gray-100">{application.reason}</p>

                                <div className="flex gap-2 mt-3 justify-end">
                                    <button
                                        className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 text-xs rounded-md hover:bg-gray-200 transition-colors font-medium"
                                        onClick={() => onReject(application.protectionId)}
                                    >
                                        <X size={14} />
                                        거절
                                    </button>
                                    <button
                                        className="flex items-center gap-1 px-3 py-1.5 bg-orange-500 text-white text-xs rounded-md hover:bg-blue-600 transition-colors font-medium"
                                        onClick={() => onApprove(application.protectionId)}
                                    >
                                        <Check size={14} />
                                        수락
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <p className="text-gray-500">신청 내역이 없습니다.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ApplicationsModal;