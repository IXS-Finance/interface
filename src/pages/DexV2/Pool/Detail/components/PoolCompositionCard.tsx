import React from 'react'
import styled from 'styled-components'

import { removeBptFrom, isWeightedLike } from 'hooks/dex-v2/usePoolHelpers'
import { Pool } from 'services/pool/types'
import { useTokenBreakdown } from './useTokenBreakdown'
import TokenBreakdown from './TokenBreakdown'

interface Props {
  pool: Pool
}

const PoolCompositionCard: React.FC<Props> = ({ pool }) => {
  const isWeighted = isWeightedLike(pool.poolType)
  const rootPool = removeBptFrom(pool)
  const tokenData = useTokenBreakdown(rootPool)

  return (
    <Card>
      <Title>Pool composition</Title>
      <CardHeader isWeighted={isWeighted}>
        <div>Token</div>
        {isWeighted && <div className="justify-end">Weight</div>}
        <div className="justify-end">Balance</div>
        <div className="justify-end">Value</div>
      </CardHeader>
      <TokenGrid>
        {rootPool.tokens.map((token) => (
          <TokenRow key={token.address}>
            <TokenBreakdown token={token} rootPool={pool} tokensData={tokenData} />
          </TokenRow>
        ))}
      </TokenGrid>
    </Card>
  )
}

export default PoolCompositionCard

interface CardHeaderProps {
  isWeighted: boolean
}

const Title = styled.div`
  color: rgba(41, 41, 51, 0.9);
  text-align: center;
  font-family: Inter;
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  letter-spacing: -0.48px;
`

const CardHeader = styled.div<CardHeaderProps>`
  display: grid;
  width: 100%;
  font-size: 1rem;
  font-weight: 600;
  border-bottom: 1px solid rgba(230, 230, 255, 0.6);
  grid-template-columns: ${(props) => (props.isWeighted ? 'repeat(4, 1fr)' : 'repeat(3, 1fr)')};
  color: #8f8fb2;
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 48px; /* 342.857% */
  letter-spacing: -0.28px;

  /* Align the right columns */
  & > div:nth-child(n + 2) {
    text-align: right;
  }
`

const TokenGrid = styled.div`
  display: grid;
  width: 100%;
`

const TokenRow = styled.div`
  display: grid;
  border-top: 1px solid rgba(230, 230, 255, 0.6);
  &:first-child {
    border-top: none;
  }
`

const Card = styled.div`
  display: flex;
  padding: 32px 32px 16px 32px;
  flex-direction: column;
  align-items: flex-start;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0px 30px 48px 0px rgba(63, 63, 132, 0.05);
`
