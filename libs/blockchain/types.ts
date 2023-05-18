import Web3 from 'web3'

export type TCurrency = {
  name: string,
  symbol: string,
  decimals: number,
}

// export type TAlert = {
//   type: string,
//   message: string,
// }

// type TDisabled = {
//   cause: string,
//   is: boolean,
// }

export interface IExternal {
  // technical methods
  connect(): Promise<void>
  disconnect(): Promise<void>

  // info methods
  getCoreUser(wallet: string): Promise<void>
  getMatrixUser(level: number|string, wallet: string): Promise<void>

  // interaction methods
  registerWhose(whose: string): Promise<void>
  withdrawClaim(amount: number | string): Promise<void>
  sendBnb(amount: string|number): Promise<void>
  withdrawTen(): Promise<void>
}

export interface INetwork {
  setNetwork(): Promise<void>
}

export interface ICommon {
  // alerts: TAlert[]
  // disabled: TDisabled
  Nuxt: any
  Ethereum: any
  Web3: Web3
  Config: any
  Core: any
  Accounts: any[]
  EmitDisabled(type: string, status: boolean)
  ThrowAlert(type: string, error: any)
}
