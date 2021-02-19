export interface NFT {
    mediaId: number;
    size: number;
    compressCells: string;
    rawCells?: Cell[];
}

export interface ContentData {
    cells: CompressCell[];
    size: number;
}

export interface CompressCell {
    id: string;
    live: boolean;
}
