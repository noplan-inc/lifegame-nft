import React from 'react';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import firebase from 'firebase';
import PropTypes from 'prop-types';

import { NFT, Bid } from '../models';
import { formatEther } from 'ethers/lib/utils';
import { BigNumber } from 'ethers';
import { constructBid, Zora } from '@zoralabs/zdk';
import bsc from '../addresses/bsc-testnet.json';
import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import { NotificationManager } from 'react-notifications';

interface BiddingListProps {
    nft: NFT;
}

export const BiddingList: React.FC<BiddingListProps> = ({ nft }) => {
    const { library, chainId, account } = useWeb3React<Web3Provider>();
    const [bids, loading, error] = useCollectionData<Bid>(
        firebase
            .firestore()
            .collection('nfts')
            .doc(nft.documentId)
            .collection('bids'),
        { idField: 'documentId' }
    );

    const acceptBidHandler = async (bid: Bid) => {
        if (!library || !chainId)
            return NotificationManager.error('please connect wallet.');

        const sellOnShare = parseInt(formatEther(BigNumber.from(bid.sellOn)));
        const b = constructBid(
            bid.currencyAddress,
            bid.amount,
            bid.bidder,
            bid.bidder,
            sellOnShare
        );
        const signer = library?.getSigner();

        const zora = new Zora(signer, chainId, bsc.media, bsc.market);

        try {
            const tx = await zora.acceptBid(nft.mediaId, b);
            NotificationManager.info(tx.hash);
            console.log(tx.hash);

            await tx.wait(2);
        } catch (e) {
            console.error(e);
            NotificationManager.error(
                'acceptBid is not allowed. Only the owner can accept this.'
            );
        }
    };

    const fetchBalanceHandler = async () => {
        // TODO delete
        if (!library || !chainId || !account)
            return NotificationManager.error('please connect wallet.');

        const signer = library?.getSigner();

        const zora = new Zora(signer, chainId, bsc.media, bsc.market);

        const res = await zora.fetchBalanceOf(account);
        console.log(res);
    };

    if (loading) return <p>bidding list loading...</p>;

    if (error) return <p>{JSON.stringify(error)}</p>;

    if (!bids) return <p>There is no bids. There is your chance.</p>;

    return (
        <div>
            {/* TODO DELETE */}
            <button onClick={fetchBalanceHandler}>fetch</button>
            <ul>
                {bids.map((bid, index) => {
                    return (
                        <li key={index}>
                            bidder:{' '}
                            <a
                                href={
                                    'https://testnet.bscscan.com/address/' +
                                    bid.bidder
                                }
                                target={'_blank'}
                                rel={'noreferrer'}
                            >
                                {bid.bidder}
                            </a>
                            , currency:{' '}
                            <a
                                href={
                                    'https://testnet.bscscan.com/address/' +
                                    bid.currencyAddress
                                }
                                target={'_blank'}
                                rel={'noreferrer'}
                            >
                                {bid.currency}
                            </a>
                            , amount: {formatEther(BigNumber.from(bid.amount))},
                            sellOnShare:{' '}
                            {formatEther(BigNumber.from(bid.sellOn))}%
                            <button
                                type={'button'}
                                onClick={async () => {
                                    await acceptBidHandler(bid);
                                }}
                            >
                                acceptBid(for owner)
                            </button>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

BiddingList.propTypes = {
    nft: PropTypes.any,
};
