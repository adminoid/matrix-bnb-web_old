import { defineNuxtPlugin } from "#app"
import Web3 from 'web3/dist/web3.min.js'
import CoreJson from '~/contracts/Core.sol/Core.json'
import { getGlobalThis } from "@vue/shared"

export default defineNuxtPlugin(() => {

    // globalThis.web3 = new Web3(Web3.givenProvider || 'ws://localhost:8546')
    // globalThis.web3 = new Web3(Web3.givenProvider || 'ws://localhost:8545')

    class MetamaskStuff {
        Eth
        wallet
        web3
        constructor() {
            if (!this.Eth) {
                const globalThis = getGlobalThis()
                this.Eth = globalThis.ethereum
            }
            if (!this.web3) {
                this.web3 = new Web3(this.Eth)
            }
        }
        async connectWallet() {
            // console.info("before eth_requestAccounts")
            const accounts = await this.Eth.request({ method: 'eth_requestAccounts' })
            // console.log(this.Eth)
            this.wallet = accounts[0]
            // console.info("after eth_requestAccounts")
            // console.log(this.wallet)
        }
        async reconnectWallet() {
            // console.info("reconnectWallet()...")
            // await this.Eth.request({
            //     method: "eth_requestAccounts",
            //     params: [{eth_accounts: {}}]
            // })

            const accounts = await this.Eth.request({
                method: "wallet_requestPermissions",
                params: [{
                    eth_accounts: {}
                }]
            })

            this.Eth.request({
                method: 'eth_requestAccounts'
            })

            this.wallet = accounts[0]
        }
    }

    const MSI = new MetamaskStuff()

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
                MSI.web3.eth.handleRevert = true
                CoreContract._instance = new MSI.web3.eth.Contract(
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
        // todo: below line should connect Metamask wallet to site, but don't work
        // await Ethereum.request({ method: 'eth_requestAccounts' });
        try {
            emitDisabled('prepareMetamask', true)
            // await MSI.reconnectWallet()
            //
            // console.info("W")
            // console.log(MSI.wallet)

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
            await MSI.Eth.request({
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
            const resp = await MSI.Eth.request({
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
        // console.info("registerWhose start")

        try {
            emitDisabled(`registerWhose`, true)
            // todo: check allowance before approve
            try {
                // const value = await CoreContractInstance.methods.payUnit.send({
                //     from: MSI.wallet,
                // });
                // CoreContractInstance.methods.payUnit().call().then(function (res) {console.log(res)})

                // const value = await CoreContractInstance.payUnit()
                await MSI.connectWallet()
                // console.warn("MSI.wallet 2", MSI.wallet)
                const value = await CoreContractInstance.methods
                    .payUnit()
                    .call({
                        from: MSI.wallet,
                    });

                // console.info("payUnit value:")
                // console.log(value)
                // console.log(value.toString())

                // console.log(value)
                const resp = await CoreContractInstance
                    .methods.register(whose).send({
                        from: MSI.wallet,
                        value,
                        // gasLimit: 210000, // not required
                    })

                // todo: display resp in web interface
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
        // console.warn("am:", amount.value)
        try {
            emitDisabled(`sendBnb`, true)
            // todo: check allowance before approve
            try {
                await MSI.connectWallet()
                const resp = await MSI.web3.eth.sendTransaction({
                    from: MSI.wallet,
                    to: new Config().CONTRACT_ADDRESS,
                    value: MSI.web3.utils.toWei(amount, "ether")
                });

                // todo: display resp in web interface
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

    const getCoreUser = async (userWallet) => {
        try {
            emitDisabled(`getCoreUser`, true)
            await MSI.connectWallet()

            console.info("core-----", MSI.wallet)

            const resp = await CoreContractInstance
                .methods.getUserFromCore(userWallet)
                .call({
                    from: MSI.wallet,
                    // to: new Config().CONTRACT_ADDRESS,
                })

            // todo: display resp in web interface
            console.log(resp)

        } catch (e) {
            throwError(e.message)
        } finally {
            emitDisabled(`getCoreUser`, false)
        }
    }

    const getMatrixUser = async (level, userWallet) => {
        console.info("getMatrixUser()")
        try {
            emitDisabled(`getMatrixUser`, true)
            try {
                await MSI.connectWallet()
                const resp = await CoreContractInstance
                    .methods.getUserFromMatrix(level, userWallet)
                    .call({
                        from: MSI.wallet,
                        to: new Config().CONTRACT_ADDRESS,
                    })

                // todo: display resp in web interface
                console.log(resp)

            } catch (e) {
                throwError(e.message)
            }

        } catch (e) {
            throwError(e.message)
        } finally {
            emitDisabled(`getMatrixUser`, false)
        }
    }

    return {
        provide: {
            SC: {
                MSI: MSI,
                throwError,
                prepareMetamask,
                registerWhose,
                sendBnb,
                getCoreUser,
                getMatrixUser,
            },
        }
    }
})
