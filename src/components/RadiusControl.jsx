import { Heart } from 'lucide-react';
import PropTypes from 'prop-types';

export const RadiusControl = ({ selectedRange, onRangeChange, isTransitioning }) => (
   <div className="absolute top-4 left-4 right-4 z-10">
       <div className="bg-white/95 rounded-3xl shadow-lg p-6 backdrop-blur-sm border-2 border-orange-100">
           <div className="flex items-center justify-between mb-3">
               <p className="text-sm text-orange-700 font-medium flex items-center gap-2">
                   <Heart size={16} className="text-orange-400" />
                   검색 반경
               </p>
               <p className="text-sm font-bold text-orange-500">{selectedRange}km</p>
           </div>
           <input
               type="range"
               min="1"
               max="10"
               value={selectedRange}
               onChange={(e) => onRangeChange(Number(e.target.value))}
               className="w-full accent-orange-500"
               disabled={isTransitioning}
           />
       </div>
   </div>
);