import React from 'react'
import { Flex, Text } from 'rebass'
import styled from 'styled-components'

import InfoIcon from 'assets/images/dex-v2/info.svg'
import { usePoolCreation } from 'state/dexV2/poolCreation/hooks/usePoolCreation'
import { useTokens } from 'state/dexV2/tokens/hooks/useTokens'
import useNumbers, { FNumFormats } from 'hooks/dex-v2/useNumbers'
import { selectByAddress } from 'lib/utils'
import Asset from 'pages/DexV2/common/Asset'

interface TokenPricesProps {}

const TokenPrices: React.FC<TokenPricesProps> = () => {
  const { tokensList } = usePoolCreation()
  const { getToken, priceFor, injectedPrices } = useTokens()
  const { fNum } = useNumbers()

  const validTokens = tokensList.filter((t) => t !== '')
  const unknownTokens = validTokens.filter((token) => priceFor(token) === 0 || selectByAddress(injectedPrices, token))
  return (
    <Container>
      <Flex alignItems="center" style={{ gap: 6 }} mb="6px">
        <Text fontSize={14} color="#B8B8D2">
          Token Prices
        </Text>
        <img src={InfoIcon} alt="info" />
      </Flex>

      {unknownTokens.map((token) => {
        const tokenInfo = getToken(token)
        return (
          <Flex
            fontSize={14}
            fontWeight={500}
            justifyContent="space-between"
            width="100%"
            alignItems="center"
            color="rgba(41, 41, 51, 0.90)"
            py="12px"
            key={`tokenPrice-known-${token}`}
          >
            <Flex alignItems="center" style={{ gap: 6 }}>
              <Asset address={token} iconURI={tokenInfo?.logoURI} size={20} />
              <Text>{tokenInfo?.symbol}</Text>
            </Flex>
            <Flex alignItems="center" style={{ gap: 6 }}>
              <Text>{`${fNum(priceFor(token), FNumFormats.fiat)}`}</Text>
            </Flex>
          </Flex>
        )
      })}
    </Container>
  )
}

export default TokenPrices

const Container = styled.div``
