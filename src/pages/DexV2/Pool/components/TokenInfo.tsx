import React, { useMemo } from 'react'
import { Flex } from 'rebass'

import { useTokens } from 'state/dexV2/tokens/hooks/useTokens'
import styled from 'styled-components'
import { Line } from '../Create'

interface TokenInfoProps {
  address: string
}

const TokenInfo: React.FC<TokenInfoProps> = (props) => {
  const { address = '' } = props

  const { getToken, balanceFor } = useTokens()

  const tokenInfo = useMemo(() => {
    if (!address) {
      return null
    }

    return getToken(address)
  }, [address])

  return (
    <div>
      <Flex justifyContent="space-between">
        <Flex alignItems="center">
          <img src={tokenInfo?.logoURI} alt={tokenInfo?.name} width={40} height={40} />
          <div style={{ marginLeft: 12 }}>
            <Title>{tokenInfo?.name}</Title>
            <Description>Initial weight: 50.00%</Description>
          </div>
        </Flex>

        <div>
          <Title>5</Title>
          <Description>$25</Description>
        </div>
      </Flex>
      <Line />
    </div>
  )
}

export default TokenInfo

const Title = styled.div`
  color: rgba(41, 41, 51, 0.9);
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  letter-spacing: -0.42px;
`

const Description = styled.div`
  color: #b8b8d2;
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  letter-spacing: -0.42px;
  margin-top: 4px;
`
