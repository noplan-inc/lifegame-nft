/* eslint-disable no-unused-vars */
interface Cell {
    id: string;
    live: boolean;
    neighbours: number[];
}

interface BoardViewProps {
    boardSize: number;
    cellSize: number;
    boardStatus: Cell[];
    start: () => void;
    stop: () => void;
    setCells: (cells: Cell[]) => void;
}
