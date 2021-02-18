import React from 'react';
// @ts-ignore
import Board from './container/board';
import './App.css';
import BoardView from './presentational/boardView';
import { Web3Provider } from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core';
import { useEagerConnect, useInactiveListener } from './hooks';

import { injected } from './utils/connectors';
import { ListZora } from './container/zora';

function App() {
    const {
        connector,
        active,
        error,
        activate,
        setError,
    } = useWeb3React<Web3Provider>();

    const [activatingConnector, setActivatingConnector] = React.useState<any>();
    React.useEffect(() => {
        if (activatingConnector && activatingConnector === connector) {
            setActivatingConnector(undefined);
        }
    }, [activatingConnector, connector]);

    const triedEager = useEagerConnect();

    useInactiveListener(!triedEager || !!activatingConnector);

    return (
        <div className="App">
            <div>
                connected: {JSON.stringify(triedEager)}, account:{' '}
                {JSON.stringify({ active, error, activate, setError })}
            </div>
            <div>
                <button
                    onClick={() => {
                        activate(injected).then();
                    }}
                >
                    connect
                </button>
            </div>
            <div>
                <h2>editor</h2>
                <Board
                    mode={'editor'}
                    intervalTime={500}
                    cellSize={20}
                    spawnRate={25}
                    boardSize={25}
                    render={(props: BoardViewProps) => <BoardView {...props} />}
                />
            </div>
            <div>
                <h2>market</h2>
                <ListZora />
            </div>
        </div>
    );
}

export default App;
