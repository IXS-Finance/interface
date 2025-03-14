import React from 'react'
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

  const poolMetadata = pool && pool.id ? getPoolMetadata(pool.id) : null
  const poolTypeLabel = (() => {
    if (!pool?.factory) return ''
    const key = POOLS.Factories[pool.factory]
    return key ? key : 'Unknown pool type'
  })()

  function symbolFor(titleTokenIndex: number): string {
    const token = titleTokens[titleTokenIndex]
    return getToken(token.address)?.symbol || token.symbol || '---'
  }

  console.log('poolMetadata?.name ', poolMetadata)
  return (
    <div>
      <Flex alignItems="center" css={{ gap: '20px' }}>
        <Header>
          {poolMetadata?.name ? (
            <>
              <Title>{poolMetadata.name}</Title>
              <Subtitle>{poolTypeLabel}</Subtitle>
            </>
          ) : (
            <Title>{poolTypeLabel}</Title>
          )}
        </Header>
        <TokenContainer>
          {titleTokens.map(({ address, weight }, i) => (
            <Flex
              key={i}
              alignItems="center"
              css={{
                gap: '8px',
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid #E6E6FF',
              }}
            >
              <Asset address={address} size={24} />
              <TokenBadge>{symbolFor(i)}</TokenBadge>
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
      </Flex>

      <Alert>Warning: This pool is in recovery mode.</Alert>
      <Footer>Additional Pool Information</Footer>
    </div>
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

const Title = styled.div`
  font-size: 1.25rem;
  font-weight: bold;
  text-transform: capitalize;
`

const Subtitle = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
`

const TokenContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
`

const TokenBadge = styled.div`
  color: rgba(41, 41, 51, 0.9);
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  letter-spacing: -0.42px;
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
  color: #b8b8d2;
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  letter-spacing: -0.42px;
`
