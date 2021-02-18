type CheckPosition = (size: number, index: number) => boolean;

export const isTop: CheckPosition = (size, index) => index < size;

export const isBottom: CheckPosition = (size, index) =>
    index <= size * size - 1 && index > size * size - size - 1;

export const isRight: CheckPosition = (size, index) =>
    index !== 0 && index % size === size - 1;

export const isLeft: CheckPosition = (size, index) => index % size === 0;

export const isLeftTop: CheckPosition = (size, index) =>
    isLeft(size, index) && isTop(size, index);

export const isRightTop: CheckPosition = (size, index) =>
    isRight(size, index) && isTop(size, index);

export const isLeftBottom: CheckPosition = (size, index) =>
    isLeft(size, index) && isBottom(size, index);

export const isRightBottom: CheckPosition = (size, index) =>
    isRight(size, index) && isBottom(size, index);

type GetIndexList = (size: number, index: number) => number[];
const cellIndex: GetIndexList = (size, index) => [
    index - size - 1,
    index - size,
    index - size + 1,
    index - 1,
    index,
    index + 1,
    index + size - 1,
    index + size,
    index + size + 1,
];

const filterIndex = (arr: number[], size: number, arrIndex: number): number[] =>
    cellIndex(size, arrIndex).filter((cell, index) => !arr.includes(index));

export const createNeighbourIndex: GetIndexList = (size, index) => {
    const top: number[] = [0, 1, 2];
    const left: number[] = [0, 3, 6];
    const right: number[] = [2, 5, 8];
    const bottom: number[] = [6, 7, 8];
    const center: number[] = [4];

    if (isLeftTop(size, index)) {
        return filterIndex([...top, ...left, ...center], size, index);
    }

    if (isRightTop(size, index)) {
        return filterIndex([...right, ...top, ...center], size, index);
    }

    if (isLeftBottom(size, index)) {
        return filterIndex([...left, ...bottom, ...center], size, index);
    }

    if (isRightBottom(size, index)) {
        return filterIndex([...right, ...bottom, ...center], size, index);
    }

    if (isTop(size, index)) {
        return filterIndex([...top, ...center], size, index);
    }

    if (isLeft(size, index)) {
        return filterIndex([...left, ...center], size, index);
    }

    if (isRight(size, index)) {
        return filterIndex([...right, ...center], size, index);
    }

    if (isBottom(size, index)) {
        return filterIndex([...bottom, ...center], size, index);
    }

    return filterIndex(center, size, index);
};
