import React from 'react'
import { Flex } from 'rebass'

import VotingRoundStats from './components/VotingRoundStats'
import { LiquidityPoolSelector } from './components/LiquidityPoolSelector'
import usePoolsHasGaugeQuery from 'hooks/dex-v2/queries/usePoolsHasGaugeQuery'
import DexV2Layout from '../common/Layout'
import SelectLockToVote from './components/SelectLockToVote'
import { VoteHistoryRecords } from './components/VoteHistoryRecords'

interface VoteProps {}

const Vote: React.FC<VoteProps> = () => {
  const {
    data: poolsData,
    isSuccess: poolsQuerySuccess,
    isLoading: poolsQueryLoading,
    isRefetching: poolsQueryRefetching,
    isError: poolsQueryError,
    refetch: refetchPools,
  } = usePoolsHasGaugeQuery()

  const pools = poolsData?.pools || []

  console.log('pools', pools)
  return (
    <DexV2Layout>
      <Flex flexDirection="column" css={{ gap: '48px', width: '100%' }}>
        <VotingRoundStats />
        <SelectLockToVote pools={pools} />
        <LiquidityPoolSelector pools={pools} />
        <VoteHistoryRecords pools={pools} />
      </Flex>
    </DexV2Layout>
  )
}

export default Vote
