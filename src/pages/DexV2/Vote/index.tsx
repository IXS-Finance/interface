import React, { useEffect } from 'react'
import { Flex } from 'rebass'

import VotingRoundStats from './components/VotingRoundStats'
import VotingCard from './components/VotingCard'
import { LiquidityPoolSelector } from './components/LiquidityPoolSelector'
import usePoolsHasGaugeQuery from 'hooks/dex-v2/queries/usePoolsHasGaugeQuery'
import DexV2Layout from '../common/Layout'
import { VeSugar } from 'services/balancer/contracts/VeSugar'
import useWeb3 from 'hooks/dex-v2/useWeb3'

interface VoteProps {}

const Vote: React.FC<VoteProps> = () => {
  const veSugar = new VeSugar()
  const { account } = useWeb3()
  const {
    data: poolsData,
    isSuccess: poolsQuerySuccess,
    isLoading: poolsQueryLoading,
    isRefetching: poolsQueryRefetching,
    isError: poolsQueryError,
    refetch: refetchPools,
  } = usePoolsHasGaugeQuery()

  const pools = poolsData?.pools || []

  useEffect(() => {
    if (account) {
      veSugar.byAccount(account).then((data) => {
        console.log('data', JSON.stringify(data))
      })
    }
  }, [account])
  return (
    <DexV2Layout>
      <Flex flexDirection="column" mt="48px" css={{ gap: '48px', width: '100%' }}>
        <VotingRoundStats />
        <LiquidityPoolSelector pools={pools} />
        <VotingCard />
      </Flex>
    </DexV2Layout>
  )
}

export default Vote
