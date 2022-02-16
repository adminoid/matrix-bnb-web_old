import { defineNuxtConfig } from 'nuxt3'

// https://v3.nuxtjs.org/docs/directory-structure/nuxt.config
export default defineNuxtConfig({
    buildModules: [
        '@nuxtjs/dotenv'
    ],
    publicRuntimeConfig: {
        // CHAIN_ID: (process.env) ? process.env.CHAIN_ID : `0x61`,
        // CHAIN_ID: `0x61`,
        CHAIN_ID: `97`,
        // RPC_URL: (process.env) ?
        //     process.env.RPC_URL :
        //     'https://data-seed-prebsc-1-s1.binance.org:8545/',
        // RPC_URL: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
        RPC_URL: 'https://data-seed-prebsc-2-s3.binance.org:8545/',
        // RPC_URL: (process.env) ?
        //     process.env.RPC_URL :
        //     'https://data-seed-prebsc-2-s3.binance.org:8545/',
        CHAIN_NAME: 'Smart Chain - testnet',
        BUSD_ADDRESS: '0xeD24FC36d5Ee211Ea25A80239Fb8C4Cfd80f12Ee',
        BUSD_SYMBOL: 'BUSD',
        BUSD_IMAGE: 'https://cryptologos.cc/logos/binance-usd-busd-logo.svg',
        USDT_ADDRESS: '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd',
        USDT_SYMBOL: 'USDT',
        USDT_IMAGE: 'https://cryptologos.cc/logos/tether-usdt-logo.svg',
        DECIMALS: 18,
    },
})
