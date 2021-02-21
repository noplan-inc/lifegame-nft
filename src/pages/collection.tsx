import React from 'react';
import { Collections } from '../container/collections';

export const Collection = () => {
    return (
        <div className="py-4">
            <div className="py-4">
                <h2 className="font-bold text-3xl">Collection</h2>
            </div>
            <Collections />
        </div>
    );
};
