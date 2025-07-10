// ProportionalWithdrawalTokenInfo.tsx
import React from 'react'
import styled from 'styled-components'
import { Pool, PoolToken } from 'services/pool/types'
import { TokenInfo } from 'types/TokenList'
import { findByAddress } from 'lib/utils'
import { isDeep, isLinear, isStableLike } from 'hooks/dex-v2/usePoolHelpers'
import useNumbers, { FNumFormats } from 'hooks/dex-v2/useNumbers'
import LoadingBlock from 'pages/DexV2/common/LoadingBlock'
import Asset from 'pages/DexV2/common/Asset'

export interface ProportionalWithdrawalTokenInfoProps {
  token?: TokenInfo
  weight: string
  address: string
  fiatAmountOut?: string
  loading: boolean
  pool: Pool
  value: string
}

const ProportionalWithdrawalTokenInfo: React.FC<ProportionalWithdrawalTokenInfoProps> = ({
  token: tokenProp,
  weight,
  address,
  fiatAmountOut,
  loading,
  pool,
  value,
}) => {
  const { fNum } = useNumbers()

  // Compute the pool token from the pool's tokens list.
  const poolToken: PoolToken | undefined = findByAddress(pool.tokens, address)

  // Determine whether to show the weight percentage.
  const showWeight = !isStableLike(pool.poolType) && !isDeep(pool) && !isLinear(pool.poolType)

  return (
    <Container>
      <LeftContainer>
        <div style={{ display: 'flex', alignItems: 'center', width: '2rem', marginRight: '0.5rem' }}>
          <Asset address={address} className="shadow" />
        </div>
        <TokenInfoContainer>
          <TokenSymbol>{tokenProp?.symbol || poolToken?.symbol}</TokenSymbol>
          <TokenName>
            {showWeight && Number(weight) > 0 && (
              <span>{fNum(weight, { style: 'percent', maximumFractionDigits: 0 })}</span>
            )}
          </TokenName>
        </TokenInfoContainer>
      </LeftContainer>
      <RightContainer>
        {loading ? (
          <LoadingBlock style={{ width: '5rem', height: '3rem' }} />
        ) : (
          <>
            <TokenValue>{fNum(value, FNumFormats.token)}</TokenValue>
            <FiatValue>{fNum(fiatAmountOut || '0', FNumFormats.fiat)}</FiatValue>
          </>
        )}
      </RightContainer>
    </Container>
  )
}

export default ProportionalWithdrawalTokenInfo

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem; /* p-4 */
  border: 1px solid #e5e7eb;
  background-color: #f9fafb;
  border-radius: 0.5rem;
`

const LeftContainer = styled.div`
  display: flex;
  align-items: center;
`

const TokenInfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  line-height: 1;
  gap: 0.125rem; /* gap-0.5 */
`

const TokenSymbol = styled.div`
  font-size: 1.125rem; /* text-lg */
  font-weight: 500; /* font-medium */
`

const TokenName = styled.div`
  font-size: 0.875rem; /* text-sm */
  color: #6b7280; /* text-gray-600 */
  max-width: 13rem; /* approximate max-w-52 */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const RightContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding-left: 0.5rem; /* pl-2 */
  text-align: right;
  flex-grow: 1;
  font-family: monospace; /* font-numeric */
`

const TokenValue = styled.span`
  font-size: 1.25rem; /* text-xl */
  font-weight: 500; /* font-medium */
  word-break: break-word;
`

const FiatValue = styled.span`
  font-size: 0.875rem; /* text-sm */
  color: #6b7280; /* text-gray-600 */
`
