import React, { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import styled from 'styled-components'

import LoadingBlock from '../common/LoadingBlock'
import { usePool } from 'state/dexV2/pool/usePool'
import useWeb3 from 'hooks/dex-v2/useWeb3'
import { useTokens } from 'state/dexV2/tokens/hooks/useTokens'
import { tokenTreeLeafs, usePoolHelpers, orderedPoolTokens } from 'hooks/dex-v2/usePoolHelpers'
import usePoolSnapshotsQuery from 'hooks/dex-v2/queries/usePoolSnapshotsQuery'
import usePoolAprQuery from 'hooks/dex-v2/queries/usePoolAprQuery'
import { includesAddress } from 'lib/utils'
import { PoolToken } from 'services/pool/types'
import { POOLS } from 'constants/dexV2/pools'
import MyPoolBalancesCard from './components/MyPoolBalancesCard'
import PoolPageHeader from './components/PoolPageHeader'
import DexV2Layout from '../common/Layout'

const PoolDetail: React.FC = () => {
  const params = useParams<any>()
  const poolId = (params.id as string).toLowerCase()

  const { pool, isLoadingPool } = usePool(poolId)
  const { isWalletReady } = useWeb3()
  const { prices } = useTokens()
  const priceQueryLoading = false // TODO: implement
  const {
    isStableLikePool,
    isLiquidityBootstrappingPool,
    isComposableStableLikePool,
    isDeprecatedPool,
    isNewPoolAvailable,
  } = usePoolHelpers(pool)

  const loadingPool = useMemo(() => isLoadingPool || !pool, [isLoadingPool, JSON.stringify(pool)])
  const poolSnapshotsQuery = usePoolSnapshotsQuery(poolId, undefined, {
    refetchOnWindowFocus: false,
  })
  const aprQuery = usePoolAprQuery(poolId)
  const loadingApr = useMemo(() => aprQuery.isLoading || Boolean(aprQuery.error), [aprQuery.isLoading, aprQuery.error])
  const poolApr = useMemo(() => aprQuery.data, [JSON.stringify(aprQuery.data)])

  const missingPrices = useMemo(() => {
    if (pool && prices && !priceQueryLoading) {
      const tokensWithPrice = Object.keys(prices)
      const tokens = pool.tokens ? tokenTreeLeafs(pool.tokens) : []

      return !tokens.every((token) => includesAddress(tokensWithPrice, token))
    }
    return false
  }, [JSON.stringify(pool), JSON.stringify(prices), priceQueryLoading])

  const titleTokens = useMemo<PoolToken[]>(() => {
    if (!pool || !pool.tokens) return []

    return orderedPoolTokens(pool, pool.tokens)
  }, [JSON.stringify(pool?.tokens)])

  const isStakablePool = useMemo(
    (): boolean => POOLS.Stakable.VotingGaugePools.includes(poolId) || POOLS.Stakable.AllowList.includes(poolId),
    [poolId]
  )

  return (
    <DexV2Layout>
      <Container>
        <GridContainer>
          <ColSpan2>
            {loadingPool || !pool ? (
              <LoadingBlock darker rounded="lg" className="header-loading-block" />
            ) : (
              <PoolPageHeader pool={pool} titleTokens={titleTokens} isStableLikePool={isStableLikePool} />
            )}
          </ColSpan2>

          <div className="order-2 lg:order-1 col-span-2"></div>
          <Order2LgOrder1ColSpan2>Chart</Order2LgOrder1ColSpan2>
          <Order1LgOrder2Px4LgPx0>
            <MyPoolBalancesCard pool={pool} missingPrices={missingPrices} />
          </Order1LgOrder2Px4LgPx0>
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
  }
  @media (min-width: 1024px) {
    padding-left: 1rem;
    padding-right: 1rem;
  }
  padding-top: 2rem;
`

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 2rem;

  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1rem;
  }

  @media (min-width: 1280px) {
    gap: 2rem;
  }

  .header-loading-block {
    height: 6.75rem;
  }
`

const ColSpan2 = styled.div`
  @media (min-width: 1024px) {
    grid-column: span 2 / span 2;
    padding-left: 0;
    padding-right: 0;
  }
  padding-left: 1rem;
  padding-right: 1rem;
`

const Order2LgOrder1ColSpan2 = styled.div`
  order: 2;

  @media (min-width: 1024px) {
    order: 1;
    grid-column: span 2 / span 2;
  }
`

const Order1LgOrder2Px4LgPx0 = styled.div`
  order: 1;
  padding-left: 1rem;
  padding-right: 1rem;

  @media (min-width: 1024px) {
    order: 2;
    padding-left: 0;
    padding-right: 0;
  }
`
