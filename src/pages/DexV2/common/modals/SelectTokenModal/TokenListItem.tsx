import React, { useMemo } from 'react'
import styled from 'styled-components'

import Asset from '../../Asset'
import BalLoadingBlock from '../../LoadingBlock'
import useNumbers, { FNumFormats } from 'hooks/dex-v2/useNumbers'
import { useTokens } from 'state/dexV2/tokens/hooks/useTokens'
import { TokenInfo } from 'types/TokenList'

export interface TokenListItemProps {
  token: TokenInfo
  balanceLoading?: boolean
  hideBalance?: boolean
  focussed?: boolean
}

const TokenListItem: React.FC<TokenListItemProps> = ({ token, balanceLoading = true, hideBalance = false }) => {
  const { fNum } = useNumbers()
  const { priceFor, balanceFor } = useTokens()

  const balance = useMemo(() => Number(balanceFor(token.address)), [token.address, balanceFor])
  const value = useMemo(() => balance * priceFor(token.address), [balance, token.address, priceFor])

  return (
    <Container>
      <Asset address={token.address} iconURI={token.logoURI} size={34} />
      <SymbolContainer>
        {token.symbol}
        <TokenName>{token.name}</TokenName>
      </SymbolContainer>
      {!hideBalance && (
        <BalanceContainer>
          {balanceLoading ? (
            <BalLoadingBlock className="w-14 h-4" />
          ) : (
            <>
              {balance > 0 && (
                <>{balance >= 0.0001 ? <span>{fNum(balance, FNumFormats.token)}</span> : <span>&lt; 0.0001</span>}</>
              )}
              {value > 0 && <ValueText>{fNum(value, FNumFormats.fiat)}</ValueText>}
            </>
          )}
        </BalanceContainer>
      )}
    </Container>
  )
}

export default TokenListItem

const Container = styled.div`
  display: flex;
  align-items: center;
  padding: 0.75rem 0.5rem; /* py-3 px-2 */
  font-size: 1rem; /* text-base */
  line-height: 1.25rem; /* leading-5 */
  cursor: pointer;
  padding-left: 1rem;
  padding-right: 1rem;

  &:hover {
    background-color: #eff6ff; /* blue-50 */
    border-radius: 0.5rem;
  }

  .w-14 {
    width: 3.5rem;
  }

  .h-4 {
    height: 1rem;
  }
`

const SymbolContainer = styled.div`
  flex: 1;
  margin-left: 8px; /* ml-2 */
`

const TokenName = styled.div`
  width: 10rem; /* w-40 */
  font-size: 0.875rem; /* text-sm */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: gray; /* text-gray */

  @media (min-width: 768px) {
    width: 15rem; /* md:w-60 */
  }
`

const BalanceContainer = styled.span`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  font-weight: 500;
  text-align: right;
`

const ValueText = styled.div`
  font-size: 0.875rem; /* text-sm */
  font-weight: 400; /* font-normal */
  color: #6b7280; /* Example secondary text color */
`
