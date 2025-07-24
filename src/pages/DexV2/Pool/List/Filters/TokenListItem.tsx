import React from 'react'
import styled from 'styled-components'

import Asset from 'pages/DexV2/common/Asset'
import { TokenInfo } from 'types/TokenList'

export interface TokenListItemProps {
  token: TokenInfo
  balanceLoading?: boolean
  hideBalance?: boolean
  focussed?: boolean
}

const TokenListItem: React.FC<TokenListItemProps> = ({ token }) => {
  return (
    <Container>
      <Asset address={token.address} iconURI={token.logoURI} size={20} />
      <SymbolContainer>{token.symbol}</SymbolContainer>
    </Container>
  )
}

export default TokenListItem

const Container = styled.div`
  display: flex;
  align-items: center;
  font-size: 1rem; /* text-base */
  line-height: 1.25rem; /* leading-5 */
  cursor: pointer;

  &:hover {
    background-color: #fff; /* blue-50 */
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
