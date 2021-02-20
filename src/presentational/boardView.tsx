import React, { useState } from 'react';

import {
    constructBidShares,
    constructMediaData,
    generateMetadata,
    sha256FromBuffer,
    Zora,
} from '@zoralabs/zdk';
import { Web3Provider } from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core';
import IPFS from 'ipfs';

import {
    isRight,
    isBottom,
    setInitCellNeighbours,
    createBoardStatus,
    setInitCellId,
    setInitCellLive,
    restoreCellsFromIpfs,
} from '../utils/helper';
import { ContentData } from '../models';
import { TWButton } from './button';
import bsc from '../addresses/bsc-testnet.json';
import { uploadIpfs } from '../utils/ipfs';
import { NotificationManager } from 'react-notifications';
import firebase from 'firebase/app';

const reloadPage = (): void => window.location.reload();

type GenerateStyle = (
    cellSize: number,
    live: boolean,
    boardSize: number,
    index: number
) => React.CSSProperties;

const generateStyle: GenerateStyle = (cellSize, live, boardSize, index) => {
    const border = '1px solid rgba(0,0,0,0.3)';
    return {
        display: 'inline-block',
        width: `${boardSize > 50 ? cellSize / 2 : cellSize}px`,
        height: `${boardSize > 50 ? cellSize / 2 : cellSize}px`,
        margin: 0,
        padding: 0,
        lineHeight: 0,
        background: live ? 'rgb(84,188,92)' : 'rgba(0,0,0,0)',
        boxSizing: 'border-box',
        borderTop: border,
        borderLeft: border,
        borderRight: isRight(boardSize, index) ? border : 'none',
        borderBottom: isBottom(boardSize, index) ? border : 'none',
        boxShadow: live
            ? '0 0 5px rgb(84,188,92), 0 0 5px rgb(84,188,92), 0 0 5px rgb(84,188,92), 0 0 5px rgb(84,188,92)'
            : 'none',
    };
};

const Board = (props: BoardViewProps) => {
    const {
        boardSize,
        cellSize,
        boardStatus,
        start,
        stop,
        setCells,
        mode,
        isPlaying,
    } = props;

    const [bSize, setBoardSize] = useState(boardSize);
    const { library, chainId } = useWeb3React<Web3Provider>();

    const cellClickHandler = async (cell: Cell) => {
        const cs = [...boardStatus];
        const newCells = cs.map((c) => {
            return {
                ...c,
                live: c.id === cell.id ? !c.live : c.live,
            };
        });
        setCells(newCells);
    };

    const isEditor = mode === 'editor';
    // const isViewer = mode === 'viewer';

    const printHandler = async () => {
        const compressCells = boardStatus.map((cell) => {
            return {
                id: cell.id,
                live: cell.live,
            };
        });
        const output = {
            size: Math.sqrt(boardStatus.length),
            cells: compressCells,
        };
        const json = JSON.stringify(output);
        console.log(json);
    };

    const clearHandler = async () => {
        const newCells = boardStatus.map((c) => {
            return {
                ...c,
                live: false,
            };
        });

        setCells(newCells);
    };

    const mintHandler = async () => {
        if (!library || !chainId) return;

        if (isPlaying) {
            NotificationManager.error('stop game before mint');
            return;
        }

        const signer = library.getSigner();

        const zora = new Zora(signer, chainId, bsc.media, bsc.market);

        const metadataJSON = generateMetadata('zora-20210101', {
            description: '',
            mimeType: 'text/plain',
            name: '',
            version: 'zora-20210101',
        });

        const compressCells = boardStatus.map((cell) => {
            return {
                id: cell.id,
                live: cell.live,
            };
        });
        const output = {
            size: Math.sqrt(boardStatus.length),
            cells: compressCells,
        };
        const json = JSON.stringify(output);

        const contentHash = sha256FromBuffer(Buffer.from(json));
        const metadataHash = sha256FromBuffer(Buffer.from(metadataJSON));

        const node = await IPFS.create();
        const tokenURI = await uploadIpfs(json, node);
        const metadataURI = await uploadIpfs(metadataJSON, node);

        const mediaData = constructMediaData(
            tokenURI,
            metadataURI,
            contentHash,
            metadataHash
        );

        const bidShares = constructBidShares(
            10, // creator share
            90, // owner share
            0 // prevOwner share
        );
        const tx = await zora.mint(mediaData, bidShares);

        NotificationManager.info(tx.hash);
        console.log(tx.hash);

        await tx.wait(2);
        let maxMediaId = 0;

        try {
            // fetch maxMediaId
            for (let i = 0; i < 10000; i++) {
                await zora.fetchContentURI(i);
                maxMediaId += 1;
            }
        } catch (e) {
            const db = firebase.firestore();
            await db.collection('nfts').add({
                mediaId: maxMediaId,
                size: output.size,
                compressCells: output.cells,
            });
        }

        NotificationManager.success('success mint');
    };

    return (
        <div>
            {isEditor ? (
                <div>
                    <textarea
                        onChange={(val) => {
                            const eCells = JSON.parse(
                                val.currentTarget.value
                            ) as ContentData;

                            const cells = restoreCellsFromIpfs(eCells);
                            setCells(cells);
                        }}
                    />
                    <input
                        placeholder={'0 < boardSize < 100'}
                        onChange={(val) => {
                            const boardSize = parseInt(val.currentTarget.value);

                            if (boardSize > 100 || isNaN(boardSize)) {
                                alert(
                                    `boardSize is max(60). ${boardSize} is invalid.`
                                );
                                return;
                            }

                            const newStatus: Cell[] = createBoardStatus(
                                boardSize
                            ).map((cell: Cell, index: number) => ({
                                ...cell,
                                ...setInitCellId(index),
                                ...setInitCellLive(50),
                                ...setInitCellNeighbours(boardSize, index),
                            }));
                            setBoardSize(boardSize);
                            setCells(newStatus);
                        }}
                    />
                </div>
            ) : (
                <></>
            )}

            <div style={{ fontSize: 0 }}>
                {boardStatus.map(
                    (cell: Cell, index: number): React.ReactNode => (
                        <span key={cell.id}>
                            <i
                                style={generateStyle(
                                    cellSize,
                                    cell.live,
                                    bSize,
                                    index
                                )}
                                onClick={async () => {
                                    await cellClickHandler(cell);
                                }}
                            />
                            {isRight(bSize, index) && <br />}
                        </span>
                    )
                )}
            </div>

            <div className="p-4">
                <TWButton onClick={start}>start</TWButton>
                <TWButton onClick={reloadPage}>reload</TWButton>
                <TWButton onClick={stop}>stop</TWButton>
                {isEditor ? (
                    <>
                        <TWButton onClick={printHandler}>print</TWButton>
                        <TWButton onClick={clearHandler}>clearAll</TWButton>
                        <TWButton
                            className="hover:bg-blue-500"
                            onClick={mintHandler}
                        >
                            mint
                        </TWButton>
                    </>
                ) : (
                    <></>
                )}
            </div>
        </div>
    );
};

export default Board;
