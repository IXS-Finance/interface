import { useQuery } from '@tanstack/react-query'
import { RewardSugarService } from 'services/reward-sugar/reward-sugar.service'
import { Address } from 'viem'
import { FeeAndBribeVotingRewards, RewardSugar } from 'services/reward-sugar/reward-sugar.contract'

export default function useVotingQuery(pools: Address[], tokenId: string) {
  const rewardSugar = new RewardSugar()

  const { data, isLoading, refetch } = useQuery<FeeAndBribeVotingRewards>({
    queryKey: ['voting-rewards', pools, tokenId],
    queryFn: () => new RewardSugarService(rewardSugar).getFeeAndBribeVotingRewards(pools, tokenId),
    enabled: !!pools.length && !!tokenId,
  })

  return {
    data,
    isLoading,
    refetch,
  }
}
