import React from 'react';
import ReactDOM from 'react-dom';
import { RecoilRoot } from 'recoil';
import { Web3ReactProvider } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';

// @ts-ignore
import RecoilLogger from 'recoil-logger';

import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

function getLibrary(provider: any) {
    return new Web3Provider(provider);
}

ReactDOM.render(
    <React.StrictMode>
        <Web3ReactProvider getLibrary={getLibrary}>
            <RecoilRoot>
                <RecoilLogger />
                <App />
            </RecoilRoot>
        </Web3ReactProvider>
    </React.StrictMode>,
    document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
