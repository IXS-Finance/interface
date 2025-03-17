import React from 'react'
import { useParams } from 'react-router-dom'
import styled from 'styled-components'

import LoadingBlock from '../../common/LoadingBlock'
import { usePool } from 'state/dexV2/pool/usePool'
import useWeb3 from 'hooks/dex-v2/useWeb3'
import { useTokens } from 'state/dexV2/tokens/hooks/useTokens'
import { tokenTreeLeafs, usePoolHelpers, orderedPoolTokens } from 'hooks/dex-v2/usePoolHelpers'
import usePoolSnapshotsQuery from 'hooks/dex-v2/queries/usePoolSnapshotsQuery'
import usePoolAprQuery from 'hooks/dex-v2/queries/usePoolAprQuery'
import { includesAddress } from 'lib/utils'
import { PoolToken } from 'services/pool/types'
import { POOLS } from 'constants/dexV2/pools'
import MyPoolBalancesCard from '../components/MyPoolBalancesCard'
import PoolPageHeader from './components/PoolPageHeader'
import DexV2Layout from '../../common/Layout'
import { Box, Flex } from 'rebass'
import chartImg from 'assets/images/dex-v2/chart-fake.svg'
import BalCard from 'pages/DexV2/common/Card'

const PoolDetail: React.FC = () => {
  const params = useParams<any>()
  const poolId = (params.id as string).toLowerCase()

  const { pool, isLoadingPool } = usePool(poolId)
  const { isWalletReady } = useWeb3()
  const { balanceQueryLoading, prices } = useTokens()
  const priceQueryLoading = false // TODO: implement
  const {
    isStableLikePool,
    isLiquidityBootstrappingPool,
    isComposableStableLikePool,
    isDeprecatedPool,
    isNewPoolAvailable,
  } = usePoolHelpers(pool)

  const loadingPool = isLoadingPool || !pool || balanceQueryLoading
  const poolSnapshotsQuery = usePoolSnapshotsQuery(poolId, undefined, {
    refetchOnWindowFocus: false,
  })
  const aprQuery = usePoolAprQuery(poolId)
  const loadingApr = aprQuery.isLoading || Boolean(aprQuery.error)
  const poolApr = aprQuery.data

  const missingPrices = (() => {
    if (pool && prices && !priceQueryLoading) {
      const tokensWithPrice = Object.keys(prices)
      const tokens = pool.tokens ? tokenTreeLeafs(pool.tokens) : []
      return !tokens.every((token) => includesAddress(tokensWithPrice, token))
    }
    return false
  })()

  const titleTokens: PoolToken[] = pool?.tokens ? orderedPoolTokens(pool, pool.tokens) : []

  const isStakablePool: boolean =
    POOLS.Stakable.VotingGaugePools.includes(poolId) || POOLS.Stakable.AllowList.includes(poolId)

  console.log('titleTokens', titleTokens)
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
                    <img src={chartImg} alt="chart" style={{ width: '100%', height: 'auto' }} />
                  </Box>
                )}
              </Box>
            </BalCard>

            {!loadingPool ? (
              <Flex
                alignItems="center"
                alignSelf="stretch"
                css={{
                  gap: '20px',
                }}
              >
                <Info>
                  <div className="label">Pool Value</div>
                  <div className="value">$199,696</div>
                </Info>
                <Info>
                  <div className="label">Volume (24h)</div>
                  <div className="value">$0.00</div>
                </Info>
                <Info>
                  <div className="label">Fees (24h)</div>
                  <div className="value">$0.00</div>
                </Info>
                <Info>
                  <div className="label">APR</div>
                  <div className="value">$0.00</div>
                </Info>
              </Flex>
            ) : null}
          </Flex>

          <div>
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
          </div>
        </GridContainer>
      </Container>
    </DexV2Layout>
  )
}

export default PoolDetail

const Container = styled.div`
  @media (min-width: 1280px) {
    max-width: 1536px;
    margin: 0 auto;
    width: 1536px;
  }
  @media (min-width: 1024px) {
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .h-20 {
    height: 5rem;
  }

  .h-375 {
    height: 375px;
  }

  .p-4 {
    padding: 1rem;
  }
`

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
`

const Info = styled.div`
  display: flex;
  padding: 32px;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  flex: 1 0 0;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.3);
  box-shadow: 0px 30px 48px 0px rgba(63, 63, 132, 0.05);

  .label {
    color: #b8b8d2;
    font-family: Inter;
    font-size: 14px;
    font-style: normal;
    font-weight: 500;
    line-height: normal;
    letter-spacing: -0.42px;
  }

  .value {
    align-self: stretch;
    color: rgba(41, 41, 51, 0.9);
    font-family: Inter;
    font-size: 24px;
    font-style: normal;
    font-weight: 600;
    line-height: normal;
    letter-spacing: -0.72px;
  }
`
