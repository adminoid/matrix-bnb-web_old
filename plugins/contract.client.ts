import { defineNuxtPlugin } from '#app'
import Web3 from 'web3/dist/web3.min.js'
import Matrix from '~/contract/Matrix.json'
import BUSDAbi from '~/contract/BUSD.abi.json'
import USDTAbi from '~/contract/USDT.abi.json'
import { getGlobalThis } from "@vue/shared"

const globalThis = getGlobalThis()
const Ethereum = globalThis.ethereum

const web3 = new Web3(Web3.givenProvider || 'ws://localhost:8546')

class Config {
    private _instance
    constructor() {
        if (!Config._instance) {
            Config._instance = useRuntimeConfig()
        }
        return Config._instance
    }
}

class MatrixContract {
    private _instance
    constructor() {
        if (!MatrixContract._instance) {
            MatrixContract._instance = new web3.eth.Contract(
                Matrix.abi,
                new Config().CONTRACT_ADDRESS,
            )
        }
        return MatrixContract._instance
    }
}

class BUSDContract {
    private _instance
    constructor() {
        if (!BUSDContract._instance) {
            BUSDContract._instance = new web3.eth.Contract(
                BUSDAbi,
                new Config().BUSD_ADDRESS,
            )
        }
        return BUSDContract._instance
    }
}

class USDTContract {
    private _instance
    constructor() {
        if (!USDTContract._instance) {
            BUSDContract._instance = new web3.eth.Contract(
                USDTAbi,
                new Config().USDT_ADDRESS,
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

const depositBUSD = async _amount => {
    const amount = web3.utils.toBN(Number(_amount) * Math.pow(10, 18))
    const BUSDContractInstance = new BUSDContract()
    const MatrixContractInstance = new MatrixContract()
    const accounts = await Ethereum.request({ method: 'eth_requestAccounts' })
    try {
        const txHash = await BUSDContractInstance.methods.approve(
            MatrixContractInstance._address,
            amount
        ).send({ from: accounts[0] })
        try {
            const resp = await MatrixContractInstance.methods.depositBUSD(amount).send({
                from: accounts[0]
            })

            // todo: listen to events and show status
            console.log(resp)

        } catch (e) {
            throwError(e.message)
        }

    } catch (e) {
        console.error(e)
        throwError(e.message)
    }
}

const depositUSDT = async _amount => {
    const amount = web3.utils.toBN(Number(_amount) * Math.pow(10, 18))
    const USDTContractInstance = new USDTContract()
    const MatrixContractInstance = new MatrixContract()
    const accounts = await Ethereum.request({ method: 'eth_requestAccounts' })
    try {
        const txHash = await USDTContractInstance.methods.approve(
            MatrixContractInstance._address,
            amount
        ).send({ from: accounts[0] })
        try {
            const resp = await MatrixContractInstance.methods.depositUSDT(amount).send({
                from: accounts[0]
            })

            // todo: listen to events and show status
            console.log(resp)

        } catch (e) {
            throwError(e.message)
        }

    } catch (e) {
        console.error(e)
        throwError(e.message)
    }
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
        throwError('addBUSDToken is ok')
    } catch (e) {
        throwError(e.message)
    }
}

const addUSDTToken = async () => {
    try {
        await Ethereum.request({
            method: 'wallet_watchAsset',
            params: {
                type: 'ERC20',
                options: {
                    address: new Config().USDT_ADDRESS,
                    symbol: new Config().USDT_SYMBOL,
                    image: new Config().USDT_IMAGE,
                    decimals: new Config().DECIMALS,
                },
            },
        })
        throwError('addUSDTToken is ok')
    } catch (e) {
        throwError(e.message)
    }
}

export default defineNuxtPlugin(() => {
    return {
        provide: {
            SC: {
                Web3: globalThis.web3,
                Ethereum,
                throwError,
                depositBUSD,
                depositUSDT,
                prepareMetamask,
                addBUSDToken,
                addUSDTToken,
            },
        }
    }
})
