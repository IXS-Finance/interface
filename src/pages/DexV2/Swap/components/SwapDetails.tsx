import React, { useState } from 'react'
import { Flex } from 'rebass'
import styled from 'styled-components'
import _get from 'lodash/get'

import { ChevronDown, ChevronUp } from 'react-feather'
import InfoIcon from 'assets/images/dex-v2/info.svg'
import { UseSwapping } from 'state/dexV2/swap/useSwapping'
import useNumbers, { FNumFormats } from 'hooks/dex-v2/useNumbers'
import SwapRate from './SwapRate'

type Props = {
  swapping: UseSwapping
  hopCount: number
}

const SwapDetails: React.FC<Props> = ({ swapping, hopCount }) => {
  const { fNum } = useNumbers()

  const [visible, setVisible] = useState(false)

  const priceImpact = _get(swapping, 'sor.priceImpact', 0)
  const priceImpactDisplay = fNum(priceImpact, FNumFormats.percent)

  function toggleVisible() {
    setVisible(!visible)
  }

  return (
    <Container>
      <Flex
        justifyContent="space-between"
        alignItems="center"
        width="100%"
        css={{ cursor: 'pointer' }}
        onClick={toggleVisible}
      >
        <SwapRate swapping={swapping} />
        <Flex alignItems="center" style={{ gap: 8, cursor: 'pointer' }}>
          <DetailText>Detail</DetailText>
          <Flex alignItems="center" color="#B8B8D2">
            {visible ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </Flex>
        </Flex>
      </Flex>

      {visible ? (
        <DetailContainer>
          <Flex justifyContent="space-between" width="100%" alignItems="center">
            <SummaryKey>Price impact</SummaryKey>
            <SummaryValue isRed={priceImpact < 0}>
              {priceImpactDisplay} <img src={InfoIcon} alt="icon" />
            </SummaryValue>
          </Flex>
          <Flex justifyContent="space-between" width="100%" alignItems="center">
            <SummaryKey>Swap route</SummaryKey>
            <SummaryValue>
              {hopCount ? hopCount + ` ${hopCount > 1 ? 'hops' : 'hop'}` : '--'} <img src={InfoIcon} alt="icon" />
            </SummaryValue>
          </Flex>
        </DetailContainer>
      ) : null}
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
