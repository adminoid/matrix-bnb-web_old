import { defineNuxtPlugin } from '#app'
import { ethers } from 'ethers'
import Matrix from '~/contract/Matrix.json'

const makeContract = () => {
    const config = useRuntimeConfig()
    const provider = new ethers.providers.JsonRpcProvider()
    const Contract = new ethers.Contract(
        config.CONTRACT_ADDRESS,
        Matrix.abi,
        provider
    )
    console.log(Contract)
}

export default defineNuxtPlugin(() => {
    return {
        provide: {
            makeContract,
        }
    }
})
