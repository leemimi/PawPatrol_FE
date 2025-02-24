import React from 'react';
import { MapPin, X } from 'lucide-react';

export const PetCard = ({ pet, onClose }) => (
    <div className="flex items-start gap-4">
        <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-orange-100">
            <img src={pet.image} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
                <span className={`text-sm px-3 py-1.5 rounded-full font-medium ${
                    pet.status === '찾는중' ? 'bg-orange-100 text-orange-500' : 'bg-blue-100 text-blue-500'
                }`}>
                    {pet.status}
                </span>
                <span className="text-sm text-gray-500">{pet.time}</span>
            </div>
            {/* <h3 className="text-lg font-bold text-orange-900 mb-1">
                {pet.breed} / {pet.age}세 / {pet.gender}
            </h3> */}
            <p className="text-sm text-orange-600 flex items-center gap-1">
                <MapPin size={14} />
                {pet.location}
            </p>
        </div>
        <button onClick={onClose} className="text-orange-300 hover:text-orange-400 transition-colors">
            <X size={24} strokeWidth={2.5} />
        </button>
    </div>
);