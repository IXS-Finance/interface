import React from 'react'
import styled from 'styled-components'
import { BackButton, Line, NavigationButtons, NextButton } from '../Create'
import { usePoolCreationState } from 'state/dexV2/poolCreation/hooks'
import TokenInfo from '../components/TokenInfo'
import { Flex } from 'rebass'

const PreviewPool: React.FC = () => {
  const { seedTokens } = usePoolCreationState()

  console.log('seedTokens', seedTokens)
  return (
    <div>
      <SubTitle>Tokens and initial seed liquidity</SubTitle>
      <Line />

      {seedTokens.length > 0 ? (
        <div>
          {seedTokens.map((token, i) => {
            return <TokenInfo key={`token-${i}`} address={token.tokenAddress} />
          })}
        </div>
      ) : null}

      <Flex justifyContent="space-between">
        <Total>Total</Total>
        <Total>$100</Total>
      </Flex>

      <SummaryContainer>
        <SummaryTitle>Summary</SummaryTitle>
        <Flex justifyContent="space-between" width="100%">
          <SummaryKey>Pool name</SummaryKey>
          <SummaryValue>50SFP-50USDT</SummaryValue>
        </Flex>
        <Flex justifyContent="space-between" width="100%">
          <SummaryKey>Pool symbol</SummaryKey>
          <SummaryValue>50SFP-50USDT</SummaryValue>
        </Flex>
        <Flex justifyContent="space-between" width="100%">
          <SummaryKey>Pool type</SummaryKey>
          <SummaryValue>Weighted</SummaryValue>
        </Flex>
        <Flex justifyContent="space-between" width="100%">
          <SummaryKey>Swap fee</SummaryKey>
          <SummaryValue>0.30%</SummaryValue>
        </Flex>
        <Flex justifyContent="space-between" width="100%">
          <SummaryKey>Swap fee manager</SummaryKey>
          <SummaryValue>IX Swap</SummaryValue>
        </Flex>
      </SummaryContainer>

      <NavigationButtons>
        <BackButton>Back</BackButton>
        <NextButton>Next</NextButton>
      </NavigationButtons>
    </div>
  )
}

export default PreviewPool

const SubTitle = styled.div`
  color: rgba(41, 41, 51, 0.9);
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  letter-spacing: -0.42px;
  margin-top: 16px;
`

const Total = styled.div`
  color: rgba(41, 41, 51, 0.9);
  text-align: center;
  font-family: Inter;
  font-size: 15px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  letter-spacing: -0.45px;
`

const SummaryContainer = styled.div`
  border-radius: 8px;
  border: 1px solid #e6e6ff;
  background: #fff;
  display: flex;
  padding: 16px;
  flex-direction: column;
  gap: 8px;
  align-self: stretch;
  margin-top: 32px;
`

const SummaryTitle = styled.div`
  color: rgba(41, 41, 51, 0.9);
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 200%; /* 28px */
  letter-spacing: -0.28px;
`

const SummaryKey = styled.div`
  color: #b8b8d2;
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  letter-spacing: -0.42px;
`

const SummaryValue = styled.div`
  color: rgba(41, 41, 51, 0.9);
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  letter-spacing: -0.42px;
`
