import { FundManagement, SingleSwap, SwapType, SwapV2 } from '@ixswap1/dex-v2-sdk'
import { Vault__factory } from '@balancer-labs/typechain'
import { TransactionResponse } from '@ethersproject/abstract-provider'
import { ContractInterface } from '@ethersproject/contracts'
import { calculateValidTo } from '../cowswap/utils'
import ConfigService, { configService } from 'services/config/config.service'
import { getEthersSigner } from 'hooks/useEthersProvider'
import { wagmiConfig } from 'components/Web3Provider'
import { TransactionBuilder } from 'services/web3/transactions/transaction.builder'

export default class VaultService {
  abi: ContractInterface

  constructor(protected readonly config: ConfigService = configService) {
    this.abi = Vault__factory.abi
  }

  get address() {
    return this.config.network.addresses.vault
  }

  async getTransactionBuilder(): Promise<TransactionBuilder> {
    const getSigner = () => getEthersSigner(wagmiConfig)
    const signer = await getSigner()
    return new TransactionBuilder(signer)
  }

  public async swap(
    single: SingleSwap,
    funds: FundManagement,
    tokenOutAmount: string,
    transactionDeadline: number,
    options: Record<string, any> = {}
  ): Promise<TransactionResponse> {
    const txBuilder = await this.getTransactionBuilder()
    const deadline = calculateValidTo(transactionDeadline)

    return txBuilder.contract.sendTransaction({
      contractAddress: this.address,
      abi: this.abi,
      action: 'swap',
      params: [single, funds, tokenOutAmount, deadline],
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
    const txBuilder = await this.getTransactionBuilder()
    const deadline = calculateValidTo(transactionDeadline)

    return txBuilder.contract.sendTransaction({
      contractAddress: this.address,
      abi: this.abi,
      action: 'batchSwap',
      params: [swapKind, swaps, tokenAddresses, funds, limits, deadline],
      options,
    })
  }

  public async getInternalBalance(account: string, tokens: string[]): Promise<string[]> {
    const txBuilder = await this.getTransactionBuilder()

    return txBuilder.contract.callStatic({
      contractAddress: this.address,
      abi: this.abi,
      action: 'getInternalBalance',
      params: [account, tokens],
    })
  }

  public async manageUserBalance({
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
    const txBuilder = await this.getTransactionBuilder()

    return txBuilder.contract.sendTransaction({
      contractAddress: this.address,
      abi: this.abi,
      action: 'manageUserBalance',
      params: [[{ kind, asset, amount, sender, recipient }]],
    })
  }
}

export const vaultService = new VaultService()
