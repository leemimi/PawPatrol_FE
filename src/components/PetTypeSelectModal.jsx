import dogLogo from '../assets/images/dog.png';
import catLogo from '../assets/images/cat.png';

const PetTypeSelectModal = ({ isOpen, onClose, onSelect }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg w-full max-w-md">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">반려동물 종류 선택</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="flex justify-center gap-4">
                    <button
                        onClick={() => onSelect('DOG')}
                        className="flex flex-col items-center p-6 border-2 rounded-lg hover:border-orange-500 transition-colors"
                    >
                        <img src={dogLogo} alt="강아지" className="w-24 h-24 mb-2" />
                        <span className="text-lg font-medium">강아지</span>
                    </button>
                    <button
                        onClick={() => onSelect('CAT')}
                        className="flex flex-col items-center p-6 border-2 rounded-lg hover:border-orange-500 transition-colors"
                    >
                        <img src={catLogo} alt="고양이" className="w-24 h-24 mb-2" />
                        <span className="text-lg font-medium">고양이</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PetTypeSelectModal;