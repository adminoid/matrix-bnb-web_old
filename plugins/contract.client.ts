import { defineNuxtPlugin } from '#app'
// import { ethers } from 'ethers'
import Web3 from 'web3/dist/web3.min.js'
import Matrix from '~/contract/Matrix.json'
import BUSDAbi from '~/contract/BUSD.abi.json'
import USDTAbi from '~/contract/USDT.abi.json'
import { getGlobalThis } from "@vue/shared"

const globalThis = getGlobalThis()
const Ethereum = globalThis.ethereum
let accounts = false

console.log(Web3.givenProvider)

const web3 = new Web3(Web3.givenProvider || 'ws://localhost:8546')

console.log(web3)

class Config {
    private _instance
    constructor() {
        if (!Config._instance) {
            Config._instance = useRuntimeConfig()
        }
        return Config._instance
    }
}

class Provider {
    private _instance
    constructor() {
        if (!Provider._instance) {
            Provider._instance = new ethers.providers.JsonRpcProvider()
        }
        return Provider._instance
    }
}

class MatrixContract {
    private _instance
    constructor() {
        if (!MatrixContract._instance) {
            MatrixContract._instance = new ethers.Contract(
                new Config().CONTRACT_ADDRESS,
                Matrix.abi,
                new Provider(),
            )
        }
        return MatrixContract._instance
    }
}

class BUSDContract {
    private _instance
    constructor() {
        if (!BUSDContract._instance) {
            BUSDContract._instance = new ethers.Contract(
                new Config().BUSD_ADDRESS,
                BUSDAbi,
                new Provider(),
            )
        }
        return BUSDContract._instance
    }
}

class USDTContract {
    private _instance
    constructor() {
        if (!USDTContract._instance) {
            USDTContract._instance = new ethers.Contract(
                new Config().USDT_ADDRESS,
                USDTAbi,
                new Provider(),
            )
        }
        return USDTContract._instance
    }
}

// Check Metamask, get accounts and setBSCNetwork (with addNetwork fallback)
const prepareMetamask = async () => {
    try {
        try {
            await setBSCNetwork()
            accounts = await Ethereum.request({ method: 'eth_requestAccounts' })
        } catch (e) {
            throwError(e.message)
        }
    } catch (e) {
        throwError(e.message)
    }
}

const setBSCNetwork = async () => {
    try {
        // check if the chain to connect to is installed
        await Ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: new Config().CHAIN_ID }],
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

const addNetwork = async () => {
    try {
        const resp = await Ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
                {
                    chainId: new Config().CHAIN_ID,
                    chainName: new Config().CHAIN_NAME,
                    rpcUrls: [new Config().RPC_URL],
                    nativeCurrency: {
                        name: 'Binance Coin',
                        symbol: 'BNB',
                        decimals: 18,
                    }
                },
            ],
        })
    } catch (e) {
        throwError(e.message)
    }
}

const throwError = (msg: string) => {
    useNuxtApp().$emit('error', msg)
}

const depositBUSD = async amount => {
    // console.log(new Provider() === new Provider())
    // console.log(new MatrixContract() === new MatrixContract())
    // console.log(new BUSDContract() === new BUSDContract())
    // console.log(new USDTContract() === new USDTContract())

    console.log(accounts[0], amount)

    // try {
    //     await addBUSDToken()
    // } catch (e) {
    //     throwError(e.message)
    // }
    // console.info('BUSD token added')

    const BUSDContractInstance = new BUSDContract()
    const MatrixContractInstance = new MatrixContract()

    console.log(MatrixContractInstance)

    BUSDContractInstance.approve(MatrixContractInstance.address, amount).send({
            from: accounts[0]
        },
        function(err, transactionHash) {
            console.log(transactionHash)
        })
}

const addBUSDToken = async () => {
    try {
        await Ethereum.request({
            method: 'wallet_watchAsset',
            params: {
                type: 'ERC20',
                options: {
                    address: new Config().BUSD_ADDRESS,
                    symbol: new Config().BUSD_SYMBOL,
                    image: new Config().BUSD_IMAGE,
                    decimals: new Config().DECIMALS,
                },
            },
        })
    } catch (e) {
        throwError(e.message)
    }
}

// const addUSDTToken = async () => {
//     try {
//         await ethereum.request({
//             method: 'wallet_watchAsset',
//             params: {
//                 type: 'ERC20',
//                 options: {
//                     address: new Config().USDT_ADDRESS,
//                     symbol: new Config().USDT_SYMBOL,
//                     image: new Config().USDT_IMAGE,
//                     decimals: new Config().DECIMALS,
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
                Ethereum,
                throwError,
                depositBUSD,
                prepareMetamask,
            },
        }
    }
})
