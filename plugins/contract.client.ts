import { defineNuxtPlugin } from "#app"
import Web3 from 'web3/dist/web3.min.js'
import CoreJson from '~/contracts/Core.sol/Core.json'
import { getGlobalThis } from "@vue/shared"

export default defineNuxtPlugin(() => {

    const globalThis = getGlobalThis()
    const Ethereum = globalThis.ethereum
    const web3 = new Web3(Web3.givenProvider || 'ws://localhost:8546')

    class Config {
        private static _instance: any
        CONTRACT_ADDRESS: string;
        CHAIN_ID: string;
        CHAIN_NAME: string;
        RPC_URL: string;
        DECIMALS: string;
        constructor() {
            if (!Config._instance) {
                Config._instance = useRuntimeConfig()
            }
            return Config._instance
        }
    }

    class CoreContract {
        private static _instance: any
        constructor() {
            if (!CoreContract._instance) {
                web3.eth.handleRevert = true
                CoreContract._instance = new web3.eth.Contract(
                    CoreJson.abi,
                    new Config().CONTRACT_ADDRESS,
                )
            }
            return CoreContract._instance
        }
        methods: any
        _address: string
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

    const CoreContractInstance = new CoreContract()

    const registerWhose = async (whose) => {
        console.info("registerWhose start")
        const accounts = await Ethereum.request({ method: 'eth_requestAccounts' })
        try {
            emitDisabled(`registerWhose`, true)
            // todo: check allowance before approve
            try {

                console.log(whose)

                const gas = await CoreContractInstance
                    .methods.register(whose)
                    .estimateGas({ from: accounts[0] })

                const resp = await CoreContractInstance
                    .methods.register(whose).send({
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
            emitDisabled(`registerWhose`, false)
        }
    }

    const sendBnb = async (amount) => {
        const accounts = await Ethereum.request({ method: 'eth_requestAccounts' })
        try {
            emitDisabled(`sendBnb`, true)
            // todo: check allowance before approve
            try {
                const resp = await web3.eth.sendTransaction({
                    from: accounts[0],
                    to: new Config().CONTRACT_ADDRESS,
                    value: web3.toWei(amount, "ether")
                });

                // todo: listen to events and show status
                console.log(resp)

            } catch (e) {
                throwError(e.message)
            }

        } catch (e) {
            throwError(e.message)
        } finally {
            emitDisabled(`sendBnb`, false)
        }
    }

    return {
        provide: {
            SC: {
                Web3: globalThis.web3,
                Ethereum,
                throwError,
                prepareMetamask,
                registerWhose,
                sendBnb,
            },
        }
    }
})
