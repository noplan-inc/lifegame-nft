import React, { ReactNode } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

interface TWButtonProps {
    onClick: () => void;
    className?: string;
    children: ReactNode;
}
export const TWButton: React.FC<TWButtonProps> = ({
    className,
    children,
    onClick,
}) => {
    const c = classNames(
        'text-white px-3 py-2 rounded-md text-sm font-medium bg-blue-900 mx-4',
        className
    );
    return (
        <button type={'button'} onClick={onClick} className={c}>
            {children}
        </button>
    );
};

TWButton.propTypes = {
    className: PropTypes.string,
    children: PropTypes.element.isRequired,
    onClick: PropTypes.func.isRequired,
};
