import { BigNumber } from '@ethersproject/bignumber'
import { formatUnits } from '@ethersproject/units'

import VeSugarV2Abi from 'lib/abi/VeSugarV2.json'
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
    this.instance = new Contract('0xD995BFf833aA5bd5E81F200D70aB40afc4572B0e', this.abi, this.provider)
  }

  async getTransactionBuilder(): Promise<TransactionBuilder> {
    const getSigner = () => getEthersSigner(wagmiConfig)
    const signer = await getSigner()
    return new TransactionBuilder(signer)
  }

  async byAccount(address: string): Promise<any> {
    const output = await this.instance.byAccount(address)
    console.log('output', output)

    const result = output.map((item: any) => ({
      id: item.id.toString(),
      amount: formatUnits(item.amount, item.decimals),
      votingAmount: formatUnits(item.votingAmount, item.decimals),
      expiresAt: item.expiresAt.toString(),
      decimals: item.decimals,
    }))

    return result || []
  }
}
