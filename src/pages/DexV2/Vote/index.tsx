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

interface VoteProps {}

const Vote: React.FC<VoteProps> = () => {
  const query = useVoteInfoQuery()

  const { data: poolsData } = usePoolsHasGaugeQuery()

  const pools = poolsData?.pools || []
  const epochVoteEnd = _get(query, 'data.epochVoteEnd', null)
  const epochVoteStart = _get(query, 'data.epochVoteStart', null)
  const totalSupply = _get(query, 'data.totalSupply', null)
  const availableDeposit = _get(query, 'data.availableDeposit', null)

  return (
    <DexV2Layout>
      <Flex flexDirection="column" css={{ gap: '48px', width: '100%' }}>
        <VotingRoundStats epochVoteEnd={epochVoteEnd} totalSupply={totalSupply} availableDeposit={availableDeposit} />
        <SelectLockToVote pools={pools} epochVoteStart={epochVoteStart} epochVoteEnd={epochVoteEnd} />
        <LiquidityPoolSelector pools={pools} />
        <VoteHistoryRecords pools={pools} />
      </Flex>
    </DexV2Layout>
  )
}

export default Vote
