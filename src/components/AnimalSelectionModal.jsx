import React from 'react';
import { X } from 'lucide-react';
import dogLogo from '../assets/images/dog.png';
import catLogo from '../assets/images/cat.png';

const AnimalSelectionModal = ({
  isOpen,
  onClose,
  onSelect,
  title = "어떤 동물을 제보하시나요?",
  description = "동물 유형을 선택해주세요",
  selectedAnimalType = null,
  onConfirm,
  confirmButtonText = "제보글 작성하기"
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-xl w-4/5 max-w-md overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => onSelect('DOG')}
              className={`flex flex-col items-center justify-center p-4 border rounded-lg transition-colors ${selectedAnimalType === 'DOG'
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 hover:bg-gray-50'
                }`}
            >
              <div className="mb-3">
                <img src={dogLogo} alt="DOG" className="w-24 h-24" />
              </div>
              <span className={`font-medium ${selectedAnimalType === 'DOG' ? 'text-orange-700' : 'text-gray-700'
                }`}>강아지</span>
            </button>

            <button
              onClick={() => onSelect('CAT')}
              className={`flex flex-col items-center justify-center p-4 border rounded-lg transition-colors ${selectedAnimalType === 'CAT'
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 hover:bg-gray-50'
                }`}
            >
              <div className="mb-3">
                <img src={catLogo} alt="CAT" className="w-24 h-24" />
              </div>
              <span className={`font-medium ${selectedAnimalType === 'CAT' ? 'text-orange-700' : 'text-gray-700'
                }`}>고양이</span>
            </button>
          </div>

          <div className="mt-6">
            <button
              onClick={onConfirm}
              disabled={!selectedAnimalType}
              className={`w-full py-3 rounded-lg flex items-center justify-center gap-2 ${selectedAnimalType
                  ? 'bg-orange-500 text-white hover:bg-orange-600'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
            >
              <span>{confirmButtonText}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimalSelectionModal;