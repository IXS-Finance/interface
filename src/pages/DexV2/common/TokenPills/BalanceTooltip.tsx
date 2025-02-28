// BalanceTooltip.tsx
import React from 'react'
import styled from 'styled-components'
import { PoolToken } from 'services/pool/types'
import { shortenLabel } from 'lib/utils'
import Asset from '../Asset'
import useWeb3 from 'hooks/dex-v2/useWeb3'
import useNumbers, { FNumFormats } from 'hooks/dex-v2/useNumbers'
import { useTokens } from 'state/dexV2/tokens/hooks/useTokens'

// Styled components
const Container = styled.div`
  display: flex;
  flex-direction: column;
`

const Title = styled.div`
  margin-bottom: 0.5rem;
  color: #6b7280; /* text-secondary */
  font-size: 0.875rem;
`

const Row = styled.div`
  display: flex;
  align-items: center;
`

const Details = styled.div`
  display: flex;
  flex-direction: column;
`

const BalanceText = styled.div`
  font-size: 0.875rem; /* text-sm */
  font-weight: 600; /* font-semibold */
`

const FiatText = styled.div`
  color: #6b7280;
  font-size: 0.875rem;
`

interface BalanceTooltipProps {
  token: PoolToken
  symbol: string
}

const BalanceTooltip: React.FC<BalanceTooltipProps> = ({ token, symbol }) => {
  const { fNum, toFiat } = useNumbers()
  const { balanceFor } = useTokens()
  const { account } = useWeb3()

  // Compute token balance and shortened account inline
  const tokenBalance = balanceFor(token.address)
  const shortenedAccount = shortenLabel(account ? account : '')

  return (
    <Container>
      <Title>{`In your wallet ${shortenedAccount}`}</Title>
      <Row>
        <div style={{ marginRight: '0.5rem' }}>
          {/* Assume BalAsset is a component that displays the token logo */}
          <Asset address={token.address} size={36} />
        </div>
        <Details>
          <BalanceText>
            {fNum(tokenBalance, FNumFormats.token)} {symbol}
          </BalanceText>
          <FiatText>{fNum(toFiat(tokenBalance, token.address), FNumFormats.fiat)}</FiatText>
        </Details>
      </Row>
    </Container>
  )
}

export default BalanceTooltip
