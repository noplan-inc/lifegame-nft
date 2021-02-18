import React, { useState } from 'react';
import { Zora } from '@zoralabs/zdk';
import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';

import bsc from '../addresses/bsc-testnet.json';
import { useEffect } from 'react';
import { loadCellsFromContentUrl } from '../utils/loader';
import BoardView from '../presentational/boardView';
import Board from './board';

export const ListZora: React.FC<{}> = () => {
    const { library, chainId } = useWeb3React<Web3Provider>();

    const [boards, setBoards] = useState<Cell[][]>([]);

    useEffect(() => {
        async function f() {
            if (library === undefined || chainId === undefined) {
                return;
            }

            const signer = library.getSigner();

            const zora = new Zora(signer, chainId, bsc.media, bsc.market);

            const big = await zora.fetchTotalMedia();

            const _boards: Cell[][] = [];

            // 0, 1 => stash data
            for (let i = 2; i < 2 + big.toNumber(); i++) {
                const contentUrl = await zora.fetchContentURI(i);
                const cells = await loadCellsFromContentUrl(contentUrl);
                _boards.push(cells);
            }

            setBoards([..._boards]);
        }
        f();
    }, [library, chainId]);

    return (
        <>
            {boards.map((b, index) => {
                return (
                    <div key={index}>
                        <Board
                            mode={'viewer'}
                            intervalTime={500}
                            cellSize={20}
                            spawnRate={25}
                            boardSize={Math.sqrt(b.length)}
                            initStatus={b}
                            render={(props: BoardViewProps) => (
                                <BoardView {...props} />
                            )}
                        />
                    </div>
                );
            })}
        </>
    );
};
