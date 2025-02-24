import React from 'react';
import { X, MapPin } from 'lucide-react';

const PetList = ({ pets, onPetClick, onClose }) => {
    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-lg border-t-2 border-orange-100 z-50 transition-all duration-300 ease-in-out">
            <div className="p-4 border-b border-orange-100 flex justify-between items-center">
                <h3 className="font-semibold text-lg text-orange-900">발견된 반려동물</h3>
                <button 
                    onClick={onClose}
                    className="text-orange-300 hover:text-orange-400 transition-colors"
                >
                    <X size={24} strokeWidth={2.5} />
                </button>
            </div>
            <div className="max-h-[50vh] overflow-auto">
                {pets.map(pet => (
                    <PetListItem
                        key={pet.id}
                        pet={pet}
                        onClick={() => onPetClick(pet)}
                    />
                ))}
            </div>
        </div>
    );
};

const PetListItem = ({ pet, onClick }) => {
    return (
        <div
            onClick={onClick}
            className="p-4 border-b border-orange-100 hover:bg-orange-50 cursor-pointer"
        >
            <div className="flex gap-4 items-center">
                <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-orange-100">
                    <img 
                        src={pet.image}
                        alt={pet.name}
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <span className={`text-sm px-3 py-1.5 rounded-full font-medium ${
                            pet.status === '찾는중' ? 'bg-orange-100 text-orange-500' : 'bg-blue-100 text-blue-500'
                        }`}>
                            {pet.status}
                        </span>
                        <span className="text-sm text-gray-500">
                            {new Date(pet.time).toLocaleDateString()}
                        </span>
                    </div>
                    <h3 className="text-lg font-bold text-orange-900 mb-1">
                        {pet.breed} / {pet.age}세 / {pet.gender}
                    </h3>
                    <p className="text-sm text-orange-600 flex items-center gap-1">
                        <MapPin size={14} />
                        {pet.location}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PetList;