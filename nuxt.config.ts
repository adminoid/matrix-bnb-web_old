// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
    modules: ['@nuxtjs/dotenv'],
    runtimeConfig: {
        public: {
            // CHAIN_ID: (process.env) ? process.env.CHAIN_ID : `0x61`,
            CHAIN_ID: `0x61`,
            // CHAIN_ID: `97`,
            // RPC_URL: (process.env) ?
            //     process.env.RPC_URL :
            //     'https://data-seed-prebsc-1-s1.binance.org:8545/',
            // RPC_URL: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
            RPC_URL: 'https://data-seed-prebsc-2-s3.binance.org:8545/',
            // RPC_URL: (process.env) ?
            //     process.env.RPC_URL :
            //     'https://data-seed-prebsc-2-s3.binance.org:8545/',
            CHAIN_NAME: 'Smart Chain - testnet',
            // CONTRACT_ADDRESS: '0x2636FdEa1D061Bc13C2fa51CEf2366bF291aa6a5',
            CONTRACT_ADDRESS: '0x2Ae22C2E2f5d90AD43e2001e1742B49F75eB0239',
            DECIMALS: 18,
        }
    },
    vite: {
        build: {
            target: 'esnext'
        }
    }
})
