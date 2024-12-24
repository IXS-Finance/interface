import React from 'react'
import { Flex } from 'rebass'
import styled from 'styled-components'
import ChevronDown from 'assets/images/dex-v2/chev-down.svg'
import InfoIcon from 'assets/images/dex-v2/info.svg'

const SwapDetail: React.FC = () => {
  return (
    <Container>
      <Flex justifyContent="space-between" alignItems="center" width="100%">
        <div>1 SFP = 240.23 USDC ($256.98)</div>
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
          <SummaryValue isRed>
            -2.68% <img src={InfoIcon} alt="icon" />
          </SummaryValue>
        </Flex>
        <Flex justifyContent="space-between" width="100%" alignItems="center">
          <SummaryKey>Max slippage</SummaryKey>
          <SummaryValue>
            -0.50% <img src={InfoIcon} alt="icon" />
          </SummaryValue>
        </Flex>
        <Flex justifyContent="space-between" width="100%" alignItems="center">
          <SummaryKey>Max. fees</SummaryKey>
          <SummaryValue>
            0.00331 POL <img src={InfoIcon} alt="icon" />
          </SummaryValue>
        </Flex>
        <Flex justifyContent="space-between" width="100%" alignItems="center">
          <SummaryKey>Order route</SummaryKey>
          <SummaryValue>
            BV2: 4 hops <img src={InfoIcon} alt="icon" />
          </SummaryValue>
        </Flex>
      </DetailContainer>
    </Container>
  )
}

export default SwapDetail

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
