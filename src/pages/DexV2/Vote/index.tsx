import React from 'react'
import VotingRoundStats from './components/VotingRoundStats'
import VotingCard from './components/VotingCard'
import { LiquidityPoolSelector } from './components/LiquidityPoolSelector'

interface VoteProps {}

const Vote: React.FC<VoteProps> = () => {
  return (
    <div>
      <VotingRoundStats />
      <LiquidityPoolSelector />
      <VotingCard />
    </div>
  )
}

export default Vote
