import { formatUnits } from '@ethersproject/units'

import VeSugarV2Abi from 'lib/abi/VeSugarV2.json'
import { configService } from 'services/config/config.service'
import { rpcProviderService } from 'services/rpc-provider/rpc-provider.service'
import { walletService as walletServiceInstance } from 'services/web3/wallet.service'
import { EthersContract, getEthersContract } from 'dependencies/EthersContract'
import { LP_SUGAR_ADDRESS } from 'constants/addresses'
import { TransactionBuilder } from 'services/web3/transactions/transaction.builder'
import { getEthersSigner } from 'hooks/useEthersProvider'
import { wagmiConfig } from 'components/Web3Provider'
import { BigNumber } from 'ethers'

export type LockedData = {
  id: string
  amount: string
  votingAmount: string
  expiresAt: string
  decimals: number
  votedAt: string
  token: string
  votes: { lp: string, weight: BigNumber }[]
}
export class VeSugar {
  instance: EthersContract

  constructor(
    private readonly provider = rpcProviderService.jsonProvider,
    private readonly abi = VeSugarV2Abi,
    private readonly config = configService,
    private readonly walletService = walletServiceInstance
  ) {
    const Contract = getEthersContract()
    // @ts-ignore
    this.instance = new Contract(LP_SUGAR_ADDRESS[config.network.key], this.abi, this.provider)
  }

  async getTransactionBuilder(): Promise<TransactionBuilder> {
    const getSigner = () => getEthersSigner(wagmiConfig)
    const signer = await getSigner()
    return new TransactionBuilder(signer)
  }

  async byAccount(address: string): Promise<LockedData[]> {
    const output = await this.instance.byAccount(address)

    const result = output.map((item: any) => ({
      id: item.id.toString(),
      amount: formatUnits(item.amount, item.decimals),
      votingAmount: formatUnits(item.votingAmount, item.decimals),
      expiresAt: item.expiresAt.toString(),
      votedAt: item.votedAt.toString(),
      decimals: item.decimals,
      token: item.token,
      votes: item.votes,
    }))

    return result || []
  }

  async byId(id: string): Promise<LockedData> {
    const output = await this.instance.byId(id)
    return {
      id: output.id.toString(),
      amount: formatUnits(output.amount, output.decimals),
      votingAmount: formatUnits(output.votingAmount, output.decimals),
      expiresAt: output.expiresAt.toString(),
      votedAt: output.votedAt.toString(),
      decimals: output.decimals,
      token: output.token,
      votes: output.votes,
    }
  }
}
