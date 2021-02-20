import React from 'react';
// @ts-ignore
import { Web3Provider } from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import { ethFetcher } from 'swr-eth';
import { SWRConfig } from 'swr';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';

import {
    NotificationContainer,
    NotificationManager,
} from 'react-notifications';

import { firebaseConfig } from './config/firebase';

import './App.css';

import { useEagerConnect, useInactiveListener } from './hooks';
import { injected } from './utils/connectors';

import BEP20ABI from './abi/BEP20.abi.json';
import { Bep20 } from './addresses/bsc-testnet-bep20';
import { Home } from './pages/home';
import { Editor } from './pages/editor';
import { Collection } from './pages/collection';

const ABIs = Object.values(Bep20).map((address) => {
    const abi = BEP20ABI as any;
    return [address, abi];
});

if (firebase.apps.length === 0) firebase.initializeApp(firebaseConfig);

function App() {
    const {
        connector,
        active,
        activate,
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
            <Router>
                {!active || !library ? (
                    <div>
                        <button
                            onClick={async () => {
                                try {
                                    await activate(injected);
                                } catch (e) {
                                    NotificationManager.error(
                                        JSON.stringify(e)
                                    );
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
                        <nav>
                            <ul>
                                <li>
                                    <Link to={'/'}>home</Link>
                                </li>
                                <li>
                                    <Link to={'/editor'}>editor</Link>
                                </li>
                                <li>
                                    <Link to={'/collection'}>Collection</Link>
                                </li>
                            </ul>
                        </nav>
                        <NotificationContainer />
                        <Switch>
                            <Route exact path={'/'}>
                                <Home />
                            </Route>
                            <Route path={'/editor'}>
                                <Editor />
                            </Route>
                            <Route path={'/collection'}>
                                <Collection />
                            </Route>
                        </Switch>
                    </SWRConfig>
                )}
            </Router>
        </div>
    );
}

export default App;
