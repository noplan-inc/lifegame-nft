import { atom } from 'recoil';
import { BigNumberish } from 'ethers';

interface TokenState {
    [key: string]: BigNumberish;
}

export const tokenState = atom<TokenState>({
    key: 'tokenState',
    default: {},
});
