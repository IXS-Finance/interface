import React from 'react'
import { Flex } from 'rebass'
import _get from 'lodash/get'

import VotingRoundStats from './components/VotingRoundStats'
import { LiquidityPoolSelector } from './components/LiquidityPoolSelector'
import usePoolsHasGaugeQuery from 'hooks/dex-v2/queries/usePoolsHasGaugeQuery'
import DexV2Layout from '../common/Layout'
import SelectLockToVote from './components/SelectLockToVote'
import { VoteHistoryRecords } from './components/VoteHistoryRecords'
import useVoteInfoQuery from 'hooks/dex-v2/queries/useVoteInfoQuery'
import useVoteHistoriesQuery from 'hooks/dex-v2/queries/useVoteHistoriesQuery'
import useRewardOfPools from 'hooks/dex-v2/queries/useRewardOfPools'

interface VoteProps {}

const Vote: React.FC<VoteProps> = () => {
  const query = useVoteInfoQuery()
  const { data: poolsData } = usePoolsHasGaugeQuery()
  const { data: voteHistories } = useVoteHistoriesQuery()
  const { data: rewardOfPools } = useRewardOfPools(poolsData)

  const pools = poolsData?.pools || []
  const epochVoteEnd = _get(query, 'data.epochVoteEnd', null)
  const epochVoteStart = _get(query, 'data.epochVoteStart', null)
  const totalSupply = _get(query, 'data.totalSupply', null)
  const availableDeposit = _get(query, 'data.availableDeposit', null)
  const totalFees = _get(rewardOfPools, 'totalFees', null)
  const totalIncentivess = _get(rewardOfPools, 'totalIncentivess', null)
  const totalRewards = _get(rewardOfPools, 'totalRewards', null)

  return (
    <DexV2Layout>
      <Flex flexDirection="column" css={{ gap: '48px', width: '100%' }}>
        <VotingRoundStats
          epochVoteEnd={epochVoteEnd}
          totalSupply={totalSupply}
          availableDeposit={availableDeposit}
          totalFees={totalFees}
          totalIncentives={totalIncentivess}
          totalRewards={totalRewards}
          isLoading={query.isLoading}
        />
        <SelectLockToVote pools={pools} epochVoteStart={epochVoteStart} epochVoteEnd={epochVoteEnd} />
        <LiquidityPoolSelector pools={pools} />
        <VoteHistoryRecords pools={pools} data={voteHistories} />
      </Flex>
    </DexV2Layout>
  )
}

export default Vote
