import React from 'react';
import { MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import InfiniteScroll from './InfiniteScroll';

const AnimalCaseList = ({
    animals,
    hasMore,
    loading,
    nextPage,
    detailPath = '/protection',
    emptyMessage = '등록된 동물이 없습니다.',
    emptyAction = null
}) => {
    const navigate = useNavigate();

    const handleAnimalClick = (animal) => {
        navigate(`${detailPath}/${animal.animalCaseId}`);
    };

    const renderAnimal = (animal, index) => (
        <div
            className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-[1.02]"
            onClick={() => handleAnimalClick(animal)}
        >
            <div className="relative h-40 overflow-hidden">
                {animal.imageUrl && (
                    <img
                        src={animal.imageUrl}
                        alt={animal.title}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                    />
                )}
                <div className="absolute top-2 left-2">
                    <StatusBadge status={animal.caseStatus} type="protection" />
                </div>
            </div>

            <div className="p-4 h-[7rem] flex flex-col justify-between">
                <h3 className="text-[15px] text-amber-900 min-h-[2.5rem] line-clamp-2 text-center font-medium">
                    {animal.title}
                </h3>
                {animal.location && (
                    <div className="flex items-center justify-start text-sm text-amber-700/70 mt-1">
                        <MapPin size={14} className="mr-1" />
                        <span className="truncate">{animal.location}</span>
                    </div>
                )}
                <div className="flex justify-between items-center text-sm mt-2">
                    <span className="text-amber-600 font-medium">{animal.breed}</span>
                    <span className="text-amber-700/60">
                        {new Date(animal.createdAt).toLocaleDateString()}
                    </span>
                </div>
            </div>
        </div>
    );

    return (
        <InfiniteScroll
            items={animals}
            hasMore={hasMore}
            loading={loading}
            loadMore={nextPage}
            renderItem={renderAnimal}
            loadingComponent={<div className="text-center py-4"><span className="text-gray-500">불러오는 중...</span></div>}
            emptyComponent={
                <div className="flex flex-col items-center justify-center h-64 p-4 col-span-2">
                    <p className="text-gray-600 text-center">{emptyMessage}</p>
                    {emptyAction}
                </div>
            }
            endMessage={<div className="text-center py-4"><span className="text-gray-500">모든 동물을 불러왔습니다.</span></div>}
            className="grid grid-cols-2 gap-3 col-span-2"
        />
    );
};

export default AnimalCaseList;