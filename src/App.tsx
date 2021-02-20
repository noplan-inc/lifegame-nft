import React from 'react';
// @ts-ignore
import { Web3Provider } from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import { ethFetcher } from 'swr-eth';
import { SWRConfig } from 'swr';

import {
    NotificationContainer,
    NotificationManager,
} from 'react-notifications';

import { firebaseConfig } from './config/firebase';
import Board from './container/board';
import './App.css';
import BoardView from './presentational/boardView';
import { useEagerConnect, useInactiveListener } from './hooks';
import { injected } from './utils/connectors';
import { ListZora } from './container/zora';
import BEP20ABI from './abi/BEP20.abi.json';
import { Bep20 } from './addresses/bsc-testnet-bep20';

const ABIs = Object.values(Bep20).map((address) => {
    const abi = BEP20ABI as any;
    return [address, abi];
});

if (firebase.apps.length === 0) firebase.initializeApp(firebaseConfig);

function App() {
    const {
        connector,
        active,
        error,
        activate,
        setError,
        library,
    } = useWeb3React<Web3Provider>();

    const [activatingConnector, setActivatingConnector] = React.useState<any>();
    React.useEffect(() => {
        if (activatingConnector && activatingConnector === connector) {
            setActivatingConnector(undefined);
        }
    }, [activatingConnector, connector]);

    React.useEffect(() => {
        firebase
            .auth()
            .signInAnonymously()
            .catch((err) => {
                NotificationManager.error(JSON.stringify(err));
            });
    }, []);

    const triedEager = useEagerConnect();

    useInactiveListener(!triedEager || !!activatingConnector);

    return (
        <div className="App">
            {!active || !library ? (
                <div>
                    <button
                        onClick={async () => {
                            try {
                                await activate(injected);
                            } catch (e) {
                                NotificationManager.error(JSON.stringify(e));
                                console.error(e);
                            }
                        }}
                    >
                        wallet connect
                    </button>
                </div>
            ) : (
                <SWRConfig
                    value={{
                        fetcher: ethFetcher(
                            library, // @ts-ignore
                            new Map<string, any>(ABIs)
                        ),
                    }}
                >
                    <NotificationContainer />
                    <div>
                        {JSON.stringify({ active, error, activate, setError })}
                    </div>

                    <div>
                        <h2>editor</h2>
                        <Board
                            mode={'editor'}
                            intervalTime={500}
                            cellSize={20}
                            spawnRate={25}
                            boardSize={25}
                            render={(props: BoardViewProps) => (
                                <BoardView {...props} />
                            )}
                        />
                    </div>
                    <div>
                        <h2>market</h2>
                        <ListZora />
                    </div>
                </SWRConfig>
            )}
        </div>
    );
}

export default App;
