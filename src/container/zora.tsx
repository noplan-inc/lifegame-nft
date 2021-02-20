import React, { useState } from 'react';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import firebase from 'firebase/app';

// import bsc from '../addresses/bsc-testnet.json';
import { useEffect } from 'react';

import BoardView from '../presentational/boardView';
import Board from './board';
import { BidForm } from './bid';
import { NFT } from '../models';
import { restoreCellsFromFirestore } from '../utils/helper';

// type BoardTable = { [key: string]: Cell[] };
type BoardTables = { [key: string]: NFT };

// export const ListZora: React.FC<{}> = () => {
//     const { library, chainId } = useWeb3React<Web3Provider>();
//
//     const [boards, setBoards] = useState<BoardTable>({});
//
//     useEffect(() => {
//         async function f() {
//             if (library === undefined || chainId === undefined) {
//                 return;
//             }
//
//             const signer = library.getSigner();
//
//             const zora = new Zora(signer, chainId, bsc.media, bsc.market);
//
//             const big = await zora.fetchTotalMedia();
//
//             const newBoards = { ...boards };
//
//             // 0, 1 => stash data
//             for (let i = 2; i < 2 + big.toNumber(); i++) {
//                 const contentUrl = await zora.fetchContentURI(i);
//                 const cells = await loadCellsFromContentUrl(contentUrl);
//
//                 newBoards[i.toString()] = cells;
//             }
//
//             setBoards(newBoards);
//         }
//
//         f();
//     }, [library, chainId]);
//
//     return (
//         <>
//             {Object.keys(boards).map((key, index) => {
//                 const cells = boards[key];
//                 return (
//                     <div key={index}>
//                         <Board
//                             mode={'viewer'}
//                             intervalTime={500}
//                             cellSize={20}
//                             spawnRate={25}
//                             boardSize={Math.sqrt(cells.length)}
//                             initStatus={cells}
//                             render={(props: BoardViewProps) => (
//                                 <BoardView {...props} />
//                             )}
//                         />
//                         <BidForm mediaId={key} />
//                     </div>
//                 );
//             })}
//         </>
//     );
// };

export const ListZora: React.FC<{}> = () => {
    const [nfts, loading, error] = useCollectionData<NFT>(
        firebase.firestore().collection('nfts'),
        { idField: 'documentId' }
    );
    const [boards, setBoards] = useState<BoardTables>({});

    useEffect(() => {
        async function f() {
            if (!nfts) return;
            const newBoards = { ...boards };

            nfts.forEach((nft) => {
                const cells = restoreCellsFromFirestore(nft);

                newBoards[nft.mediaId.toString()] = {
                    ...nft,
                    rawCells: cells,
                };
            });

            setBoards(newBoards);
        }

        f();
    }, [nfts]);

    if (loading) {
        return (
            <>
                <p>loading...</p>
            </>
        );
    }

    if (error) {
        return <p>error: {JSON.stringify(error)}</p>;
    }

    return (
        <>
            {Object.keys(boards).map((key, index) => {
                const b = boards[key];
                const cells = b.rawCells;
                if (!cells) return <p>cloud not load cells</p>;

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
                        <BidForm nft={b} />
                    </div>
                );
            })}
        </>
    );
};
