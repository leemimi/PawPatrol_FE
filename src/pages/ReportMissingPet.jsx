import React, { useState } from 'react';
import { ChevronLeft, Camera } from 'lucide-react';

const ReportMissingPet = () => {
    const [images, setImages] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        status: '찾는중',
        location: '',
        date: '',
        time: '',
        petInfo: null,
        hashtags: '',
        description: ''
    });

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        const newImages = files.map(file => URL.createObjectURL(file));
        setImages(prev => [...prev, ...newImages]);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(formData);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="fixed top-0 left-0 right-0 z-20 bg-white px-4 py-3 flex items-center border-b border-gray-200">
                <button className="p-2">
                    <ChevronLeft size={24} />
                </button>
                <h1 className="text-lg font-semibold ml-2">실종신고 등록</h1>
            </div>

            {/* Main Content */}
            <div className="pt-16 pb-24">
                <form onSubmit={handleSubmit}>
                    {/* Image Upload Section */}
                    <div className="px-4 py-6 bg-white mb-2">
                        <div className="flex gap-2 overflow-x-auto pb-4">
                            <label className="flex-shrink-0 w-24 h-24 rounded-lg bg-gray-100 flex flex-col items-center justify-center cursor-pointer">
                                <Camera size={24} className="text-gray-400 mb-1" />
                                <span className="text-xs text-gray-400">0/10</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />
                            </label>
                            {images.map((img, index) => (
                                <div key={index} className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden">
                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Title & Status */}
                    <div className="px-4 py-6 bg-white mb-2">
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                            className="w-full text-lg font-medium placeholder-gray-400 mb-6"
                            placeholder="제목을 입력해주세요"
                        />
                        <div className="flex gap-2">
                            {['찾는중', '임보중', '주인찾기완료'].map((status) => (
                                <button
                                    key={status}
                                    type="button"
                                    onClick={() => setFormData({...formData, status})}
                                    className={`px-4 py-2 rounded-full text-sm ${
                                        formData.status === status
                                            ? 'bg-orange-500 text-white'
                                            : 'bg-gray-100 text-gray-500'
                                    }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Location & Time */}
                    <div className="px-4 py-6 bg-white mb-2">
                        <button
                            type="button"
                            className="w-full text-left py-3 border-b border-gray-100"
                        >
                            <p className="text-gray-400 text-sm mb-1">실종 위치</p>
                            <p className="text-gray-900">위치를 선택해주세요</p>
                        </button>
                        
                        <div className="flex gap-4 py-3">
                            <div className="flex-1">
                                <p className="text-gray-400 text-sm mb-1">실종 날짜</p>
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                                    className="w-full text-gray-900"
                                />
                            </div>
                            <div className="flex-1">
                                <p className="text-gray-400 text-sm mb-1">실종 시간</p>
                                <input
                                    type="time"
                                    value={formData.time}
                                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                                    className="w-full text-gray-900"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Pet Info */}
                    <div className="px-4 py-6 bg-white mb-2">
                        <button
                            type="button"
                            className="w-full text-left py-3"
                        >
                            <p className="text-gray-400 text-sm mb-1">반려동물 정보</p>
                            <p className="text-gray-900">내 반려동물 선택하기</p>
                        </button>
                    </div>

                    {/* Additional Info */}
                    <div className="px-4 py-6 bg-white">
                        <div className="mb-6">
                            <p className="text-gray-400 text-sm mb-1">해시태그</p>
                            <input
                                type="text"
                                value={formData.hashtags}
                                onChange={(e) => setFormData({...formData, hashtags: e.target.value})}
                                className="w-full text-gray-900"
                                placeholder="#강아지 #실종"
                            />
                        </div>

                        <div>
                            <p className="text-gray-400 text-sm mb-1">상세설명</p>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                className="w-full min-h-[120px] text-gray-900 resize-none"
                                placeholder="실종 당시 상황이나 특이사항을 적어주세요"
                            />
                        </div>
                    </div>
                </form>
            </div>

            {/* Bottom Submit Button */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
                <button
                    type="submit"
                    onClick={handleSubmit}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-medium transition-colors"
                >
                    등록하기
                </button>
            </div>
        </div>
    );
};

export default ReportMissingPet;