import RewardSugarABI from 'lib/abi/RewardSugarABI.json'
import { configService } from 'services/config/config.service'
import { rpcProviderService } from 'services/rpc-provider/rpc-provider.service'
import { EthersContract, getEthersContract } from 'dependencies/EthersContract'
import { BigNumber } from 'ethers'
import { Address } from 'viem'

type TokensPerPool = Address[]
type feePerPool = BigNumber[]
type bribePerPool = BigNumber[]

export type FeeAndBribeVotingRewards = {
  tokens: TokensPerPool[]
  feeRewards: feePerPool[]
  bribeRewards: bribePerPool[]
}

export class RewardSugar {
  instance: EthersContract

  constructor(private readonly provider = rpcProviderService.jsonProvider, private readonly abi = RewardSugarABI) {
    const Contract = getEthersContract()
    // @ts-ignore
    this.instance = new Contract(configService.network.addresses.rewardSugar, this.abi, this.provider)
  }

  async getFeeAndBribeVotingRewardsForTokenIdAndPools(
    pools: Address[],
    tokenId: string
  ): Promise<FeeAndBribeVotingRewards> {
    const output = await this.instance.getFeeAndBribeVotingRewardsForTokenIdAndPools(pools, tokenId)

    return output || {}
  }
}
