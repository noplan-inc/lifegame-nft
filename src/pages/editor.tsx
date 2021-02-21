import React from 'react';
import Board from '../container/board';
import BoardView from '../presentational/boardView';

export const Editor = () => {
    return (
        <div className="py-4">
            <div className="py-4">
                <h2 className="font-bold text-3xl">Editor</h2>
            </div>

            <Board
                mode={'editor'}
                intervalTime={500}
                cellSize={20}
                spawnRate={25}
                boardSize={25}
                render={(props: BoardViewProps) => <BoardView {...props} />}
            />
        </div>
    );
};
