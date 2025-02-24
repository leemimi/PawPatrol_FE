import PropTypes from 'prop-types';
import { List } from 'lucide-react';

export const ControlButtons = ({ onLocationClick, onListClick }) => (
    <>
        <button
            onClick={onLocationClick}
            className="fixed bottom-20 left-4 z-50 bg-white rounded-full p-3 shadow-lg text-orange-400 hover:text-orange-500 transition-colors border-2 border-orange-100"
        >
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 2L12 4" />
                <path d="M12 20L12 22" />
                <path d="M20 12L22 12" />
                <path d="M2 12L4 12" />
            </svg>
        </button>
        <button
            onClick={onListClick}
            className="fixed bottom-20 right-4 z-50 bg-white rounded-full p-3 shadow-lg text-orange-400 hover:text-orange-500 transition-colors border-2 border-orange-100"
        >
            <List size={24} strokeWidth={2.5} />
        </button>
    </>
);

ControlButtons.propTypes = {
    onLocationClick: PropTypes.func.isRequired,
    onListClick: PropTypes.func.isRequired
};