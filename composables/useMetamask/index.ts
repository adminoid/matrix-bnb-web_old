// import { useState } from '#app'
// import web3 from 'web3'

export default () => {
    const connectWallet = () => {
        console.info('connectWallet')
    }

    let reactiveVar = ref('initial')

    setTimeout(() => {
        reactiveVar.value = 'new value'
    }, 5000)

    return {
        connectWallet,
        reactiveVar,
    }
}
