import React, { useState } from 'react';
import { Zora } from '@zoralabs/zdk';
import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';

import bsc from '../addresses/bsc-testnet.json';
import { useEffect } from 'react';
import { loadCellsFromContentUrl } from '../utils/loader';
import BoardView from '../presentational/boardView';
import Board from './board';
import { BidForm } from './bid';

type BoardTable = { [key: string]: Cell[] };

export const ListZora: React.FC<{}> = () => {
    const { library, chainId } = useWeb3React<Web3Provider>();

    const [boards, setBoards] = useState<BoardTable>({});

    useEffect(() => {
        async function f() {
            if (library === undefined || chainId === undefined) {
                return;
            }

            const signer = library.getSigner();

            const zora = new Zora(signer, chainId, bsc.media, bsc.market);

            const big = await zora.fetchTotalMedia();

            const newBoards = { ...boards };

            // 0, 1 => stash data
            for (let i = 2; i < 2 + big.toNumber(); i++) {
                const contentUrl = await zora.fetchContentURI(i);
                const cells = await loadCellsFromContentUrl(contentUrl);

                newBoards[i.toString()] = cells;
            }

            setBoards(newBoards);
        }

        f();
    }, [library, chainId]);

    return (
        <>
            {Object.keys(boards).map((key, index) => {
                const cells = boards[key];
                return (
                    <div key={index}>
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
                        <BidForm mediaId={key} />
                    </div>
                );
            })}
        </>
    );
};
