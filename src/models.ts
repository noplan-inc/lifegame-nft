import { BigNumberish } from 'ethers';

type Address = string;

type EthBNStr = string;

export interface NFT {
    mediaId: number;
    documentId: string;
    size: number;
    compressCells: string;
    rawCells?: Cell[];
}

export interface Bid {
    amount: EthBNStr;
    bidder: Address;
    currency: string;
    currencyAddress: Address;
    sellOn: EthBNStr;
    documentId: string;
}

export interface ContentData {
    cells: CompressCell[];
    size: number;
}

export interface CompressCell {
    id: string;
    live: boolean;
}

export type Balances = { [key: string]: BigNumberish };
