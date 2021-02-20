import React from 'react';
import Board from '../container/board';
import BoardView from '../presentational/boardView';

export const Editor = () => {
    return (
        <div>
            <h2>Editor</h2>
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
