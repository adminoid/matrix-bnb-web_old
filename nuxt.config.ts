// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
    modules: ['@nuxtjs/dotenv'],
    runtimeConfig: {
        public: {
            // CHAIN_ID: (process.env) ? process.env.CHAIN_ID : `0x61`,

            // CHAIN_ID: `0x61`, // testnet - 97 in decimal

            // hardhat localhost
            CHAIN_ID: `0x7A69`, // hardhat node

            // CHAIN_ID: `1337`,
            // CHAIN_ID: `97`,
            // RPC_URL: (process.env) ?
            //     process.env.RPC_URL :
            //     'https://data-seed-prebsc-1-s1.binance.org:8545/',

            // this testnet:
            // RPC_URL: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
            // I don't sure what is it:
            // RPC_URL: 'https://data-seed-prebsc-2-s3.binance.org:8545/',

            // this localhost hardhat
            RPC_URL: 'http://127.0.0.1:8545',

            // RPC_URL: (process.env) ?
            //     process.env.RPC_URL :
            //     'https://data-seed-prebsc-2-s3.binance.org:8545/',
            CHAIN_NAME: 'HardHat Network',
            // CHAIN_NAME: 'Smart Chain - testnet',
            // CONTRACT_ADDRESS: '0x2636FdEa1D061Bc13C2fa51CEf2366bF291aa6a5',

            // hardhat localhost:
            CONTRACT_ADDRESS: '0x5fbdb2315678afecb367f032d93f642f64180aa3',

            // testnet bsc
            // todo: !important - update this
            // CONTRACT_ADDRESS: '0x4FF819B15Cfe2b70d309D87c5228eD22A64BEd32',

            // CURRENCY: {
            //     name: 'Binance Coin',
            //     symbol: 'BNB',
            //     decimals: 18,
            // },

            CURRENCY: {
                name: 'Hardhat coin',
                symbol: 'HH',
                decimals: 18,
            },
        }
    },
    vite: {
        build: {
            target: 'esnext'
        }
    }
})
