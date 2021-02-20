import React from 'react';
import PropTypes from 'prop-types';
import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import useSWR from 'swr';
import { formatEther } from 'ethers/lib/utils';

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

    if (!balance) return <option></option>;

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
