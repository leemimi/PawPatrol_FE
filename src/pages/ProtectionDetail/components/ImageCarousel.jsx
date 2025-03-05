import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ImageCarousel = ({
    images,
    imageUrl,
    currentImageIndex,
    setCurrentImageIndex,
    openGallery
}) => {
    const nextImage = () => {
        if (images && images.length) {
            setCurrentImageIndex((prevIndex) =>
                prevIndex === images.length - 1 ? 0 : prevIndex + 1
            );
        }
    };

    const prevImage = () => {
        if (images && images.length) {
            setCurrentImageIndex((prevIndex) =>
                prevIndex === 0 ? images.length - 1 : prevIndex - 1
            );
        }
    };

    return (
        <div className="relative">
            <div className="h-80 overflow-hidden relative">
                {images && images.length > 0 ? (
                    <>
                        <img
                            src={images[currentImageIndex].path}
                            alt={`동물 사진 ${currentImageIndex + 1}`}
                            className="w-full h-full object-cover"
                            onClick={() => openGallery(currentImageIndex)}
                        />

                        {/* Image navigation */}
                        {images.length > 1 && (
                            <>
                                <button
                                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-60 p-1 rounded-full shadow-md hover:bg-opacity-90 transition-all"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        prevImage();
                                    }}
                                >
                                    <ChevronLeft size={24} className="text-gray-800" />
                                </button>
                                <button
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-60 p-1 rounded-full shadow-md hover:bg-opacity-90 transition-all"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        nextImage();
                                    }}
                                >
                                    <ChevronRight size={24} className="text-gray-800" />
                                </button>
                                <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
                                    {images.map((_, index) => (
                                        <button
                                            key={index}
                                            className={`w-2 h-2 rounded-full transition-all ${index === currentImageIndex
                                                    ? 'bg-white scale-125'
                                                    : 'bg-white bg-opacity-60'
                                                }`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setCurrentImageIndex(index);
                                            }}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </>
                ) : imageUrl ? (
                    <img
                        src={imageUrl}
                        alt="동물 사진"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <span className="text-gray-400">이미지 없음</span>
                    </div>
                )}
            </div>

            {/* Thumbnail gallery */}
            {images && images.length > 1 && (
                <div className="px-4 py-2 overflow-x-auto bg-gray-50">
                    <div className="flex gap-2">
                        {images.map((image, index) => (
                            <button
                                key={index}
                                className={`flex-shrink-0 h-16 w-16 rounded-md overflow-hidden border-2 transition-all ${index === currentImageIndex
                                        ? 'border-orange-500 shadow-md scale-105'
                                        : 'border-transparent hover:border-orange-300'
                                    }`}
                                onClick={() => setCurrentImageIndex(index)}
                            >
                                <img
                                    src={image.path}
                                    alt={`썸네일 ${index + 1}`}
                                    className="w-full h-full object-cover"
                                />
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImageCarousel;