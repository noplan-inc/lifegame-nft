import React, { useState } from 'react';
import { useWeb3React } from '@web3-react/core';
import { Zora, constructBid } from '@zoralabs/zdk';
import { Web3Provider } from '@ethersproject/providers';
import PropTypes from 'prop-types';
import { MaxUint256 } from '@ethersproject/constants';
import { BaseErc20Factory } from '@zoralabs/core/dist/typechain';
import { parseEther } from 'ethers/lib/utils';

import bsc from '../addresses/bsc-testnet.json';
import { injected } from '../utils/connectors';
import { TokenBalanceSelectOption } from './token';
import { Bep20 } from '../addresses/bsc-testnet-bep20';
import { NotificationManager } from 'react-notifications';

interface BidButtonProps {
    mediaId: string;
}

export const BidForm: React.FC<BidButtonProps> = ({ mediaId }) => {
    const {
        library,
        chainId,
        activate,
        account,
    } = useWeb3React<Web3Provider>();
    const [balance, setBalance] = useState('');
    const [share, setShare] = useState(0);
    const [currency, setCurrency] = useState('');

    const bidHandler = async () => {
        if (!library || !chainId || !account) {
            activate(injected).catch((err) => console.error(err));
            return;
        }

        const signer = library.getSigner();

        const realBalance = await signer.getBalance();

        const bidBalance = parseEther(balance);

        if (bidBalance > realBalance) {
            alert(
                `your balance is ${realBalance}. ${bidBalance} is too expensive!!`
            );
            return;
        }

        const zora = new Zora(signer, chainId, bsc.media, bsc.market);

        const contractAddress = Bep20[currency];
        const erc20 = BaseErc20Factory.connect(contractAddress, signer);
        await erc20.approve(zora.marketAddress, MaxUint256);

        const bid = constructBid(
            contractAddress,
            bidBalance,
            account,
            account,
            share
        );

        const tx = await zora.setBid(mediaId, bid);
        NotificationManager.info(`bid txhash: ${tx.hash}`);
        console.log(tx.hash);

        await tx.wait(4);
        NotificationManager.success('success to send bid tx!');
    };

    return (
        <>
            <select
                onChange={(val) => {
                    const c = val.currentTarget.value;
                    if (!c) return;

                    if (!Bep20.hasOwnProperty(c)) return;

                    setCurrency(c);
                }}
            >
                {Object.entries(Bep20).map(([tokenName, address]) => {
                    return (
                        <TokenBalanceSelectOption
                            address={address}
                            tokenName={tokenName}
                            key={address}
                        />
                    );
                })}
            </select>

            <label>
                <input
                    type={'text'}
                    onChange={(val) => {
                        const value = val.currentTarget.value;
                        setBalance(value);
                    }}
                />
                TTN
            </label>

            <label>
                <input
                    type={'number'}
                    onChange={(val) => {
                        const value = parseInt(val.currentTarget.value);
                        setShare(value);
                    }}
                />
                % sell on share
            </label>

            <button type={'button'} onClick={bidHandler}>
                Bid
            </button>
        </>
    );
};

BidForm.propTypes = {
    mediaId: PropTypes.string.isRequired,
};
