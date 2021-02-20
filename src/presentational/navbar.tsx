import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import classNames from 'classnames';
import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import { injected } from '../utils/connectors';
import { NotificationManager } from 'react-notifications';
export const Navbar = () => {
    const { activate, account, deactivate } = useWeb3React<Web3Provider>();
    const location = useLocation();

    const base = 'text-white px-3 py-2 rounded-md text-sm font-medium';
    const notPrimaryBase = ['text-gray-300 hover:bg-gray-700 hover:text-white'];
    const home = classNames(
        base,
        { 'bg-gray-900': location.pathname === '/' },
        location.pathname !== '/' ? notPrimaryBase : []
    );
    const editor = classNames(
        base,
        {
            'bg-gray-900': location.pathname === '/editor',
        },
        location.pathname !== '/editor' ? notPrimaryBase : []
    );
    const collection = classNames(
        base,
        {
            'bg-gray-900': location.pathname === '/collection',
        },
        location.pathname !== '/collection' ? notPrimaryBase : []
    );

    const connectWalletHandler = async () => {
        try {
            await activate(injected);
        } catch (e) {
            NotificationManager.error(JSON.stringify(e));
            console.error(e);
        }
    };
    const deactivateHandler = async () => {
        deactivate();
    };

    return (
        <>
            <nav className="bg-gray-800">
                <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
                    <div className="relative flex items-center justify-between h-16">
                        <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                            {/* Mobile menu button*/}
                            <button
                                type="button"
                                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                                aria-controls="mobile-menu"
                                aria-expanded="false"
                            >
                                <span className="sr-only">Open main menu</span>

                                <svg
                                    className="block h-6 w-6"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    aria-hidden="true"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                </svg>
                                <svg
                                    className="hidden h-6 w-6"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    aria-hidden="true"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                        <div className="flex-1 flex items-center justify-center sm:items-stretch sm:justify-start">
                            <div className="flex-shrink-0 flex items-center">
                                <img
                                    className="block lg:hidden h-8 w-auto"
                                    src="https://tailwindui.com/img/logos/workflow-mark-indigo-500.svg"
                                    alt="Workflow"
                                />
                                <img
                                    className="hidden lg:block h-8 w-auto"
                                    src="https://tailwindui.com/img/logos/workflow-logo-indigo-500-mark-white-text.svg"
                                    alt="Workflow"
                                />
                            </div>
                            <div className="hidden sm:block sm:ml-6">
                                <div className="flex space-x-4">
                                    <Link to={'/'} className={home}>
                                        home
                                    </Link>

                                    <Link to={'/editor'} className={editor}>
                                        editor
                                    </Link>

                                    <Link
                                        to={'/collection'}
                                        className={collection}
                                    >
                                        collection
                                    </Link>
                                </div>
                            </div>
                        </div>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                            {account ? (
                                <button
                                    className="font-bold py-2 px-4 rounded text-white bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-800 hover:to-pink-600"
                                    onClick={deactivateHandler}
                                >
                                    {account}
                                </button>
                            ) : (
                                <button
                                    className="font-bold py-2 px-4 rounded hover:bg-gray-700 text-white bg-gray-700 bg-gradient-to-r from-purple-600 to-pink-500 animate-pulse"
                                    onClick={connectWalletHandler}
                                >
                                    Connect to a wallet
                                </button>
                            )}
                        </div>
                    </div>
                </div>
                {/* Mobile menu, show/hide based on menu state. */}
                <div className="sm:hidden" id="mobile-menu">
                    <div className="px-2 pt-2 pb-3 space-y-1">
                        <a
                            href="#"
                            className="bg-gray-900 text-white block px-3 py-2 rounded-md text-base font-medium"
                        >
                            Dashboard
                        </a>
                        <a
                            href="#"
                            className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                        >
                            Team
                        </a>
                        <a
                            href="#"
                            className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                        >
                            Projects
                        </a>
                        <a
                            href="#"
                            className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                        >
                            Calendar
                        </a>
                    </div>
                </div>
            </nav>
        </>
    );
};
