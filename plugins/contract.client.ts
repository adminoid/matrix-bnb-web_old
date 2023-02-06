import { defineNuxtPlugin } from "#app"
import Web3 from 'web3/dist/web3.min.js'
import CoreJson from "../contracts/Core.sol/Core.json";
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
            const accounts = await this.Eth.request({ method: 'eth_requestAccounts' })
            this.wallet = accounts[0]
        }
        async reconnectWallet() {
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
            await setBSCNetwork()
        } catch (e) {
            throwAlert('danger', e.message)
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
                    throwAlert('danger', e.message)
                }
            } else {
                throwAlert('danger', e.message)
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
            throwAlert('danger', e.message)
        }
    }

    const throwAlert = (type: string, message: string) => {
        if (type === 'danger' && typeof message === 'string' && message.indexOf("\n") !== -1) {
            let lines = message.split('\n')
            lines.splice(0, 1)
            message = JSON.parse(lines.join('\n')).message
        }
        useNuxtApp().$emit('alert', {
            type,
            message,
        })
    }

    const emitDisabled = (cause: string, disabled: boolean) => {
        useNuxtApp().$emit('disabled', {
            cause,
            disabled,
        })
    }

    const CoreContractInstance = new CoreContract()

    const registerWhose = async (whose) => {
        try {
            emitDisabled(`registerWhose`, true)
            // todo: check allowance before approve
            try {
                await MSI.connectWallet()
                const value = await CoreContractInstance.methods
                    .payUnit()
                    .call({
                        from: MSI.wallet,
                    });
                const resp = await CoreContractInstance
                    .methods.register(whose).send({
                        from: MSI.wallet,
                        value,
                        // gasLimit: 210000, // not required
                    })

                // todo: display resp in web interface
                const msg = `
registerWhose() method params:
FROM: ${resp.from}
TO: ${resp.to}
GAS: ${resp.gasUsed}
TX: ${resp.transactionHash}

`
                throwAlert('success', msg)

            } catch (e) {
                throwAlert('danger', e.message)
            }

        } catch (e) {
            throwAlert('danger', e.message)
        } finally {
            emitDisabled(`registerWhose`, false)
        }
    }

    const sendBnb = async (amount) => {
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
                const msg = `
sendBnb() method params:
FROM: ${resp.from}
TO: ${resp.to}
GAS: ${resp.gasUsed}
TX: ${resp.transactionHash}

`
                throwAlert('success', msg)

                // todo: format message here...
                // throwAlert('', e.message)

            } catch (e) {
                throwAlert('danger', e.message)
            }

        } catch (e) {
            throwAlert('danger', e.message)
        } finally {
            emitDisabled(`sendBnb`, false)
        }
    }

    const getCoreUser = async (userWallet) => {
        try {
            emitDisabled(`getCoreUser`, true)
            await MSI.connectWallet()
            const resp = await CoreContractInstance
                .methods.getUserFromCore(userWallet)
                .call({
                    from: MSI.wallet,
                    // to: new Config().CONTRACT_ADDRESS,
                })

            // display resp in web interface
            let msg
            if (!resp.isValue) {
                msg = `user ${userWallet} is not response`
            } else {
                msg = `
getCoreUser() method response:
claims: ${resp.claims}
gifts: ${resp.gifts}
level: ${resp.level}
whose: ${resp.whose}

`
            }
            throwAlert('primary', msg)
        } catch (e) {
            throwAlert('danger', e.message)
        } finally {
            emitDisabled(`getCoreUser`, false)
        }
    }

    const getMatrixUser = async (level, userWallet) => {
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
                let msg
                if (!resp.isValue) {
                    msg = `user ${userWallet} is not registered`
                } else {
                    msg = `
getMatrixUser() method response:
index: ${resp.index}
isRight: ${resp.isRight}
length: ${resp.length}
parent: ${resp.parent}
plateau: ${resp.plateau}

`
                }
                throwAlert('primary', msg)


            } catch (e) {
                throwAlert('danger', e.message)
            }

        } catch (e) {
            throwAlert('danger', e.message)
        } finally {
            emitDisabled(`getMatrixUser`, false)
        }
    }

    return {
        provide: {
            SC: {
                MSI: MSI,
                throwAlert,
                prepareMetamask,
                registerWhose,
                sendBnb,
                getCoreUser,
                getMatrixUser,
            },
        }
    }
})
