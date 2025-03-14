import React, { useMemo } from 'react'
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
import PoolPageHeader from '../components/PoolPageHeader'
import DexV2Layout from '../../common/Layout'
import { Card } from 'pages/DexV2/Dashboard/components/Card'

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
          <Card>
            {loadingPool || !pool ? (
              <LoadingBlock darker rounded="lg" className="header-loading-block" />
            ) : (
              <PoolPageHeader pool={pool} titleTokens={titleTokens} isStableLikePool={isStableLikePool} />
            )}

            <svg xmlns="http://www.w3.org/2000/svg" width="754" height="320" viewBox="0 0 754 320" fill="none">
              <g filter="url(#filter0_d_1861_14351)">
                <path
                  d="M19 281L24.9667 279.449C30.9333 277.898 42.8667 274.795 54.8 276.941C66.7333 279.088 78.6667 286.483 90.6 268.78C102.533 251.078 114.467 208.278 126.4 188.019C138.333 167.759 150.267 170.041 162.2 186.262C174.133 202.483 186.067 232.644 198 235.893C209.933 239.143 221.867 215.482 233.8 207.07C245.733 198.657 257.667 205.495 269.6 211.708C281.533 217.921 293.467 223.51 305.4 214.256C317.333 205.002 329.267 180.905 341.2 167.572C353.133 154.238 365.067 151.667 377 147.314C388.933 142.96 400.867 136.824 412.8 122.874C424.733 108.924 436.667 87.1608 448.6 71.6123C460.533 56.0637 472.467 46.7299 484.4 64.4185C496.333 82.1072 508.267 126.818 520.2 137.26C532.133 147.702 544.067 123.875 556 119.012C567.933 114.149 579.867 128.251 591.8 138.02C603.733 147.789 615.667 153.225 627.6 132.707C639.533 112.19 651.467 65.7177 663.4 37.6336C675.333 9.54951 687.267 -0.146725 699.2 1.10617C711.133 2.35907 723.067 14.5611 729.033 20.6621L735 26.7631"
                  stroke="#6666FF"
                  strokeWidth="2"
                />
              </g>
              <defs>
                <filter
                  id="filter0_d_1861_14351"
                  x="0.748047"
                  y="-0.00012207"
                  width="752.967"
                  height="319.968"
                  filterUnits="userSpaceOnUse"
                  colorInterpolationFilters="sRGB"
                >
                  <feFlood floodOpacity="0" result="BackgroundImageFix" />
                  <feColorMatrix
                    in="SourceAlpha"
                    type="matrix"
                    values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                    result="hardAlpha"
                  />
                  <feOffset dy="20" />
                  <feGaussianBlur stdDeviation="9" />
                  <feComposite in2="hardAlpha" operator="out" />
                  <feColorMatrix type="matrix" values="0 0 0 0 0.4 0 0 0 0 0.4 0 0 0 0 1 0 0 0 0.4 0" />
                  <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1861_14351" />
                  <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1861_14351" result="shape" />
                </filter>
              </defs>
            </svg>
          </Card>

          <div>
            <MyPoolBalancesCard pool={pool} missingPrices={missingPrices} />
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
  }
  @media (min-width: 1024px) {
    padding-left: 1rem;
    padding-right: 1rem;
  }
`

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
`
