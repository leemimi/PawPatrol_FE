import React from 'react';

// 외부에서도 사용할 수 있도록 함수 분리 및 export
export const getStatusText = (status, type = 'protection') => {
    // 보호 상태 표시인 경우
    if (type === 'protection') {
        switch (status) {
            case 'PROTECT_WAITING':
                return '신청가능';
            case 'TEMP_PROTECTING':
                return '임시 보호중';
            case 'SHELTER_PROTECTING':
                return '보호소 보호중';
            case 'MY_PET':
                return 'My Pet';
            default:
                return status;
        }
    }

    // 나의 신청 목록인 경우
    else if (type === 'application') {
        switch (status) {
            case 'PENDING':
                return '대기중';
            case 'APPROVED':
                return '승인됨';
            case 'REJECTED':
                return '거절됨';
            default:
                return status;
        }
    }
    return status;
};

const getStatusColor = (status, type) => {
    // 보호 상태인 경우
    if (type === 'protection') {
        switch (status) {
            case 'PROTECT_WAITING':
                return 'bg-yellow-400 text-white';
            case 'TEMP_PROTECTING':
                return 'bg-red-400 text-white';
            case 'SHELTER_PROTECTING':
                return 'bg-blue-600 text-white';
            case 'MY_PET':
                return 'bg-purple-400 text-white';
            default:
                return 'bg-gray-400 text-white';
        }
    }

    // 나의 신청 목록인 경우
    else if (type === 'application') {
        switch (status) {
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-700 border border-yellow-200';
            case 'APPROVED':
                return 'bg-green-100 text-green-700 border border-green-200';
            case 'REJECTED':
                return 'bg-red-100 text-red-700 border border-red-200';
            default:
                return 'bg-gray-100 text-gray-700 border border-gray-200';
        }
    }
    return 'bg-gray-400 text-white';
};

const StatusBadge = ({ status, type = 'protection' }) => {
    const text = getStatusText(status, type);
    const colorClass = getStatusColor(status, type);

    return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
            {text}
        </span>
    );
};

export default StatusBadge;