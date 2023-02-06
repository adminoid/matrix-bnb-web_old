// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
    modules: ['@nuxtjs/dotenv'],
    runtimeConfig: {
        public: {
            // CHAIN_ID: (process.env) ? process.env.CHAIN_ID : `0x61`,

            CHAIN_ID: `0x61`, // testnet - 97 in decimal

            // hardhat localhost
            // CHAIN_ID: `31337`,
            // CHAIN_ID: `0x7A69`, // hardhat node
            // CHAIN_ID: `1337`,
            // CHAIN_ID: `97`,
            // RPC_URL: (process.env) ?
            //     process.env.RPC_URL :
            //     'https://data-seed-prebsc-1-s1.binance.org:8545/',

            // this testnet:
            RPC_URL: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
            // RPC_URL: 'https://data-seed-prebsc-2-s3.binance.org:8545/',

            // this localhost hardhat
            // RPC_URL: 'http://127.0.0.1:8545',

            // RPC_URL: (process.env) ?
            //     process.env.RPC_URL :
            //     'https://data-seed-prebsc-2-s3.binance.org:8545/',
            CHAIN_NAME: 'Smart Chain - testnet',
            // CONTRACT_ADDRESS: '0x2636FdEa1D061Bc13C2fa51CEf2366bF291aa6a5',

            // hardhat localhost:
            // CONTRACT_ADDRESS: '0x5fbdb2315678afecb367f032d93f642f64180aa3',

            // testnet bsc
            CONTRACT_ADDRESS: '0xB9d1d4Fb5d0B0F36f8B1626afAe978FF8d115b72',

            DECIMALS: 18,
        }
    },
    vite: {
        build: {
            target: 'esnext'
        }
    }
})
