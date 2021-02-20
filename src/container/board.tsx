import * as React from 'react';
import {
    createBoardStatus,
    setInitCellId,
    setInitCellLive,
    setInitCellNeighbours,
} from '../utils/helper';

type BoardContainerProps = {
    intervalTime: number;
    cellSize: number;
    spawnRate: number;
    boardSize: number;
    initStatus?: Cell[];
    mode: 'editor' | 'viewer';
    render: (props: BoardViewProps) => JSX.Element;
};

type BoardState = {
    boardStatus: Cell[];
    timerId: number;
    isPlaying: boolean;
};

class Board extends React.Component {
    props: BoardContainerProps = this.props;

    state: BoardState = {
        boardStatus: [],
        timerId: 0,
        isPlaying: false,
    };

    componentDidMount = (): void => {
        this.initBoardStatus();
    };

    hasFinished = (): boolean => {
        const { boardStatus } = this.state;
        return boardStatus.every((cell: Cell) => !cell.live);
    };

    countLivingNeighbours = (neighbourList: number[]): number => {
        const { boardStatus }: { boardStatus: Cell[] } = this.state;
        const live = neighbourList.map(
            (num: number): boolean => boardStatus[num].live
        );

        return live.filter((cellLive) => cellLive).length;
    };

    canLive = (neighbourList: number[], isLive: boolean): boolean => {
        const liveCount = this.countLivingNeighbours(neighbourList);

        if (liveCount >= 4 || liveCount <= 1) {
            return false;
        }

        if (liveCount === 3) {
            return true;
        }

        if (isLive && liveCount === 2) {
            return true;
        }

        return isLive;
    };

    runLifeCycle = () => {
        if (this.hasFinished()) {
            return;
        }

        const { boardStatus }: { boardStatus: Cell[] } = this.state;
        const nextBoardStatus: Cell[] = boardStatus.map((cell) => {
            const live = this.canLive(cell.neighbours, cell.live);
            return { ...cell, live };
        });

        this.setState({ boardStatus: nextBoardStatus });
    };

    initBoardStatus = () => {
        const { spawnRate, boardSize, initStatus } = this.props;
        if (initStatus) {
            return this.setState({
                boardStatus: initStatus,
            });
        }

        const newStatus: Cell[] = createBoardStatus(boardSize).map(
            (cell: Cell, index: number) => ({
                ...cell,
                ...setInitCellId(index),
                ...setInitCellLive(spawnRate),
                ...setInitCellNeighbours(boardSize, index),
            })
        );

        this.setState({
            boardStatus: newStatus,
        });
    };

    start = () => {
        const { runLifeCycle } = this;
        const { intervalTime } = this.props;
        const timerId = setInterval(runLifeCycle, intervalTime);

        this.setState({
            ...this.state,
            timerId,
            isPlaying: true,
        });
    };

    stop = () => {
        clearInterval(this.state.timerId);
        this.setState({
            ...this.state,
            isPlaying: false,
        });
    };

    setCells = (cells: Cell[]) => {
        this.setState({
            ...this.state,
            boardStatus: cells,
        });
    };

    render = () => {
        const { boardSize, cellSize, render, mode } = this.props;
        const {
            boardStatus,
            isPlaying,
        }: { boardStatus: Cell[]; isPlaying: boolean } = this.state;

        const childrenProps: BoardViewProps = {
            boardSize,
            cellSize,
            boardStatus,
            mode,
            isPlaying,
            start: this.start,
            stop: this.stop,
            setCells: this.setCells,
        };

        return <div>{render(childrenProps)}</div>;
    };
}

export default Board;
