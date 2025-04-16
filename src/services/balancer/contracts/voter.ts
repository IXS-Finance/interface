import { BigNumber } from '@ethersproject/bignumber'
import { TransactionResponse } from '@ethersproject/providers'

import voterAbi from 'abis/voterABI.json'
import { configService } from 'services/config/config.service'
import { rpcProviderService } from 'services/rpc-provider/rpc-provider.service'
import { walletService as walletServiceInstance } from 'services/web3/wallet.service'
import { EthersContract, getEthersContract } from 'dependencies/EthersContract'
import { TransactionBuilder } from 'services/web3/transactions/transaction.builder'
import { getEthersSigner } from 'hooks/useEthersProvider'
import { wagmiConfig } from 'components/Web3Provider'

export type RewardTokenData = {
  distributor: string
  integral: BigNumber
  last_update: BigNumber
  period_finish: BigNumber
  rate: BigNumber
  token: string
}
export class Voter {
  instance: EthersContract

  constructor(
    private readonly provider = rpcProviderService.jsonProvider,
    private readonly abi = voterAbi,
    private readonly config = configService,
    private readonly walletService = walletServiceInstance
  ) {
    const Contract = getEthersContract()
    // @ts-ignore
    this.instance = new Contract(configService.network.addresses.voter, this.abi, this.provider)
  }

  async getTransactionBuilder(): Promise<TransactionBuilder> {
    const getSigner = () => getEthersSigner(wagmiConfig)
    const signer = await getSigner()
    return new TransactionBuilder(signer)
  }

  async vote(tokenId: any, poolVote: any, weights: any): Promise<TransactionResponse> {
    const txBuilder = await this.getTransactionBuilder()

    const res = await txBuilder.contract.sendTransaction({
      contractAddress: configService.network.addresses.voter,
      abi: this.abi,
      action: 'vote',
      params: [tokenId, poolVote, weights],
    })

    return res
  }
}
