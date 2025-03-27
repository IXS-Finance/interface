import React from 'react'
import { Flex } from 'rebass'

import VotingRoundStats from './components/VotingRoundStats'
import VotingCard from './components/VotingCard'
import { LiquidityPoolSelector } from './components/LiquidityPoolSelector'

interface VoteProps {}

const Vote: React.FC<VoteProps> = () => {
  return (
    <Flex flexDirection="column" mt="48px" css={{ gap: '48px', width: '100%' }}>
      <VotingRoundStats />
      <LiquidityPoolSelector />
      <VotingCard />
    </Flex>
  )
}

export default Vote
