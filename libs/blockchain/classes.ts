import { getGlobalThis } from '@vue/shared'
import Web3 from 'web3/dist/web3.min.js'
import {
  TCurrency,
  ICommon, IExternal, INetwork
} from '~/libs/blockchain/types'
import CoreJson from '~/contracts/Core.sol/Core.json'
import { useNuxtApp } from '#app'

class Config {
  private static _instance: any
  CONTRACT_ADDRESS: string;
  CHAIN_ID: string;
  CHAIN_NAME: string;
  RPC_URL: string;
  CURRENCY: TCurrency;
  constructor() {
    if (!Config._instance) {
      Config._instance = useRuntimeConfig()
    }
    return Config._instance
  }
}

class CoreContract {
  private static _instance: any
  methods: any
  constructor(web3, contractAddress) {
    if (!CoreContract._instance) {
      web3.eth.handleRevert = true
      CoreContract._instance = new web3.eth.Contract(
        CoreJson.abi,
        contractAddress,
      )
    }
    return CoreContract._instance
  }
}

class Common implements ICommon {
  Nuxt
  Ethereum
  Web3
  Config
  Accounts
  Core
  constructor () {
    this.Nuxt = useNuxtApp()
    this.Ethereum = getGlobalThis().ethereum
    this.Web3 = new Web3(this.Ethereum)
    this.Config = new Config()
    this.Core = new CoreContract(this.Web3, this.Config.CONTRACT_ADDRESS)
  }
  EmitDisabled (type: string, status: boolean) {
    this.Nuxt.$emit('disabled', {
      type,
      status,
    })
    this.Ethereum.methods()
  }
  ThrowAlert (type: string, error: any) {
    let message = error
    // only for error messages
    if (
      type === 'danger'
      && typeof error === 'string'
      && error.includes('reverted with reason string')
    ) {
        message = error.match(/transaction:\s(.+?)"/)[1]
    }
    this.Nuxt.$emit('alert', {
      type,
      message,
    })
  }
}

class Network extends Common implements INetwork {
  private checkInstalledMetamask (): boolean {
    return Boolean(this.Ethereum && this.Ethereum.isMetaMask);
  }
  async setNetwork (): Promise<void> {
    if (!this.checkInstalledMetamask()) {
      this.ThrowAlert('danger', 'Metamask is not installed!')
    }
    try {
      // check if the chain that for connect to is installed
      await this.Ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: this.Config.CHAIN_ID }],
      })
    } catch (e) {
      // This error code indicates that the chain has not been added to MetaMask
      // if it is not, then install it into the user MetaMask
      if (e.code === 4902) {
        await this.addNetwork()
      } else {
        this.ThrowAlert('danger', e.message)
      }
    }
  }
  private async addNetwork (): Promise<void> {
    try {
      await this.Ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: this.Config.CHAIN_ID,
            chainName: this.Config.CHAIN_NAME,
            rpcUrls: [this.Config.RPC_URL],
            nativeCurrency: this.Config.CURRENCY,
          },
        ],
      })
    } catch (e) {
      this.ThrowAlert('danger', e.message)
    }
  }
}

function disableWhile() {
  console.log("disableWhile(): factory evaluated")
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    console.log("disableWhile(): called")
    console.log(target, propertyKey, descriptor)
  }
}

export class External extends Network implements IExternal {
  @disableWhile()
  async connect (): Promise<void> {
    this.EmitDisabled('connect', true)
    await this.setNetwork()
    try {
      this.Accounts = await this.Ethereum.request({ method: 'eth_requestAccounts' })
    } catch (e) {
      this.ThrowAlert('danger', e.message)
    } finally {
      this.EmitDisabled('connect', false)
    }
  }
  async disconnect (): Promise<void> {
    this.EmitDisabled('disconnect', false)
    try {
      await this.Ethereum.request({
        method: "wallet_requestPermissions",
        params: [
          {
            eth_accounts: {}
          }
        ]
      });
      // await this.Ethereum.request({
      //   method: "eth_requestAccounts",
      //   params: [{eth_accounts: {}}]
      // })
    } catch (e) {
      this.ThrowAlert('danger', e.message)
    } finally {
      this.EmitDisabled('disconnect', false)
    }
  }

  async getCoreUser (wallet: string): Promise<void> {
    if (this.Accounts && this.Accounts.length < 1) {
      this.ThrowAlert('danger', 'Please connect Metamask')
    } else {
      try {
        this.EmitDisabled(`getCoreUser`, true)
        const resp = await this.Core
          .methods.getUserFromCore(wallet)
          .call({
            from: this.Accounts[0].wallet,
            // to: new Config().CONTRACT_ADDRESS,
          })
        // display resp in web interface
        let msg
        if (!resp.isValue) {
          msg = `user ${wallet} is not registered`
        } else {
          msg = `
getCoreUser() method response:
claims: ${this.Web3.utils.fromWei(resp.claims, "ether")} BNB
gifts: ${this.Web3.utils.fromWei(resp.gifts, "ether")} BNB
level: ${resp.level}
whose: ${resp.whose}
`
        }
        this.ThrowAlert('primary', msg)
      } catch (e) {
        this.ThrowAlert('danger', e.message)
      } finally {
        this.EmitDisabled(`getCoreUser`, false)
      }
    }
  }
  async getMatrixUser (level: number | string, wallet: string): Promise<void> {
    try {
      this.EmitDisabled(`getMatrixUser`, true)
      const resp = await this.Core
        .methods.getUserFromMatrix(level, wallet)
        .call({
          from: this.Accounts[0],
          to: new Config().CONTRACT_ADDRESS,
        })

      // todo: display resp in web interface
      let msg
      if (!resp.isValue) {
        msg = `user ${wallet} is not registered`
      } else {
        msg = `
getMatrixUser() method response:
number: ${resp.index}
parent: ${resp.parent}
isRight: ${resp.isRight}
plateau: ${resp.plateau}
`
      }
      this.ThrowAlert('primary', msg)
    } catch (e) {
      this.ThrowAlert('danger', e.message)
    } finally {
      this.EmitDisabled(`getMatrixUser`, false)
    }
  }

  async registerWhose (whose: string): Promise<void> {
    try {
      this.EmitDisabled(`registerWhose`, true)
      // todo: check allowance before approve
      const value = await this.Core.methods
        .payUnit()
        .call({
          from: this.Accounts[0],
        });
      const resp = await this.Core
      .methods.register(whose).send({
        from: this.Accounts[0],
        value,
        // gasLimit: 5000000, // not required
        gas: 300000, // 274633
      })

      // display resp in web interface
      const msg = `
registerWhose() method params:
FROM: ${resp.from}
TO: ${resp.to}
GAS: ${resp.gasUsed}
TX: ${resp.transactionHash}
`
      this.ThrowAlert('success', msg)
    } catch (e) {
      this.ThrowAlert('danger', e.message)
    } finally {
      this.EmitDisabled(`registerWhose`, false)
    }
  }
  async withdrawClaim (amount: number | string): Promise<void> {
    this.EmitDisabled(`withdrawClaim`, true)
    try {
      const resp = await this.Core.methods
        .withdrawClaim(this.Web3.utils.toWei(amount, "ether"))
        .send({
          from: this.Accounts[0],
          gasLimit: 310000, // not required
        });
      // from - address for withdrawing
      // gasUsed - used gas
      const msg = `
withdrawClaim() method params:
FROM: ${resp.from}
AMOUNT: ${amount}
GAS: ${resp.gasUsed}
TX: ${resp.transactionHash}
`
      this.ThrowAlert('success', msg)
    } catch (e) {
      this.ThrowAlert('danger', e.message)
    } finally {
      this.EmitDisabled(`withdrawClaim`, false)
    }
  }
  async sendBnb (amount: string | number): Promise<void> {}
  async withdrawTen (): Promise<void> {}
}
