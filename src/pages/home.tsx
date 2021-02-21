import { ListZora } from '../container/zora';
import React from 'react';

export const Home = () => {
    return (
        <>
            <div className="flex justify-center">
                <h2 className="font-bold text-4xl p-4">Market</h2>
            </div>
            <div>
                <ListZora />
            </div>
        </>
    );
};
