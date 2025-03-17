import React from 'react'
import styled from 'styled-components'

import { Pool, PoolToken } from 'services/pool/types'
import { poolMetadata as getPoolMetadata } from 'lib/config/metadata'
import { POOLS } from 'constants/dexV2/pools'
import { useTokens } from 'state/dexV2/tokens/hooks/useTokens'
import Asset from 'pages/DexV2/common/Asset'
import useNumbers from 'hooks/dex-v2/useNumbers'
import { Flex } from 'rebass'
import Chip from './Chip'
import useWeb3 from 'hooks/dex-v2/useWeb3'
import { BalAlert } from 'pages/DexV2/common/BalAlert'
import { usePoolHelpers } from 'hooks/dex-v2/usePoolHelpers'

interface PoolPageHeaderProps {
  pool: Pool
  isStableLikePool: boolean
  missingPrices: boolean
  titleTokens: PoolToken[]
}

const PoolPageHeader: React.FC<PoolPageHeaderProps> = ({ pool, titleTokens, missingPrices, isStableLikePool }) => {
  const { getToken } = useTokens()
  const { fNum } = useNumbers()
  const { explorerLinks: explorer } = useWeb3()
  const { hasNonApprovedRateProviders } = usePoolHelpers(pool)

  const poolTypeLabel = (() => {
    if (!pool?.poolType) return 'Unknown pool type'

    return pool?.poolType
  })()

  function symbolFor(titleTokenIndex: number): string {
    const token = titleTokens[titleTokenIndex]
    return getToken(token.address)?.symbol || token.symbol || '---'
  }

  console.log('poolMetadata?.name ', pool)
  return (
    <Container>
      <Flex mb={2}>
        <Title>{poolTypeLabel}</Title>
      </Flex>
      <Flex alignItems="center" css={{ gap: '20px' }}>
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

        {pool?.isNew ? (
          <Chip outline={false} color="orange" className="mr-2">
            NEW
          </Chip>
        ) : null}
      </Flex>

      {hasNonApprovedRateProviders ? (
        <BalAlert
          type="warning"
          title="One or more token rate providers associated with tokens in this pool have not been vetted."
          className="mt-2"
          block
        />
      ) : null}

      {missingPrices ? (
        <BalAlert
          type="warning"
          title="Price information is missing for this pool, since it contains a token not found by our price provider."
          className="mt-2"
          block
        />
      ) : null}

      {/* <Footer>Additional Pool Information</Footer> */}
    </Container>
  )
}

export default PoolPageHeader

const Container = styled.div`
  .mt-2 {
    margin-top: 0.5rem;
  }
  .mr-2 {
    margin-right: 0.5rem;
  }
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
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  letter-spacing: -0.42px;
`
