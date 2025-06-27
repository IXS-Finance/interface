import React from 'react'
import styled from 'styled-components'
import { PoolToken } from 'services/pool/types'
import { useTokens } from 'state/dexV2/tokens/hooks/useTokens'
import useNumbers, { FNumFormats } from 'hooks/dex-v2/useNumbers'
import { Box, Flex } from 'rebass'
import Asset from '../Asset'

interface TokenPillsProps {
  tokens: PoolToken[]
  isStablePool?: boolean
  selectedTokens?: string[]
  pickedTokens?: string[]
  isOnMigrationCard?: boolean
  isHovered?: boolean
}

// Main component – default values are provided via destructuring.
const TokenPills: React.FC<TokenPillsProps> = ({
  tokens,
}) => {
  // Assume these hooks provide the same functionality as in Vue.
  const { fNum, toFiat } = useNumbers()
  const { getToken, hasBalance, balanceFor } = useTokens()

  // Returns the proper symbol from token info
  function symbolFor(token: PoolToken): string {
    const tokenInfo = getToken(token.address)
    return tokenInfo?.symbol || token.symbol || '---'
  }

  // Formats the token's weight as a percent string.
  function weightFor(token: PoolToken): string {
    return fNum(token.weight || '0', {
      style: 'percent',
      maximumFractionDigits: 0,
    })
  }

  return (
    <Flex flexDirection="column">
      {tokens.map((token) => {
        const tokenBalance = balanceFor(token.address)
        const symbol = symbolFor(token)
        const weight = weightFor(token)

        return (
          <Flex
            key={token.address}
            alignItems="center"
            justifyContent="space-between"
            css={{
              borderBottom: '1px solid #E6E6FF',
              paddingBottom: '24px',
              marginBottom: '24px',
            }}
          >
            <Flex>
              <Asset address={token.address} size={36} />
              <Flex flexDirection="column" ml="2">
                <Box fontSize="14px">
                  {fNum(tokenBalance, FNumFormats.token)} {symbol}
                </Box>

                <Box fontSize="14px" color="#B8B8D2" mt="4px">
                  {fNum(toFiat(tokenBalance, token.address), FNumFormats.fiat)}
                </Box>
              </Flex>
            </Flex>
            <Box fontSize="20px" fontWeight={600}>
              {weight}
            </Box>
          </Flex>
        )
      })}
    </Flex>
  )
}

export default TokenPills

const Line = styled.div`
  border-top: 1px solid #e6e6ff;
  margin-top: 24px;
  margin-bottom: 24px;
`
