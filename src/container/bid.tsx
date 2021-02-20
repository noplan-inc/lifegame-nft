import React, { useState } from 'react';
import { useWeb3React } from '@web3-react/core';
import { Zora, constructBid } from '@zoralabs/zdk';
import { Web3Provider } from '@ethersproject/providers';
import PropTypes from 'prop-types';
import { MaxUint256 } from '@ethersproject/constants';
import { BaseErc20Factory } from '@zoralabs/core/dist/typechain';
import { formatEther, parseEther } from 'ethers/lib/utils';
import firebase from 'firebase/app';

import bsc from '../addresses/bsc-testnet.json';
import { injected } from '../utils/connectors';
import { TokenBalanceSelectOption } from './token';
import { Bep20 } from '../addresses/bsc-testnet-bep20';
import { NotificationManager } from 'react-notifications';
import { useRecoilValue } from 'recoil';
import { tokenState } from '../atoms/tokenState';
import { NFT } from '../models';
import { BiddingList } from './biddingList';
import { BigNumber } from 'ethers';

interface BidButtonProps {
    nft: NFT;
}

export const BidForm: React.FC<BidButtonProps> = ({ nft }) => {
    const {
        library,
        chainId,
        activate,
        account,
    } = useWeb3React<Web3Provider>();
    const [balance, setBalance] = useState('');
    const [share, setShare] = useState(0);
    const [currency, setCurrency] = useState('');
    const walletBalance = useRecoilValue(tokenState);

    const bidHandler = async () => {
        if (!library || !chainId || !account) {
            activate(injected).catch((err) => console.error(err));
            return;
        }

        const signer = library.getSigner();

        const bidBalance = parseEther(balance);

        const realBalance = walletBalance[currency] as BigNumber;
        if (realBalance.lt(bidBalance)) {
            console.error(formatEther(realBalance));
            console.error(formatEther(bidBalance));
            NotificationManager.error(
                `your balance: ${formatEther(realBalance)}`
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

        const tx = await zora.setBid(nft.mediaId, bid);
        NotificationManager.info(`bid txhash: ${tx.hash}`);
        console.log(tx.hash);

        await tx.wait(2);
        const db = firebase.firestore();

        await db
            .collection('nfts')
            .doc(nft.documentId)
            .collection('bids')
            .doc(tx.hash)
            .set({
                amount: bidBalance.toString(),
                bidder: bid.bidder,
                currency: currency,
                currencyAddress: contractAddress,
                sellOn: bid.sellOnShare.value.toString(),
            });

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
            <BiddingList nft={nft} />
        </>
    );
};

BidForm.propTypes = {
    nft: PropTypes.any,
};
