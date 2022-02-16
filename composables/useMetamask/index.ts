import { getGlobalThis } from "@vue/shared"

const globalThis = getGlobalThis()
const Ethereum = globalThis.ethereum

const throwError = (msg: string) => {
    useNuxtApp().$emit('error', msg)
}

const setBSCNetwork = async () => {
    const config = useRuntimeConfig()

    try {
        // check if the chain to connect to is installed
        await globalThis.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: config.CHAIN_ID }],
        })
    } catch (e) {
        // This error code indicates that the chain has not been added to MetaMask
        // if it is not, then install it into the user MetaMask
        if (e.code === 4902) {
            try {
                await globalThis.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [
                        {
                            chainId: config.CHAIN_ID,
                            rpcUrl: config.RPC_URL,
                        },
                    ],
                })
            } catch (e) {
                throwError(e.message)
            }
        }
        throwError(e.message)
    }
}

export function useMetamask() {
    const isOk = ref(false)

    onMounted(async () => {

        console.info('onMounted')

        isOk.value = false
        if (globalThis.web3) {
            isOk.value = true
        } else {
            throwError('Установите metamask!')
            return
        }

        Ethereum.request({ method: 'eth_requestAccounts' }).catch(e => {
            throwError(e.message)
        })
    })

    return {
        isOk,
        setBSCNetwork,
    }
}

// // check wallet from metamask
// this.bc.checkMetamask()
// await this.bc.setBSCNetwork()
// session.wallet = await this.bc.getWallet()
// if (session.wallet !== 'undefined') {
//     // this.wallet = session.wallet
//     this.authorize()
// }
