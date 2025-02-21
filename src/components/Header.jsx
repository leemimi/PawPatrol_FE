import PropTypes from 'prop-types';
import { ChevronLeft, Dog, Search } from 'lucide-react';

export const Header = ({ onSearchClick }) => (
    <div className="fixed top-0 left-0 right-0 z-20 bg-white px-4 py-3 flex items-center justify-between border-b border-orange-100">
        <button className="p-2 text-orange-400 hover:text-orange-500 transition-colors">
            <ChevronLeft size={28} strokeWidth={2.5} />
        </button>
        <h1 className="text-lg font-bold text-orange-900 flex items-center gap-2">
            <Dog className="text-orange-400" size={20} />
            <span>주변의 귀여운 친구들</span>
        </h1>
        <button onClick={onSearchClick} className="p-2 text-orange-400 hover:text-orange-500 transition-colors">
            <Search size={24} strokeWidth={2.5} />
        </button>
    </div>
);

Header.propTypes = {
    onSearchClick: PropTypes.func.isRequired,
};