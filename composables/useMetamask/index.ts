// import Web3 from 'web3'
import { getGlobalThis } from "@vue/shared";

// todo:
//  - create state for metamask then export that

const throwError = (msg: string) => {
    // msg = "aaa\nfff"
    // if (typeof msg === 'string' && msg.indexOf("\n") !== -1) {
    //     let lines = msg.split('\n')
    //     lines.splice(0, 1)
    //     msg = JSON.parse(lines.join('\n')).message
    // }

    const { $emit } = useNuxtApp()
    $emit('error', msg)
}

// let web3Instance = reactive<any>({})

const checkMetamask = () => {
    if (!getGlobalThis().web3) throwError('Установите metamask!')
    else throwError('Metamask установлен!')
}

export function useMetamask() {
    return {
        checkMetamask,
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
