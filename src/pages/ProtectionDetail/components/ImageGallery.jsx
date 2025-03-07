import React from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const ImageGallery = ({ images, currentIndex, setCurrentIndex, closeGallery }) => {
    const nextImage = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === images.length - 1 ? 0 : prevIndex + 1
        );
    };

    const prevImage = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === 0 ? images.length - 1 : prevIndex - 1
        );
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
            <button
                className="absolute top-4 right-4 text-white p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 transition-colors"
                onClick={closeGallery}
            >
                <X size={24} />
            </button>

            <button
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 transition-colors"
                onClick={prevImage}
            >
                <ChevronLeft size={32} />
            </button>

            <div className="w-full max-w-3xl max-h-[80vh] flex items-center justify-center">
                <img
                    src={images[currentIndex].path}
                    alt={`동물 사진 ${currentIndex + 1}`}
                    className="max-w-full max-h-[80vh] object-contain"
                />
            </div>

            <button
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 transition-colors"
                onClick={nextImage}
            >
                <ChevronRight size={32} />
            </button>

            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                {images.map((_, index) => (
                    <button
                        key={index}
                        className={`w-3 h-3 rounded-full transition-all ${index === currentIndex
                                ? 'bg-white scale-125'
                                : 'bg-white bg-opacity-60 hover:bg-opacity-100'
                            }`}
                        onClick={() => setCurrentIndex(index)}
                    />
                ))}
            </div>
        </div>
    );
};

export default ImageGallery;