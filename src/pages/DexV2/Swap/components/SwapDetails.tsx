import React from 'react'
import { Flex } from 'rebass'
import styled from 'styled-components'
import _get from 'lodash/get'

import ChevronDown from 'assets/images/dex-v2/chev-down.svg'
import InfoIcon from 'assets/images/dex-v2/info.svg'
import { UseSwapping } from 'state/dexV2/swap/useSwapping'
import useNumbers, { FNumFormats } from 'hooks/dex-v2/useNumbers'
import { bn } from 'lib/balancer/utils/numbers'
import useUserSettings from 'state/dexV2/userSettings/useUserSettings'
import { WrapType } from 'lib/utils/balancer/wrapper'
import SwapRate from './SwapRate'
import SwapRoute from './SwapRoute'
import { SubgraphPoolBase } from '@ixswap1/dex-v2-sdk'

type Props = {
  swapping: UseSwapping
  pools: SubgraphPoolBase[]
}

const SwapDetails: React.FC<Props> = ({ swapping, pools }) => {
  const { fNum, toFiat } = useNumbers()
  const { slippage, slippageDecimal } = useUserSettings()

  const wrapType = _get(swapping, 'wrapType', '')
  const isNativeWrapOrUnwrap = wrapType === WrapType.Wrap || wrapType === WrapType.Unwrap
  const priceImpact = _get(swapping, 'sor.priceImpact', 0)
  const priceImpactDisplay = fNum(priceImpact, FNumFormats.percent)
  // Removed useMemo - assign directly:
  const showSwapRoute = swapping.isBalancerSwap

  return (
    <Container>
      <Flex justifyContent="space-between" alignItems="center" width="100%">
        <SwapRate swapping={swapping} />
        <Flex alignItems="center" style={{ gap: 8, cursor: 'pointer' }}>
          <DetailText>Detail</DetailText>
          <div style={{ width: 8 }}>
            <img src={ChevronDown} alt="Chevron Down" style={{ width: '100%', height: 'auto' }} />
          </div>
        </Flex>
      </Flex>

      <DetailContainer>
        <Flex justifyContent="space-between" width="100%" alignItems="center">
          <SummaryKey>Price impact</SummaryKey>
          <SummaryValue isRed={priceImpact < 0}>
            {priceImpactDisplay} <img src={InfoIcon} alt="icon" />
          </SummaryValue>
        </Flex>

        {showSwapRoute && swapping?.tokenIn && swapping?.tokenOut ? (
          <SwapRoute
            addressIn={swapping?.tokenIn?.address}
            addressOut={swapping?.tokenOut?.address}
            amountIn={swapping?.tokenInAmountInput}
            amountOut={swapping?.tokenOutAmountInput}
            pools={pools}
            sorReturn={swapping.sor.sorReturn}
          />
        ) : null}
      </DetailContainer>
    </Container>
  )
}

export default SwapDetails

const Container = styled.div`
  display: flex;
  padding: 10px 16px;
  flex-direction: column;
  align-items: center;
  align-self: stretch;
  width: 100%;
  gap: 8px;
  border-radius: 8px;
  border: 1px solid #e6e6ff;
  background: #fff;
  font-size: 14px;
  font-weight: 500;
`

const DetailText = styled.div`
  color: #b8b8d2;
`

const DetailContainer = styled.div`
  width: 100%;
`

const SummaryKey = styled.div`
  color: #b8b8d2;
  font-family: Inter;
  font-size: 12px;
  font-style: normal;
  font-weight: 500;
  line-height: 220%; /* 26.4px */
  letter-spacing: -0.24px;
`

const SummaryValue = styled.div<{ isRed?: boolean }>`
  color: ${({ isRed }) => (isRed ? '#FF8080' : 'rgba(41, 41, 51, 0.9)')};
  text-align: right;
  font-family: Inter;
  font-size: 12px;
  font-style: normal;
  font-weight: 500;
  line-height: 220%; /* 26.4px */
  letter-spacing: -0.24px;
  display: flex;
  align-items: center;
  gap: 8px;
`

