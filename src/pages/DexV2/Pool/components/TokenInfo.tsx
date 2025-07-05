import React, { useMemo } from 'react'
import { Flex } from 'rebass'
import BigNumber from 'bignumber.js'
import styled from 'styled-components'

import { useTokens } from 'state/dexV2/tokens/hooks/useTokens'
import { Line } from '../Create'
import useNumbers, { FNumFormats } from 'hooks/dex-v2/useNumbers'
import { PoolSeedToken } from 'pages/DexV2/types'
import { bnum } from 'lib/utils'
import Asset from 'pages/DexV2/common/Asset'

interface TokenInfoProps {
  address: string
  initialWeights: Record<string, BigNumber>
  token: PoolSeedToken
}

const TokenInfo: React.FC<TokenInfoProps> = (props) => {
  const { address = '', initialWeights, token } = props

  const { fNum } = useNumbers()
  const { getToken, priceFor } = useTokens()

  const tokenInfo = address ? getToken(address) : null

  return (
    <div>
      <Flex justifyContent="space-between">
        <Flex alignItems="center">
          <Asset address={tokenInfo?.address} iconURI={tokenInfo?.logoURI} size={40} />
          <div style={{ marginLeft: 12 }}>
            <Title>{tokenInfo?.name}</Title>
            <Description>Initial weight: {fNum(initialWeights[address].toString(), FNumFormats.percent)}</Description>
          </div>
        </Flex>

        <div>
          <Title style={{ textAlign: 'right' }}>{fNum(token?.amount, FNumFormats.token)}</Title>
          <Description>
            {fNum(bnum(token.amount).times(priceFor(token.tokenAddress)).toString(), FNumFormats.fiat)}
          </Description>
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
