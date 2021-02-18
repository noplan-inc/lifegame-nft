import React from 'react';
import { isRight, isBottom } from '../utils/helper';

const reloadPage = (): void => window.location.reload();

type GenerateStyle = (
    cellSize: number,
    live: boolean,
    boardSize: number,
    index: number
) => React.CSSProperties;

const generateStyle: GenerateStyle = (cellSize, live, boardSize, index) => {
    const border = '1px solid #000';
    return {
        display: 'inline-block',
        width: `${cellSize}px`,
        height: `${cellSize}px`,
        margin: 0,
        padding: 0,
        lineHeight: 0,
        background: live ? '#000' : '#fff',
        boxSizing: 'border-box',
        borderTop: border,
        borderLeft: border,
        borderRight: isRight(boardSize, index) ? border : 'none',
        borderBottom: isBottom(boardSize, index) ? border : 'none',
    };
};

const Board = (props: BoardViewProps) => {
    const { boardSize, cellSize, boardStatus, start, stop } = props;

    const clickHandler = async (cell: Cell) => {
        console.log(cell.id);
        cell.live = true;
    };

    return (
        <div>
            <h1>life gaming</h1>

            <div>
                <button type="button" onClick={start}>
                    start
                </button>
                <button type="button" onClick={reloadPage}>
                    reload
                </button>
                <button type={'button'} onClick={stop}>
                    stop
                </button>
            </div>

            <div style={{ fontSize: 0 }}>
                {boardStatus.map(
                    (cell: Cell, index: number): React.ReactNode => (
                        <span key={cell.id}>
                            <i
                                style={generateStyle(
                                    cellSize,
                                    cell.live,
                                    boardSize,
                                    index
                                )}
                                onClick={async () => {
                                    await clickHandler(cell);
                                }}
                            />
                            {isRight(boardSize, index) && <br />}
                        </span>
                    )
                )}
            </div>
        </div>
    );
};

export default Board;
