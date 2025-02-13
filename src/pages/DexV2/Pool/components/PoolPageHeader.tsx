import React, { useMemo } from 'react'
import styled from 'styled-components'

import { Pool, PoolToken } from 'services/pool/types'
import { poolMetadata as getPoolMetadata } from 'lib/config/metadata'
import { POOLS } from 'constants/dexV2/pools'
import { useTokens } from 'state/dexV2/tokens/hooks/useTokens'
import Asset from 'pages/DexV2/common/Asset'
import useNumbers from 'hooks/dex-v2/useNumbers'
import { Flex } from 'rebass'

interface PoolPageHeaderProps {
  pool: Pool
  isStableLikePool: boolean
  titleTokens: PoolToken[]
}

const PoolPageHeader: React.FC<PoolPageHeaderProps> = ({ pool, titleTokens, isStableLikePool }) => {
  const { balancerTokenListTokens, getToken } = useTokens()
  const { fNum } = useNumbers()

  console.log('pool', pool)
  const poolMetadata = useMemo(() => (pool && pool.id ? getPoolMetadata(pool?.id) : null), [JSON.stringify(pool)])
  const poolTypeLabel = useMemo(() => {
    if (!pool?.factory) return ''
    const key = POOLS.Factories[pool.factory]

    return key ? key : 'Unknown pool type'
  }, [JSON.stringify(pool)])

  function symbolFor(titleTokenIndex: number): string {
    const token = titleTokens[titleTokenIndex]
    return getToken(token.address)?.symbol || token.symbol || '---'
  }

  return (
    <Card>
      <Header>
        {poolMetadata?.name ? (
          <>
            <Title>{poolMetadata?.name}</Title>
            <Subtitle>{poolTypeLabel}</Subtitle>
          </>
        ) : (
          <Title>{poolTypeLabel}</Title>
        )}
      </Header>
      <TokenContainer>
        {titleTokens.map(({ address, weight }, i) => (
          <Flex key={i} alignItems="center" mr="12px">
            <Asset address={address} size={24} />
            <TokenBadge> {symbolFor(i)}</TokenBadge>
            {!isStableLikePool && !!weight && weight !== '0' ? (
              <WeightText>
                {fNum(weight || '0', {
                  style: 'percent',
                  maximumFractionDigits: 0,
                })}
              </WeightText>
            ) : null}
          </Flex>
        ))}
      </TokenContainer>
      <Alert>Warning: This pool is in recovery mode.</Alert>
      <Footer>Additional Pool Information</Footer>
    </Card>
  )
}

export default PoolPageHeader

const Card = styled.div`
  border-radius: 0.75rem;
  box-shadow: 0px 10px 15px -3px rgba(0, 0, 0, 0.1);
  background: white;
  overflow: hidden;
  padding: 1rem;
`

const Header = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
`

const Title = styled.h3`
  font-size: 1.25rem;
  font-weight: bold;
  text-transform: capitalize;
  margin-top: 0.5rem;
`

const Subtitle = styled.h5`
  font-size: 0.875rem;
  color: #6b7280;
`

const TokenContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
`

const TokenBadge = styled.div`
  display: flex;
  align-items: center;
  padding: 0.5rem;
  background: #f9fafb;
  border-radius: 0.5rem;
`

const Alert = styled.div`
  margin-top: 0.5rem;
  padding: 0.75rem;
  background: #fef3c7;
  border-left: 4px solid #f59e0b;
  color: #92400e;
  font-size: 0.875rem;
`

const Footer = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  border-top: 1px solid #374151;
`

const WeightText = styled.span`
  margin-top: 1px;
  margin-left: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: #9ca3af;
`
