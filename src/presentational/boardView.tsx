import React, { useState } from 'react';
import {
    isRight,
    isBottom,
    setInitCellNeighbours,
    createBoardStatus,
    setInitCellId,
    setInitCellLive,
    restoreCellsFromIpfs,
} from '../utils/helper';
import { ContentData } from '../models';

const reloadPage = (): void => window.location.reload();

type GenerateStyle = (
    cellSize: number,
    live: boolean,
    boardSize: number,
    index: number
) => React.CSSProperties;

const generateStyle: GenerateStyle = (cellSize, live, boardSize, index) => {
    const border = '1px solid rgba(0,0,0,0.3)';
    return {
        display: 'inline-block',
        width: `${boardSize > 50 ? cellSize / 2 : cellSize}px`,
        height: `${boardSize > 50 ? cellSize / 2 : cellSize}px`,
        margin: 0,
        padding: 0,
        lineHeight: 0,
        background: live ? '#000' : 'rgba(0,0,0,0)',
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
    // const isViewer = mode === 'viewer';

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

    const clearHandler = async () => {
        const newCells = boardStatus.map((c) => {
            return {
                ...c,
                live: false,
            };
        });

        setCells(newCells);
    };

    return (
        <div>
            {isEditor ? (
                <div>
                    <textarea
                        onChange={(val) => {
                            const eCells = JSON.parse(
                                val.currentTarget.value
                            ) as ContentData;

                            const cells = restoreCellsFromIpfs(eCells);
                            setCells(cells);
                        }}
                    />
                    <input
                        placeholder={'0 < boardSize < 100'}
                        onChange={(val) => {
                            const boardSize = parseInt(val.currentTarget.value);

                            if (boardSize > 100 || isNaN(boardSize)) {
                                alert(
                                    `boardSize is max(60). ${boardSize} is invalid.`
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
                    <>
                        <button type={'button'} onClick={printHandler}>
                            print
                        </button>
                        <button type={'button'} onClick={clearHandler}>
                            clearAll
                        </button>
                    </>
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
