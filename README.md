# NFT Auction Market for Game of Life 
This project NFT Auction Market with [Zora Media Protocol](https://github.com/ourzora/core).

The Game of Life is
>`"The Game of Life, also known simply as Life, is a cellular automaton devised by the British mathematician John Horton Conway in 1970. It is a zero-player game, meaning that its evolution is determined by its initial state, requiring no further input. One interacts with the Game of Life by creating an initial configuration and observing how it evolves. It is Turing complete and can simulate a universal constructor or any other Turing machine.`” -wikipedia

## getting started
- access [testnet](https://lifegame-nft.web.app/)
- connect wallet
- You can bid any nfts on market.
- If owner accept bid or set ask, You can get it. 

## Available Scripts

In the project directory, you can run:

## How to develop
### `yarn`
First, execute it for the setup.

### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `yarn build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `yarn deploy:firebase:hosting`
If you logged in the firebase, you can deploy it.

### how to deploy contract
```bash
cd core
yarn
vi .env.bsc # write this.
# RPC_ENDPOINT=https://data-seed-prebsc-2-s1.binance.org:8545
# PRIVATE_KEY=<TYPE SECRET KEY HERE>
yarn build
yarn deploy:bsc-testnet
```

## introduction video

[comment]: <> (TODO youtube link)
