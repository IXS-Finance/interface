import { FundManagement, SingleSwap, SwapType, SwapV2 } from '@ixswap1/dex-v2-sdk'
import { Vault__factory } from '@balancer-labs/typechain'
import { TransactionResponse } from '@ethersproject/abstract-provider'
import { ContractInterface } from '@ethersproject/contracts'
import { readContract, writeContract, simulateContract } from '@wagmi/core'

import { calculateValidTo } from '../cowswap/utils'
import ConfigService, { configService } from 'services/config/config.service'
import { wagmiConfig } from 'components/Web3Provider'

export default class VaultService {
  abi: ContractInterface

  constructor(protected readonly config: ConfigService = configService) {
    this.abi = Vault__factory.abi
  }

  get address() {
    return this.config.network.addresses.vault
  }

  public swap(
    single: SingleSwap,
    funds: FundManagement,
    tokenOutAmount: string,
    transactionDeadline: number,
    options: Record<string, any> = {}
  ): Promise<TransactionResponse> {
    const deadline = calculateValidTo(transactionDeadline)

    // @ts-ignore
    return writeContract(wagmiConfig, {
      // @ts-ignore
      address: this.address,
      // @ts-ignore
      abi: this.abi,
      functionName: 'swap',
      args: [single, funds, tokenOutAmount, deadline],
      options,
    })
  }

  public async batchSwap(
    swapKind: SwapType,
    swaps: SwapV2[],
    tokenAddresses: string[],
    funds: FundManagement,
    limits: string[],
    transactionDeadline: number,
    options: Record<string, any> = {}
  ): Promise<TransactionResponse> {
    const deadline = calculateValidTo(transactionDeadline)

    // @ts-ignore
    const { request } = await simulateContract(wagmiConfig, {
      // @ts-ignore
      abi: this.abi,
      // @ts-ignore
      address: this.address,
      functionName: 'batchSwap',
      args: [swapKind, swaps, tokenAddresses, funds, limits, deadline],
      // options,
    })

    // @ts-ignore
    return writeContract(wagmiConfig, request)
  }

  public getInternalBalance(account: string, tokens: string[]): Promise<string[]> {
    // @ts-ignore
    return readContract(wagmiConfig, {
      // @ts-ignore
      abi: this.abi,
      // @ts-ignore
      address: this.address,
      functionName: 'getInternalBalance',
      args: [account, tokens],
    })
  }

  public manageUserBalance({
    kind,
    asset,
    amount,
    sender,
    recipient,
  }: {
    kind: number
    asset: string
    amount: string
    sender: string
    recipient: string
  }): Promise<TransactionResponse> {
    // @ts-ignore
    return writeContract(wagmiConfig, {
      // @ts-ignore
      address: this.address,
      // @ts-ignore
      abi: this.abi,
      action: 'manageUserBalance',
      args: [[{ kind, asset, amount, sender, recipient }]],
    })
  }
}

export const vaultService = new VaultService()
