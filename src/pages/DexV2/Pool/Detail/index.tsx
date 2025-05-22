import React from 'react'
import { useParams } from 'react-router-dom'
import styled from 'styled-components'

import LoadingBlock from '../../common/LoadingBlock'
import { usePool } from 'state/dexV2/pool/usePool'
import useWeb3 from 'hooks/dex-v2/useWeb3'
import { useTokens } from 'state/dexV2/tokens/hooks/useTokens'
import { tokenTreeLeafs, usePoolHelpers, orderedPoolTokens } from 'hooks/dex-v2/usePoolHelpers'
import usePoolAprQuery from 'hooks/dex-v2/queries/usePoolAprQuery'
import { includesAddress } from 'lib/utils'
import { PoolToken } from 'services/pool/types'
import MyPoolBalancesCard from './components/MyPoolBalancesCard'
import PoolPageHeader from './components/PoolPageHeader'
import DexV2Layout from '../../common/Layout'
import { Box, Flex } from 'rebass'
import BalCard from 'pages/DexV2/common/Card'
import PoolStatCards from './components/PoolStatCards'
import { isQueryLoading } from 'hooks/dex-v2/queries/useQueryHelpers'
import PoolCompositionCard from './components/PoolCompositionCard'
import StakingCard from '../Staking/StakingCard'
import PoolChart from './components/PoolCharts'

const PoolDetail: React.FC = () => {
  const params = useParams<any>()
  const poolId = (params.id as string).toLowerCase()
  const { pool, isLoadingPool } = usePool(poolId)
  const { isWalletReady } = useWeb3()
  const { prices } = useTokens()
  const priceQueryLoading = false // TODO: implement
  const { isStableLikePool } = usePoolHelpers(pool)

  const loadingPool = isLoadingPool || !pool

  const aprQuery = usePoolAprQuery(poolId)
  const loadingApr = isQueryLoading(aprQuery)
  const poolApr = aprQuery.data

  const missingPrices = (() => {
    if (pool && prices && !priceQueryLoading) {
      const tokensWithPrice = Object.keys(prices)
      const tokens = pool.tokens ? tokenTreeLeafs(pool.tokens) : []
      return !tokens.every((token) => includesAddress(tokensWithPrice, token))
    }
    return false
  })()

  // const isStakablePool = POOLS.Stakable.VotingGaugePools.includes(poolId) || POOLS.Stakable.AllowList.includes(poolId)
  const isStakablePool = true

  const titleTokens: PoolToken[] = pool?.tokens ? orderedPoolTokens(pool, pool.tokens) : []

  return (
    <DexV2Layout>
      <Container>
        <GridContainer>
          <Flex flexDirection="column" css={{ gap: '20px' }}>
            <BalCard shadow="none" noBorder className="p-4">
              {loadingPool ? (
                <LoadingBlock darker rounded="lg" className="h-20" />
              ) : (
                <PoolPageHeader
                  pool={pool}
                  titleTokens={titleTokens}
                  isStableLikePool={isStableLikePool}
                  missingPrices={missingPrices}
                />
              )}

              <Box mt={4}>
                {loadingPool ? (
                  <LoadingBlock darker rounded="lg" className="h-375" />
                ) : (
                  <Box>
                    <PoolChart pool={pool} />
                  </Box>
                )}
              </Box>
            </BalCard>

            <PoolStatCards pool={pool} poolApr={poolApr} loading={loadingPool} loadingApr={loadingApr} />

            {loadingPool ? <LoadingBlock darker rounded="lg" className="h-375" /> : <PoolCompositionCard pool={pool} />}
          </Flex>

          <Flex flexDirection="column" css={{ gap: '20px' }}>
            {loadingPool ? (
              <LoadingBlock darker rounded="lg" className="h-375" />
            ) : (
              <MyPoolBalancesCard
                pool={pool}
                missingPrices={missingPrices}
                titleTokens={titleTokens}
                isStableLikePool={isStableLikePool}
              />
            )}

            {loadingPool ? (
              <LoadingBlock darker rounded="lg" style={{ height: 238 }} />
            ) : (
              <>{isStakablePool && !loadingPool && pool && isWalletReady ? <StakingCard pool={pool} /> : null}</>
            )}
          </Flex>
        </GridContainer>
      </Container>
    </DexV2Layout>
  )
}

export default PoolDetail

const Container = styled.div`
  @media (min-width: 1024px) {
    padding-left: 1rem;
    padding-right: 1rem;
  }

  @media (min-width: 1280px) {
    max-width: 1250px;
    margin: 0 auto;
    width: 1250px;
  }

  @media (min-width: 1536px) {
    max-width: 1536px;
    margin: 0 auto;
    width: 1536px;
  }

  .h-20 {
    height: 5rem;
  }

  .h-24 {
    height: 6rem;
  }

  .h-375 {
    height: 375px;
  }

  .h-120 {
    height: 120px;
  }

  .p-4 {
    padding: 1rem;
  }

  .h-64 {
    height: 16rem;
  }
`

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
`
