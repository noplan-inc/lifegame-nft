import React from 'react';
import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import { Zora } from '@zoralabs/zdk';
import { BigNumber } from 'ethers';
import { Link } from 'react-router-dom';

import { loadCellsFromContentUrl } from '../utils/loader';
import bsc from '../addresses/bsc-testnet.json';
import BoardView from '../presentational/boardView';
import Board from './board';

interface CollectionsProps {}

export const Collections: React.FC<CollectionsProps> = ({}) => {
    const { library, chainId, account } = useWeb3React<Web3Provider>();
    const [collections, setCollections] = React.useState<Cell[][]>([]);

    React.useEffect(() => {
        async function f() {
            if (!library || !chainId || !account) return;

            const signer = library.getSigner();
            const zora = new Zora(signer, chainId, bsc.media, bsc.market);

            const zoraOwnCount = (
                await zora.fetchBalanceOf(account)
            ).toNumber();

            if (zoraOwnCount === 0) return;

            let foundCollection = 0;
            for (let i = 0; i < zoraOwnCount; i++) {
                const bn = BigNumber.from(i.toString());
                try {
                    const mediaId = await zora.fetchMediaOfOwnerByIndex(
                        account,
                        bn
                    );
                    const contentUrl = await zora.fetchContentURI(mediaId);

                    const cells = await loadCellsFromContentUrl(contentUrl);

                    setCollections((prevState) => [...prevState, cells]);
                    foundCollection += 1;
                    if (zoraOwnCount === foundCollection) break;
                } catch (e) {
                    console.error(e);
                }
            }
        }
        f();
    }, [library, chainId]);

    if (collections.length === 0) {
        return (
            <div>
                <Link to={'/'}>find you favorite nft.</Link>
            </div>
        );
    }

    return (
        <div>
            {collections.map((cells, index) => {
                return (
                    <div className="py-4" key={index}>
                        <Board
                            mode={'viewer'}
                            intervalTime={500}
                            cellSize={20}
                            spawnRate={25}
                            boardSize={Math.sqrt(cells.length)}
                            initStatus={cells}
                            render={(props: BoardViewProps) => (
                                <BoardView {...props} />
                            )}
                        />
                    </div>
                );
            })}
        </div>
    );
};
