import { defineNuxtConfig } from 'nuxt3'

// https://v3.nuxtjs.org/docs/directory-structure/nuxt.config
export default defineNuxtConfig({
    buildModules: [
        '@nuxtjs/dotenv'
    ],
    publicRuntimeConfig: {
        // CHAIN_ID: (process.env) ? process.env.CHAIN_ID : `0x61`,
        CHAIN_ID: `0x61`,
        // RPC_URL: (process.env) ?
        //     process.env.RPC_URL :
        //     'https://data-seed-prebsc-1-s1.binance.org:8545/',
        RPC_URL: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
        // RPC_URL: (process.env) ?
        //     process.env.RPC_URL :
        //     'https://data-seed-prebsc-2-s3.binance.org:8545/',
    },
})
