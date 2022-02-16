import { defineNuxtPlugin } from '#app'
import { ethers } from 'ethers'
import Matrix from '~/contract/Matrix.json'
import { getGlobalThis } from "@vue/shared";

const globalThis = getGlobalThis()
const Ethereum = globalThis.ethereum

const prepareMetamask = async () => {
    try {
        await Ethereum.request({ method: 'eth_requestAccounts' })
        try {
            await setBSCNetwork()
        } catch (e) {
            throwError(e.message)
        }
    } catch (e) {
        throwError(e.message)
    }
}

const addNetwork = async () => {
    const config = useRuntimeConfig()

    try {
        const resp = await Ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
                {
                    chainId: config.CHAIN_ID,
                    chainName: config.CHAIN_NAME,
                    rpcUrls: [config.RPC_URL],
                    nativeCurrency: {
                        name: 'Binance Coin',
                        symbol: 'BNB',
                        decimals: 18,
                    }
                },
            ],
        })
        console.log(resp)
    } catch (e) {
        throwError(e.message)
    }
}

const setBSCNetwork = async () => {
    const config = useRuntimeConfig()

    try {
        // check if the chain to connect to is installed
        await Ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: config.CHAIN_ID }],
        })
    } catch (e) {
        // This error code indicates that the chain has not been added to MetaMask
        // if it is not, then install it into the user MetaMask
        if (e.code === 4902) {
            try {
                await addNetwork()
            } catch (e) {
                throwError(e.message)
            }
        }
    }
}

const throwError = (msg: string) => {
    useNuxtApp().$emit('error', msg)
}

const getContract = config => {
    const provider = new ethers.providers.JsonRpcProvider()
    return new ethers.Contract(
        config.CONTRACT_ADDRESS,
        // '0x403437EC55dA5d2aE6f7dE4e0E97BFb8f5CD548B',
        Matrix.abi,
        provider
    )
}

const depositBUSD = () => {
    console.info('depositBUSD...')
}

// const addBUSD = async () => {
//     const config = useRuntimeConfig()
//
//     try {
//         await ethereum.request({
//             method: 'wallet_watchAsset',
//             params: {
//                 type: 'ERC20',
//                 options: {
//                     address: config.BUSD_ADDRESS,
//                     symbol: config.BUSD_SYMBOL,
//                     image: config.BUSD_IMAGE,
//                     decimals: config.DECIMALS,
//                 },
//             },
//         })
//     } catch (e) {
//         throwError(e.message)
//     }
// }

// const addUSDT = async () => {
//     const config = useRuntimeConfig()
//
//     try {
//         await ethereum.request({
//             method: 'wallet_watchAsset',
//             params: {
//                 type: 'ERC20',
//                 options: {
//                     address: config.USDT_ADDRESS,
//                     symbol: config.USDT_SYMBOL,
//                     image: config.USDT_IMAGE,
//                     decimals: config.DECIMALS,
//                 },
//             },
//         })
//     } catch (e) {
//         throwError(e.message)
//     }
// }

export default defineNuxtPlugin(() => {
    return {
        provide: {
            SC: {
                Web3: globalThis.web3,
                getContract,
                throwError,
                depositBUSD,
                prepareMetamask,
            },
        }
    }
})
