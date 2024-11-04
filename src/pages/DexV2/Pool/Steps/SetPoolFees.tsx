import React, { useState } from 'react'
import { Line } from '../Create'
import styled from 'styled-components'

interface SetPoolFeesProps {}

const SetPoolFees: React.FC<SetPoolFeesProps> = () => {
  return (
    <div>
      <Line />

      <Title>Initial swap fees</Title>
      <Desc>0.30% is best for most weighted pools with established tokens. Go higher for more exotic tokens.</Desc>
      <Wrapper>
        <StyledInput placeholder="0" />
        <PercentSymbol>%</PercentSymbol>
      </Wrapper>
      <ButtonContainer>
        <StyledButton>0.1%</StyledButton>
        <StyledButton>0.3%</StyledButton>
        <StyledButton>0.5%</StyledButton>
        <StyledButton>1%</StyledButton>
      </ButtonContainer>

      <Line />
      <Title>Pool Name</Title>
      <Desc>
        Choose a name for your pool, or keep the auto-generated one based on tokens and weights. The pool symbol is set
        by your token choices and their weights.
      </Desc>

      <Wrapper>
        <StyledInput placeholder="SFP50-USDC50" />
      </Wrapper>

      <NavigationButtons>
        <BackButton>Back</BackButton>
        <NextButton>Next</NextButton>
      </NavigationButtons>
    </div>
  )
}

export default SetPoolFees

const Title = styled.div`
  color: rgba(41, 41, 51, 0.9);
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  letter-spacing: -0.42px;
`

const Desc = styled.div`
  color: #84849d;
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 150%; /* 21px */
  letter-spacing: -0.42px;
`

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid #e6e6ff;
  background: #fff;
  border-radius: 8px;
  padding: 0 16px;
  margin-top: 16px;
  height: 50px;
`

const StyledInput = styled.input`
  border: none;
  outline: none;
  color: #b8b8d2;
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  letter-spacing: -0.42px;
  flex: 1;
`

const PercentSymbol = styled.div`
  margin-left: 8px;
  color: #b8b8d2;
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  letter-spacing: -0.42px;
`

const ButtonContainer = styled.div`
  display: flex;
  margin-top: 16px;
  gap: 8px;
`

const StyledButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 33px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid #e6e6ff;
  background: #fff;
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  letter-spacing: -0.42px;
  color: #292933;
  cursor: pointer;

  &:hover {
    background: #f0f0ff;
  }
`

const NavigationButtons = styled.div`
  display: flex;
  margin-top: 16px;
  gap: 8px;
`

const BackButton = styled.button`
  display: flex;
  height: 48px;
  padding: 12px 16px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  flex: 1 0 0;
  border-radius: 8px;
  border: 1px solid #e6e6ff;
  background: #fff;
  color: #66f;
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  letter-spacing: -0.28px;
  cursor: pointer;

  &:hover {
    background: #f0f0ff;
  }
`

const NextButton = styled.button`
  display: flex;
  height: 48px;
  padding: 12px 16px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  flex: 1 0 0;
  border-radius: 8px;
  background: #66f;
  font-family: Inter;
  color: #fff;
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  letter-spacing: -0.28px;
  cursor: pointer;
  border: none;

  &:hover {
    background: #dcdcfb;
  }

  &:disabled {
    background: #ececfb;
  }
`
