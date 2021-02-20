import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import useSWR from 'swr';
import { formatEther } from 'ethers/lib/utils';
import { useSetRecoilState } from 'recoil';
import { tokenState } from '../atoms/tokenState';

interface TokenBalanceSelectOptionProps {
    tokenName: string;
    address: string;
}
export const TokenBalanceSelectOption: React.FC<TokenBalanceSelectOptionProps> = ({
    tokenName,
    address,
}) => {
    const { account } = useWeb3React<Web3Provider>();
    const { data: balance } = useSWR([address, 'balanceOf', account]);
    const setBalance = useSetRecoilState(tokenState);

    useEffect(() => {
        if (!balance) return;
        setBalance((prevState) => {
            const newState = { ...prevState };
            newState[tokenName] = balance;
            return newState;
        });
    }, [balance]);

    if (!balance) return <option value={tokenName}>{tokenName}: 0</option>;

    return (
        <option value={tokenName}>
            {tokenName}: {formatEther(balance)}
        </option>
    );
};

TokenBalanceSelectOption.propTypes = {
    tokenName: PropTypes.string.isRequired,
    address: PropTypes.string.isRequired,
};
