import React, { useState, useEffect } from 'react'
import styled from 'styled-components'

import { removeBptFrom, isWeightedLike } from 'hooks/dex-v2/usePoolHelpers'
import { Pool } from 'services/pool/types'
import { useUserPoolPercentage } from 'hooks/dex-v2/useUserPoolPercentage'
import { useTokenBreakdown } from './useTokenBreakdown'
import BalCard from 'pages/DexV2/common/Card'
import TokenBreakdown from './TokenBreakdown'

interface Props {
  pool: Pool
}

const TOTAL_COMPOSITION = 'TOTAL_COMPOSITION'
const MY_POOL_SHARE = 'MY_POOL_SHARE'

const PoolCompositionCard: React.FC<Props> = ({ pool }) => {
  const { userPoolPercentage } = useUserPoolPercentage(pool)

  // Determine if the pool is weighted
  const isWeighted = isWeightedLike(pool.poolType)

  // Remove BPT tokens from the pool and get token breakdown data
  const rootPool = removeBptFrom(pool)
  const tokenData = useTokenBreakdown(rootPool)

  // Active tab state (default is TOTAL_COMPOSITION)
  const [activeTab, setActiveTab] = useState<string>(TOTAL_COMPOSITION)

  // Determine if user has shares (assumes userPoolPercentage has a method gt)
  const userHasShares = userPoolPercentage.gt(0)
  // If the user has shares, include the "My Pool Share" tab
  const showUserShares = activeTab === MY_POOL_SHARE

  // On mount, if the user has shares, set the active tab to MY_POOL_SHARE
  useEffect(() => {
    if (userHasShares) {
      setActiveTab(MY_POOL_SHARE)
    }
  }, [userHasShares])

  return (
    <BalCard noBorder noPad>
      <CardHeader isWeighted={isWeighted}>
        <div>Token</div>
        {isWeighted && <div className="justify-end">Weight</div>}
        <div className="justify-end">Balance</div>
        <div className="justify-end">Value</div>
      </CardHeader>
      <TokenGrid>
        {rootPool.tokens.map((token) => (
          <TokenRow key={token.address}>
            <TokenBreakdown token={token} showUserShares={showUserShares} rootPool={pool} tokensData={tokenData} />
          </TokenRow>
        ))}
      </TokenGrid>
    </BalCard>
  )
}

export default PoolCompositionCard

interface CardHeaderProps {
  isWeighted: boolean
}

const CardHeader = styled.div<CardHeaderProps>`
  display: grid;
  padding: 1rem;
  width: 100%;
  font-size: 1rem;
  font-weight: 600;
  border-bottom: 1px solid #ccc;
  grid-template-columns: ${(props) => (props.isWeighted ? 'repeat(4, 1fr)' : 'repeat(3, 1fr)')};

  /* Align the right columns */
  & > div:nth-child(n + 2) {
    text-align: right;
  }
`

const TokenGrid = styled.div`
  display: grid;
`

const TokenRow = styled.div`
  display: grid;
  border-top: 1px solid #ccc;
  &:first-child {
    border-top: none;
  }
`
