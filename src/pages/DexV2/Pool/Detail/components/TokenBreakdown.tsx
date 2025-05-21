/*
Usage Example:

<TokenBreakdown
  token={yourToken}
  showUserShares={true}
  rootPool={yourRootPool}
  tokensData={yourTokensData}
/>
*/

import React from 'react'
import styled, { css } from 'styled-components'
import { Pool, PoolToken } from 'services/pool/types'
import { isWeightedLike, usePoolHelpers } from 'hooks/dex-v2/usePoolHelpers'

import useWeb3 from 'hooks/dex-v2/useWeb3'
import { TokensData } from './useTokenBreakdown'
import { useTokens } from 'state/dexV2/tokens/hooks/useTokens'
import Asset from 'pages/DexV2/common/Asset'
import { ArrowUpRight } from 'react-feather'

interface TokenBreakdownProps {
  token: PoolToken
  parentLevel?: number
  showUserShares: boolean
  rootPool: Pool
  tokensData: TokensData
}

const TokenBreakdown: React.FC<TokenBreakdownProps> = ({
  token,
  parentLevel = 0,
  showUserShares,
  rootPool,
  tokensData,
}) => {
  // Hooks similar to your Vue composables.
  const { explorerLinks } = useWeb3()
  const { isDeepPool } = usePoolHelpers(rootPool)
  const isWeighted = isWeightedLike(rootPool.poolType)
  const { getToken } = useTokens()

  // Get token data from the provided tokensData object.
  const tokenData = tokensData[token.address]

  // Compute the current (nested) level.
  const currentLevel = parentLevel + 1

  // Helper to get the token symbol.
  function symbolFor(token: PoolToken): string {
    return getToken(token.address)?.symbol || token.symbol || '---'
  }

  // Determine asset size based on the nested level.
  const assetSize = isDeepPool && currentLevel > 2 ? 24 : isDeepPool && currentLevel > 1 ? 28 : 36

  const balanceLabel = showUserShares ? tokenData.userBalanceLabel : tokenData.balanceLabel
  const fiatLabel = showUserShares ? tokenData.userFiatLabel : tokenData.fiatLabel
  return (
    <>
      <Container level={currentLevel} isWeighted={isWeighted}>
        <StyledLink href={explorerLinks.addressLink(token.address)}>
          <StyledAssetWrapper isDeep={isDeepPool} level={currentLevel}>
            <Asset address={token.address} size={assetSize} />
          </StyledAssetWrapper>
          <SymbolText>{symbolFor(token)}</SymbolText>
          <ArrowUpRight size="16" color="#B8B8CC" />
        </StyledLink>
        {isWeighted && <GridCell>{tokenData.tokenWeightLabel}</GridCell>}
        <GridCell>{balanceLabel && !Number.isNaN(balanceLabel) ? balanceLabel : '-'}</GridCell>
        <Value>{fiatLabel && !Number.isNaN(fiatLabel) ? fiatLabel : '-'}</Value>
      </Container>
      {isDeepPool &&
        token.token?.pool?.tokens &&
        token.token.pool.tokens.map((nestedToken: PoolToken) => (
          <TokenBreakdown
            key={nestedToken.address}
            token={nestedToken}
            parentLevel={currentLevel}
            showUserShares={showUserShares}
            rootPool={rootPool}
            tokensData={tokensData}
          />
        ))}
    </>
  )
}

export default TokenBreakdown

/**
 * Styled Components
 */

// The container mimics the grid layout and applies level–specific styles.
const Container = styled.div<{ level: number; isWeighted: boolean }>`
  display: grid;
  width: 100%;
  align-items: center;
  border-top: 1px solid rgba(230, 230, 255, 0.6);
  transition: all 300ms ease-in;
  grid-template-columns: ${({ isWeighted }) => (isWeighted ? 'repeat(4, 1fr)' : 'repeat(3, 1fr)')};
  color: rgba(41, 41, 51, 0.9);
  text-align: right;
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  letter-spacing: -0.42px;

  &:first-child {
    border-top: none;
  }
  /* Level–specific styles */
  ${({ level }) => {
    switch (level) {
      case 1:
        return css`
          padding-top: 1rem;
          padding-bottom: 1rem;
          font-weight: 500;
          &:hover {
            background-color: #f9fafb; /* gray-50 */
          }
        `
      case 2:
        return css`
          padding-top: 0.875rem;
          padding-bottom: 0.875rem;
          background-color: rgba(243, 244, 246, 0.2); /* gray-100/20 */
          &:hover {
            background-color: #f9fafb;
          }
        `
      case 3:
        return css`
          padding-top: 0.75rem;
          padding-bottom: 0.75rem;
          font-size: 0.875rem;
          color: #6b7280; /* secondary text color */
          background-color: rgba(243, 244, 246, 0.5); /* gray-100/50 */
          &:hover {
            background-color: rgba(243, 244, 246, 0.7); /* gray-100/70 */
          }
        `
      case 4:
        return css`
          padding-top: 0.625rem;
          padding-bottom: 0.625rem;
          font-size: 0.875rem;
          color: #6b7280;
          background-color: #f3f4f6; /* gray-100 */
          &:hover {
            background-color: rgba(243, 244, 246, 0.5);
          }
        `
      default:
        return css`
          padding-left: 1rem;
        `
    }
  }}

  /* Apply extra left padding to any anchor child when level is 2, 3 or 4 */
  a {
    ${({ level }) => {
      if (level === 2) return 'padding-left: 2rem;'
      if (level === 3) return 'padding-left: 4rem;'
      if (level === 4) return 'padding-left: 5rem;'
      return ''
    }}
  }
`

// A styled version of BalLink that sets up the flex layout.
const StyledLink = styled.a`
  display: flex;
  align-items: center;
  text-decoration: none;
  color: #292933;
  font-family: Inter;
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  letter-spacing: -0.32px;
`

// A wrapper for the asset that conditionally applies spacing and z-index.
const StyledAssetWrapper = styled.div<{ isDeep: boolean; level: number }>`
  flex-shrink: 0;
  margin-right: 0.5rem; /* mr-2 */
  ${({ isDeep, level }) =>
    isDeep && level > 1
      ? css`
          position: relative;
          margin-left: 0.25rem; /* ml-1 */
        `
      : css`
          z-index: 10;
        `}
`

// The token symbol text changes color when its parent link is hovered.
const SymbolText = styled.span`
  transition: color 300ms ease;
  ${StyledLink}:hover & {
    color: #7e3af2; /* purple-500 */
  }
`

// Grid cells that align content to the end.
const GridCell = styled.div`
  justify-self: end;
`

const Value = styled.div`
  justify-self: end;
  color: #292933;
  text-align: right;
  font-family: Inter;
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  letter-spacing: -0.32px;
`
