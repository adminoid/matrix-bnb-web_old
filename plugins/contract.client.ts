// import { defineNuxtPlugin } from "#app"
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
            web3.eth.handleRevert = true
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
            web3.eth.handleRevert = true
            BUSDContract._instance = new web3.eth.Contract(
                JSON.parse(BUSDAbi),
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
            web3.eth.handleRevert = true
            USDTContract._instance = new web3.eth.Contract(
                JSON.parse(USDTAbi),
                new Config().USDT_ADDRESS,
            )
        }
        return USDTContract._instance
    }
}

const Contracts = {
    Matrix: {},
    BUSD: {},
    USDT: {},
}

// Check Metamask, get accounts and setBSCNetwork (with addNetwork fallback)
const prepareMetamask = async () => {
    try {
        emitDisabled('prepareMetamask', true)
        await setBSCNetwork()
    } catch (e) {
        throwError(e.message)
    } finally {
        emitDisabled('prepareMetamask', false)
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
        } else {
            throwError(e.message)
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
    if (typeof msg === 'string' && msg.indexOf("\n") !== -1) {
        let lines = msg.split('\n')
        lines.splice(0, 1)
        msg = JSON.parse(lines.join('\n')).message
    }
    useNuxtApp().$emit('error', msg)
}

const emitDisabled = (cause: string, disabled: boolean) => {
    useNuxtApp().$emit('disabled', {
        cause,
        disabled,
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
    } catch (e) {
        throwError(e.message)
    }
}

const deposit = async (_amount, currency) => {
    const amount = web3.utils.toBN(Number(_amount) * Math.pow(10, 18))
    // web3.utils.toWei(1, 'ether')  // 1 ETH == 10^18 wei
    const accounts = await Ethereum.request({ method: 'eth_requestAccounts' })
    try {
        emitDisabled(`deposit${currency}`, true)
        // todo: check allowance before approve

        switch (currency) {
            case 'BUSD':
                Contracts.BUSD = new BUSDContract()
                break
            case 'USDT':
                Contracts.USDT = new USDTContract()
                break
            default:
                throwError(`Contract ${currency} is not supported`)
                return
        }

        Contracts.Matrix = new MatrixContract()

        const gas = await Contracts[currency].methods.approve(
            Contracts['Matrix']._address,
            amount
        ).estimateGas({ from: accounts[0] })

        const txHash = await Contracts[currency].methods.approve(
            Contracts['Matrix']._address,
            amount
        ).send({
            from: accounts[0],
            gas,
        })

        try {
            const gas = await Contracts['Matrix']
                .methods[`deposit${currency}`](amount)
                .estimateGas({ from: accounts[0] })

            const resp = await Contracts['Matrix']
                .methods[`deposit${currency}`](amount).send({
                from: accounts[0],
                gas,
            })

            // todo: listen to events and show status
            console.log(resp)

        } catch (e) {
            throwError(e.message)
        }

    } catch (e) {
        throwError(e.message)
    } finally {
        emitDisabled(`deposit${currency}`, false)
    }
}

const withdraw = async (_amount, currency) => {
    const amount = web3.utils.toBN(Number(_amount) * Math.pow(10, 18))
    const accounts = await Ethereum.request({ method: 'eth_requestAccounts' })
    try {
        emitDisabled(`withdraw${currency}`, true)

        Contracts.Matrix = new MatrixContract()

        const gas = await Contracts['Matrix']
            .methods[`withdraw${currency}`](amount)
            .estimateGas({ from: accounts[0] })

        try {
            const resp = await Contracts['Matrix'].methods[`withdraw${currency}`](amount).send({
                from: accounts[0],
                gas,
            }, function (e, txHash){
                if (e) {
                    throwError(e.message)
                } else {
                    console.log(txHash)
                }
            })

            // todo: listen to events and show status
            console.log(resp)

        } catch (e) {
            throwError(e.message)
        }

    } catch (e) {
        throwError(e.message)
    } finally {
        emitDisabled(`withdraw${currency}`, false)
    }
}

export default defineNuxtPlugin(() => {
    return {
        provide: {
            SC: {
                Web3: globalThis.web3,
                Ethereum,
                throwError,
                prepareMetamask,
                addBUSDToken,
                addUSDTToken,
                deposit,
                withdraw,
            },
        }
    }
})
