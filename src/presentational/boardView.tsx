import React, { useState } from 'react';
import {
    isRight,
    isBottom,
    restoreCells,
    ExportedCells,
    setInitCellNeighbours,
    createBoardStatus,
    setInitCellId,
    setInitCellLive,
} from '../utils/helper';

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
    const {
        boardSize,
        cellSize,
        boardStatus,
        start,
        stop,
        setCells,
        mode,
    } = props;

    const [bSize, setBoardSize] = useState(boardSize);

    const cellClickHandler = async (cell: Cell) => {
        const cs = [...boardStatus];
        const newCells = cs.map((c) => {
            return {
                ...c,
                live: c.id === cell.id ? !c.live : c.live,
            };
        });
        setCells(newCells);
    };

    const isEditor = mode === 'editor';

    const printHandler = async () => {
        const compressCells = boardStatus.map((cell) => {
            return {
                id: cell.id,
                live: cell.live,
            };
        });
        const output = {
            size: Math.sqrt(boardStatus.length),
            cells: compressCells,
        };
        const json = JSON.stringify(output);
        console.log(json);
    };

    return (
        <div>
            {isEditor ? (
                <div>
                    <textarea
                        onChange={(val) => {
                            const eCells = JSON.parse(
                                val.currentTarget.value
                            ) as ExportedCells;

                            const cells = restoreCells(eCells);
                            setCells(cells);
                        }}
                    />
                    <input
                        placeholder={'boardSize must be able to sqrt'}
                        onChange={(val) => {
                            const boardSize = parseInt(val.currentTarget.value);

                            if (boardSize > 50 || isNaN(boardSize)) {
                                alert(
                                    `boardSize is max(50). ${boardSize} is invalid.`
                                );
                                return;
                            }

                            const newStatus: Cell[] = createBoardStatus(
                                boardSize
                            ).map((cell: Cell, index: number) => ({
                                ...cell,
                                ...setInitCellId(index),
                                ...setInitCellLive(50),
                                ...setInitCellNeighbours(boardSize, index),
                            }));
                            setBoardSize(boardSize);
                            setCells(newStatus);
                        }}
                    />
                </div>
            ) : (
                <></>
            )}

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
                {isEditor ? (
                    <button type={'button'} onClick={printHandler}>
                        print
                    </button>
                ) : (
                    <></>
                )}
            </div>

            <div style={{ fontSize: 0 }}>
                {boardStatus.map(
                    (cell: Cell, index: number): React.ReactNode => (
                        <span key={cell.id}>
                            <i
                                style={generateStyle(
                                    cellSize,
                                    cell.live,
                                    bSize,
                                    index
                                )}
                                onClick={async () => {
                                    await cellClickHandler(cell);
                                }}
                            />
                            {isRight(bSize, index) && <br />}
                        </span>
                    )
                )}
            </div>
        </div>
    );
};

export default Board;
