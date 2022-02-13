import { useState } from '#app'
// import web3 from 'web3'

export const useBlockchain = _ => {
    console.info('useBlockchain')
    // console.log(ctx)
    // console.log(web3)
    return ref('test01')
}

export const makeBlockchainProps = () => ({
    bc: {
        type: String,
        default: "ttt"
    }
})
