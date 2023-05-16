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
                this.web3.eth.handleRevert = true
            }
        }
        async connectWallet() {
            const accounts = await this.Eth.request({ method: 'eth_requestAccounts' })
            this.wallet = accounts[0]
        }
        async reconnectWallet() {
            try {
                const accounts = await this.Eth.request({
                    method: "wallet_requestPermissions",
                    params: [{
                        eth_accounts: {}
                    }]
                })

                this.Eth.request({
                    method: 'eth_requestAccounts'
                })

                const walletsArray = accounts[0]?.caveats[0]?.value
                this.wallet = walletsArray[0]

                throwAlert('primary', `Wallet: ${this.wallet} connected`)
            } catch (e) {
                throwAlert('danger', e.message)
            }
        }
    }

    const MSI = new MetamaskStuff()

    type CurrencyType = {
        name: string,
        symbol: string,
        decimals: number,
    }

    class Config {
        private static _instance: any
        CONTRACT_ADDRESS: string;
        CHAIN_ID: string;
        CHAIN_NAME: string;
        RPC_URL: string;
        CURRENCY: CurrencyType;
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
        // connectWallet
        await MSI.connectWallet()
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
                        nativeCurrency: new Config().CURRENCY,
                    },
                ],
            })
        } catch (e) {
            throwAlert('danger', e.message)
        }
    }

    const throwAlert = (type: string, msg: string) => {
        let message = msg
        // only for error messages
        if (type === 'danger' && typeof msg === 'string') {
            if (msg.includes('reverted with reason string')) {
                message = msg.match(/transaction:\s(.+?)"/)[1]
            }
            else if (msg.includes('version=address')) {
                message = msg
            }
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
                // gasLimit: 5000000, // not required
                gas: 300000, // 274633
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
        } finally {
            emitDisabled(`registerWhose`, false)
        }
    }

    const withdrawClaim = async (amount) => {
        console.info("c.c.ts withdrawClaim")
        console.log("amount:", amount)
        console.log("amount:", Number(amount))
        console.log("towei:", MSI.web3.utils.toWei(amount, "ether"))
        // console.log("towei:", ethers.utils.formatEther)
        try {
            emitDisabled(`withdrawClaim`, true)
            try {
                await MSI.connectWallet()
                const resp = await CoreContractInstance.methods
                .withdrawClaim(MSI.web3.utils.toWei(amount, "ether"))
                .send({
                    from: MSI.wallet,
                    // gasLimit: 210000, // not required
                });

                console.log(resp)

                // from - address for withdrawing
                // gasUsed - used gas
                // todo: display resp in web interface
                const msg = `
withdrawClaim() method params:
FROM: ${resp.from}
AMOUNT: ${amount}
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

    const withdrawTen = async () => {
        emitDisabled(`withdrawTen`, true)
        try {
            await MSI.connectWallet()

            console.info("MSI.web3.handleRevert:")
            console.log(MSI.web3.handleRevert)

            const resp = await CoreContractInstance.methods
            .getTenPercentOnceYear()
              // .call()
              .send({
                    from: MSI.wallet,
                    gasLimit: 210000, // not required
                }
                // ,(err, tx) => {
                //     if (tx){
                //         console.log("it's ok")
                //     }
                //     if (err) {
                //         console.log(err)
                //     }
                // }

              )
            // .catch(e => console.log('1084:', e))
            // .on('error', (err, receipt) => {
            //     console.log("err.message =",err.message);
            //     console.log("receipt =", receipt);
            // });
            // .catch(revertReason => console.log({ revertReason }))

            console.dir(resp);
            // console.dir(MSI.web3.utils.fromWei(resp, "ether"))

            throwAlert('success', resp)

        } catch (e) {
            throwAlert('danger', e.message)
        } finally {
            emitDisabled(`withdrawTen`, false)
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
                msg = `user ${userWallet} is not registered`
            } else {
                msg = `
getCoreUser() method response:
claims: ${MSI.web3.utils.fromWei(resp.claims, "ether")} BNB
gifts: ${MSI.web3.utils.fromWei(resp.gifts, "ether")} BNB
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
number: ${resp.index}
parent: ${resp.parent}
isRight: ${resp.isRight}
plateau: ${resp.plateau}

`
            }
            throwAlert('primary', msg)


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
                withdrawClaim,
                sendBnb,
                withdrawTen,
                getCoreUser,
                getMatrixUser,
            },
        }
    }
})
