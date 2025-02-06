import React from 'react'
import { Flex, Text } from 'rebass'
import styled from 'styled-components'

import InfoIcon from 'assets/images/dex-v2/info.svg'
import PenIcon from 'assets/images/dex-v2/pen.svg'
import { usePoolCreation } from 'state/dexV2/poolCreation/hooks/usePoolCreation'
import { useTokens } from 'state/dexV2/tokens/hooks/useTokens'
import useNumbers from 'hooks/dex-v2/useNumbers'

interface TokenPricesProps {
  toggleUnknownPriceModal?: () => void
}

const TokenPrices: React.FC<TokenPricesProps> = () => {
  const { tokensList } = usePoolCreation();
  const { getToken, priceFor, injectedPrices } = useTokens();
const { fNum } = useNumbers();

  console.log('tokensList', tokensList);

  return (
    <Container>
      <Flex alignItems="center" style={{ gap: 6 }} mb="6px">
        <Text fontSize={14} color="#B8B8D2">
          Token Prices
        </Text>
        <img src={InfoIcon} alt="info" />
      </Flex>

      <Flex
        fontSize={14}
        fontWeight={500}
        justifyContent="space-between"
        width="100%"
        alignItems="center"
        color="rgba(41, 41, 51, 0.90)"
        py="12px"
      >
        <Flex alignItems="center" style={{ gap: 6 }}>
          <img
            src="https://assets.coingecko.com/coins/images/4713/standard/polygon.png?1698233745"
            width={20}
            height={20}
          />
          <Text>SFP</Text>
        </Flex>
        <Flex alignItems="center" style={{ gap: 6 }}>
          <Text>$2.00</Text>
          <img src={PenIcon} alt="edit" />
        </Flex>
      </Flex>

      <Flex
        fontSize={14}
        fontWeight={500}
        justifyContent="space-between"
        width="100%"
        alignItems="center"
        color="rgba(41, 41, 51, 0.90)"
        py="12px"
      >
        <Flex alignItems="center" style={{ gap: 6 }}>
          <img
            src="https://assets.coingecko.com/coins/images/279/small/ethereum.png?1595348880"
            width={20}
            height={20}
          />
          <Text>USDT</Text>
        </Flex>

        <Flex alignItems="center" style={{ gap: 6 }}>
          <Text>$2.00</Text>
          <img src={PenIcon} alt="edit" />
        </Flex>
      </Flex>
    </Container>
  )
}

export default TokenPrices

const Container = styled.div`
  padding-top: 32px;
  border-top: solid 1px #e6e6ff;
`
