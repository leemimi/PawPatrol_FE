import { X, Search } from 'lucide-react';
import PropTypes from 'prop-types';

export const SearchModal = ({ isOpen, onClose, searchKeyword, onKeywordChange, onSearch, searchResults, onLocationSelect }) => {
   if (!isOpen) return null;

   return (
       <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
           <div className="bg-white rounded-lg p-6 w-11/12 max-w-md">
               <div className="flex items-center justify-between mb-4">
                   <h3 className="text-lg font-bold text-orange-900">장소 검색</h3>
                   <button onClick={onClose} className="text-orange-300 hover:text-orange-400 transition-colors">
                       <X size={24} strokeWidth={2.5} />
                   </button>
               </div>
               <div className="flex gap-2">
                   <input
                       type="text"
                       value={searchKeyword}
                       onChange={(e) => onKeywordChange(e.target.value)}
                       onKeyPress={(e) => e.key === 'Enter' && onSearch()}
                       placeholder="검색어를 입력하세요"
                       className="flex-1 p-3 border-2 border-orange-100 rounded-lg"
                   />
                   <button
                       onClick={onSearch}
                       className="bg-orange-500 text-white px-4 rounded-lg hover:bg-orange-600 transition-colors"
                   >
                       <Search size={20} />
                   </button>
               </div>
               <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
                   {searchResults.map((place) => (
                       <div
                           key={place.id}
                           className="p-3 bg-orange-50 rounded-lg cursor-pointer hover:bg-orange-100 transition-colors"
                           onClick={() => onLocationSelect(place)}
                       >
                           {place.place_name}
                       </div>
                   ))}
               </div>
           </div>
       </div>
   );
};

SearchModal.propTypes = {
   isOpen: PropTypes.bool.isRequired,
   onClose: PropTypes.func.isRequired,
   searchKeyword: PropTypes.string.isRequired,
   onKeywordChange: PropTypes.func.isRequired,
   onSearch: PropTypes.func.isRequired,
   searchResults: PropTypes.arrayOf(
       PropTypes.shape({
           id: PropTypes.string.isRequired,
           place_name: PropTypes.string.isRequired
       })
   ).isRequired,
   onLocationSelect: PropTypes.func.isRequired
};