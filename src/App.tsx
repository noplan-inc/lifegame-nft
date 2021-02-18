import React from 'react';
// @ts-ignore
import Board from './container/board';
import './App.css';
import BoardView from './presentational/boardView';

function App() {
    return (
        <div className="App">
            <Board
                intervalTime={1000}
                cellSize={20}
                spawnRate={25}
                boardSize={5}
                render={(props: BoardViewProps) => <BoardView {...props} />}
            />
        </div>
    );
}

export default App;
