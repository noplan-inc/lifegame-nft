import React, { ReactNode } from 'react';
import PropTypes from 'prop-types';

interface TWButtonProps {
    onClick: () => void;
    children: ReactNode;
}
export const TWButton: React.FC<TWButtonProps> = ({ children, onClick }) => {
    return (
        <button
            type={'button'}
            onClick={onClick}
            className="text-white px-3 py-2 rounded-md text-sm font-medium bg-blue-900 mx-4"
        >
            {children}
        </button>
    );
};

TWButton.propTypes = {
    children: PropTypes.element.isRequired,
    onClick: PropTypes.func.isRequired,
};
