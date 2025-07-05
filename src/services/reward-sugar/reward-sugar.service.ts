import { Address } from 'viem'
import { FeeAndBribeVotingRewards, RewardSugar } from './reward-sugar.contract'

export class RewardSugarService {
  constructor(private readonly rewardSugar: RewardSugar) { }

  async getFeeAndBribeVotingRewards(pools: Address[], tokenId: string): Promise<FeeAndBribeVotingRewards> {
    return this.rewardSugar.getFeeAndBribeVotingRewardsForTokenIdAndPools(pools, tokenId)
  }
}