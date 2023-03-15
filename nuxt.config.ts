// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
    modules: ['@nuxtjs/dotenv'],
    runtimeConfig: {
        public: {
            // CHAIN_ID: (process.env) ? process.env.CHAIN_ID : `0x61`,


            // hardhat localhost
            // CHAIN_ID: `0x7A69`, // hardhat node
            CHAIN_ID: `0x61`, // testnet - 97 in decimal

            // RPC_URL: (process.env) ?
            //     process.env.RPC_URL :
            //     'https://data-seed-prebsc-1-s1.binance.org:8545/',

            // this testnet:
            RPC_URL: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
            // this localhost hardhat
            // RPC_URL: 'http://127.0.0.1:8545',

            // RPC_URL: (process.env) ?
            //     process.env.RPC_URL :
            //     'https://data-seed-prebsc-2-s3.binance.org:8545/',

            // CHAIN_NAME: 'HardHat Network',
            CHAIN_NAME: 'Smart Chain - testnet',

            // hardhat localhost:
            // CONTRACT_ADDRESS: '0x5fbdb2315678afecb367f032d93f642f64180aa3',
            // testnet bsc
            CONTRACT_ADDRESS: '0x9cfE614c5f8b2B851afceaDDE43609AFd55f989a',

            CURRENCY: {
                name: 'Binance Coin',
                symbol: 'BNB',
                decimals: 18,
            },
            // CURRENCY: {
            //     name: 'Hardhat coin',
            //     symbol: 'HNB',
            //     decimals: 18,
            // },
        }
    },
    vite: {
        build: {
            target: 'esnext'
        }
    }
})
