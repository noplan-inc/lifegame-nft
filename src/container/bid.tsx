import React, { useState } from 'react';
import { useWeb3React } from '@web3-react/core';
import { Zora, constructBid } from '@zoralabs/zdk';
import { Web3Provider } from '@ethersproject/providers';
import PropTypes from 'prop-types';
import { MaxUint256 } from '@ethersproject/constants';
import { BaseErc20Factory } from '@zoralabs/core/dist/typechain';

import bsc from '../addresses/bsc-testnet.json';
import { injected } from '../utils/connectors';
import { parseEther } from 'ethers/lib/utils';

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

    const bidHandler = async () => {
        if (!library || !chainId || !account) {
            activate(injected).catch((err) => console.error);
            return;
        }

        const signer = library.getSigner();

        const realBalance = await signer.getBalance();

        const bidBalance = parseEther(balance);

        console.log(`bidBalance: ${bidBalance}, realBalance: ${realBalance}`);

        if (bidBalance > realBalance) {
            alert(
                `your balance is ${realBalance}. ${bidBalance} is too expensive!!`
            );
            return;
        }

        // BEP20 Test token contract address
        const TTN = '0x96f52946c55f7b810ad1e057649a2fafaa8fdc24';

        const zora = new Zora(signer, chainId, bsc.media, bsc.market);

        const erc20 = BaseErc20Factory.connect(TTN, signer);
        await erc20.approve(zora.marketAddress, MaxUint256);

        const bid = constructBid(TTN, bidBalance, account, account, share);

        // gas required exceeds allowance (30000000) or always failing transaction

        const tx = await zora.setBid(mediaId, bid);
        console.log(tx.hash);

        await tx.wait(4);
        alert('success!');
    };

    return (
        <>
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
