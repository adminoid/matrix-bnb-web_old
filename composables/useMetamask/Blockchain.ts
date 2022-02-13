import Web3 from 'web3'
import MatrixABI from './Matrix.json'

declare global {
    interface Window { ethereum: any; }
}

window.ethereum = window.ethereum || {}

const BlockChain = class {

    eth
    acc
    w3
    contract
    hash
    error
    confirmed

    throwError(msg) {
        if (typeof msg === 'string' && msg.indexOf("\n") !== -1) {
            let lines = msg.split('\n')
            lines.splice(0, 1)
            msg = JSON.parse(lines.join('\n')).message
        }
        this.error = {
            id: Symbol('error'),
            msg,
        }
        throw new Error(msg)
    }

    checkMetamask() {
        if (window.hasOwnProperty('ethereum')
            && window.ethereum !== undefined) {
            if (!this.eth) this.eth = window.ethereum
            if (!this.w3) this.w3 = new Web3(this.eth)
            return true
        } else {
            this.throwError('Установите metamask!')
        }
    }

    async setBSCNetwork() {
        try {
            // check if the chain to connect to is installed
            await this.eth.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: process.env.CHAIN_ID }],
            });
        } catch (e) {
            // This error code indicates that the chain has not been added to MetaMask
            // if it is not, then install it into the user MetaMask
            if (e.code === 4902) {
                try {
                    await this.eth.request({
                        method: 'wallet_addEthereumChain',
                        params: [
                            {
                                chainId: process.env.CHAIN_ID,
                                rpcUrl: process.env.RPC_URL,
                            },
                        ],
                    })
                } catch (e) {
                    this.throwError(e.message)
                }
            }
            this.throwError(e.message)
        }
    }

    async getWallet() {
        let accounts
        try {
            accounts = await this.eth.request({ method: 'eth_requestAccounts' }, e => {
                if (e) this.throwError(e.message)
            })
            this.acc = accounts[0]
            return this.acc
        } catch (e) {
            this.throwError(e.message)
        }
    }

    async checkContract() {
        if (!this.contract) {
            try {
                this.checkMetamask()
                await this.setBSCNetwork()
                await this.getWallet()
                this.contract = new this.w3.eth.Contract(MatrixABI, process.env.CONTRACT_ADDRESS)
            } catch (e) {
                this.throwError(e.message)
            }
        }
    }

    // async register(refId) {
    //     await this.checkContract()
    //     // check refId
    //     const ref = Number(refId || 1)
    //     let lastUser = await this.contract.methods.lastUserId().call()
    //     lastUser = Number(lastUser)
    //     if (ref > lastUser) {
    //         this.throwError('Неправильный реферальный код')
    //     }
    //
    //     if (this.acc) {
    //
    //         let price
    //         try {
    //             price = await this.contract.methods.getPrice().call()
    //         } catch (e) {
    //             this.throwError(e.message)
    //         }
    //
    //         const value = parseInt(price)
    //         let gas
    //         try {
    //             const estGas = await this.contract.methods._register(ref).estimateGas({
    //                 from: this.acc,
    //                 value,
    //             })
    //
    //             gas = parseInt(estGas)
    //
    //             await this.contract.methods._register(ref).send(
    //                 {
    //                     from: this.acc,
    //                     value,
    //                     gas,
    //                 },
    //                 (e, transactionHash) => {
    //                     if (!e) {
    //                         this.hash = transactionHash
    //                     } else {
    //                         this.throwError(e.message)
    //                     }
    //                 }
    //             )
    //         } catch (e) {
    //             this.throwError(e.message)
    //         }
    //     }
    // }

    // async checkRegistration(hash) {
    //     this.checkMetamask()
    //     await this.w3.eth.getTransactionReceipt(
    //         hash,
    //         (e) => {
    //             if (e) {
    //                 this.throwError(e.message)
    //             } else {
    //                 this.confirmed = hash
    //             }
    //         }
    //     )
    // }

    // async withdraw(amount) {
    //     try {
    //         await this.checkContract()
    //
    //         const estGas = await this.contract.methods.withdraw().estimateGas({
    //             from: this.acc,
    //             amount,
    //         })
    //
    //         const gas = parseInt(estGas)
    //
    //         await this.contract.methods.withdraw().send({
    //             from: this.acc,
    //             amount,
    //             gas,
    //         })
    //     } catch (e) {
    //         this.throwError(e.message)
    //     }
    // }

    // async upgradeMe() {
    //     try {
    //         await this.checkContract()
    //
    //         const estGas = await this.contract.methods.upgradeMe().estimateGas()
    //         const gas = parseInt(estGas)
    //
    //         await this.contract.methods.upgradeMe().send({ gas })
    //
    //     } catch (e) {
    //         this.throwError(e.message)
    //     }
    // }
}

export default BlockChain
