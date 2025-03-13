import React, { useEffect } from 'react';
import { Home, Clock } from 'lucide-react';

const ApplicationManagement = ({ pendingProtections, openModal }) => {
  useEffect(() => {
    // 페이지 로드 후 URL에 해시가 있으면 해당 요소로 스크롤
    if (window.location.hash) {
      const id = window.location.hash.substring(1); // '#' 제거
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 500); // 데이터 로드를 위한 지연 시간
      }
    }
  }, [pendingProtections]); // pendingProtections를 의존성으로 사용

  return (
    <div className="px-5 py-3 border-t border-gray-100">
      <div id="decision-section" className="flex justify-between items-center">
        <h2 className="text-sm font-medium text-gray-700">대기 중인 신청</h2>
        <button
          className="text-blue-500 text-xs font-medium"
          onClick={openModal}
        >
          모든 신청 보기
        </button>
      </div>
      <div className="mt-3 space-y-3">
        {/* First 2 applications preview */}
        {pendingProtections.slice(0, 2).map((application, index) => (
          <div
            key={index}
            className="border border-gray-100 p-3 rounded-lg shadow-sm bg-gray-50"
          >
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                {/* Protection type badge next to applicant name */}
                {application.protectionType === 'ADOPTION' ? (
                  <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 border border-blue-200 text-blue-900 rounded-full text-xs font-medium">
                    <Home size={12} />
                    <span>입양</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 border border-yellow-200 text-yellow-900 rounded-full text-xs font-medium">
                    <Clock size={12} />
                    <span>임시보호</span>
                  </div>
                )}
                <span className="font-medium text-gray-800">{application.applicantName}</span>
              </div>
              <span className="text-xs text-gray-500">
                {new Date(application.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
        {pendingProtections.length > 2 && (
          <div className="text-center text-xs text-gray-500">
            외 {pendingProtections.length - 2}건의 신청이 있습니다.
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationManagement;