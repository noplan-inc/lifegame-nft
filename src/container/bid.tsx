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
import { TWButton } from '../presentational/button';

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
        <div className="grid grid-cols-1">
            <div className="border rounded px-24 mx-80 bg-opacity-70 bg-purple-400">
                <div className="grid grid-cols-2">
                    <p className="font-bold text-3xl col-span-4">Bidding</p>

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
                            className="m-4"
                            type={'text'}
                            onChange={(val) => {
                                const value = val.currentTarget.value;
                                setBalance(value);
                            }}
                        />
                        {currency}
                    </label>
                </div>
                <div className="">
                    <label>
                        <input
                            className="m-4"
                            type={'number'}
                            onChange={(val) => {
                                const value = parseInt(val.currentTarget.value);
                                setShare(value);
                            }}
                        />
                        % sell on share
                    </label>

                    <TWButton onClick={bidHandler}>Bid</TWButton>
                </div>
            </div>
            <BiddingList nft={nft} />
        </div>
    );
};

BidForm.propTypes = {
    nft: PropTypes.any,
};
