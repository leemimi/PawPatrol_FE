import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

const HistorySection = ({ animalCaseDetail, isHistoryOpen, setIsHistoryOpen }) => {
    return (
        <div className="px-5 py-3 border-t border-gray-100">
            <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => setIsHistoryOpen(!isHistoryOpen)}
            >
                <h2 className="text-sm font-medium text-gray-700">보호 이력</h2>
                <button className="text-gray-500 hover:text-gray-700 transition-colors">
                    {isHistoryOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
            </div>

            {isHistoryOpen && (
                <div className="mt-3 space-y-2">
                    {animalCaseDetail.caseHistoryList.map((history, index) => (
                        <div
                            key={index}
                            className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                        >
                            <span className="text-gray-700 text-sm">{history.statusDescription}</span>
                            <span className="text-gray-500 text-xs">
                                {new Date(history.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default HistorySection;