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
import { TWButton } from '../presentational/button';

interface BiddingListProps {
    nft: NFT;
}

export const BiddingList: React.FC<BiddingListProps> = ({ nft }) => {
    const { library, chainId } = useWeb3React<Web3Provider>();
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
            NotificationManager.success('acceptBid success!');
        } catch (e) {
            console.error(e);
            NotificationManager.error(
                'acceptBid is not allowed. Only the owner can accept this.'
            );
        }
    };

    if (loading) return <p>bidding list loading...</p>;

    if (error) return <p>{JSON.stringify(error)}</p>;

    if (!bids) return <></>;

    if (bids?.length === 0)
        return (
            <p className="font-bold text-white my-8">
                There are no bids, and this is your chance.
            </p>
        );

    return (
        <div className="grid grid-cols-1 mx-80 my-4 border rounded bg-opacity-70 bg-purple-400">
            <div className="font-medium text-2xl">Bidders</div>
            <table className="table-auto">
                <thead>
                    <tr>
                        <th>Bid</th>
                        <th>Sell-on share</th>
                        <th>Bidder</th>
                        <th />
                    </tr>
                </thead>
                <tbody>
                    {bids.map((bid, index) => {
                        return (
                            <tr key={index}>
                                <td>
                                    {formatEther(BigNumber.from(bid.amount))}
                                    {bid.currency}
                                </td>
                                <td>
                                    {formatEther(BigNumber.from(bid.sellOn))}%
                                </td>
                                <td>
                                    <a
                                        href={
                                            'https://testnet.bscscan.com/address/' +
                                            bid.bidder
                                        }
                                        target={'_blank'}
                                        rel={'noreferrer'}
                                        className="text-blue-100 hover:text-blue-700"
                                    >
                                        {bid.bidder}
                                    </a>
                                </td>
                                <TWButton
                                    className="my-2"
                                    onClick={async () => {
                                        await acceptBidHandler(bid);
                                    }}
                                >
                                    acceptBid(for owner)
                                </TWButton>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

BiddingList.propTypes = {
    nft: PropTypes.any,
};
