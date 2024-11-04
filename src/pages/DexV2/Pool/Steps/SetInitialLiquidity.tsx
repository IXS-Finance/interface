import React, { useState } from 'react'
import { Line } from '../Create'
import styled from 'styled-components'

interface SetPoolFeesProps {}

const SetInitialLiquidity: React.FC<SetPoolFeesProps> = () => {
  return (
    <div>
      <LiquidityContainer>
        <FlexContainer>
          <TokenSymbol>SFP</TokenSymbol>
          <InputWrapper>
            <StyledInput placeholder="0" />
          </InputWrapper>
        </FlexContainer>
        <BalanceText>Balance: 256.13</BalanceText>
      </LiquidityContainer>
      <NavigationButtons>
        <BackButton>Back</BackButton>
        <NextButton>Next</NextButton>
      </NavigationButtons>
    </div>
  )
}

export default SetInitialLiquidity

const LiquidityContainer = styled.div`
  margin-top: 16px;
`

const FlexContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`

const TokenSymbol = styled.div`
  font-family: Inter;
  font-size: 16px;
  font-weight: 500;
  color: #292933;
`

const InputWrapper = styled.div`
  display: flex;
  align-items: center;
`

const StyledInput = styled.input`
  border: 1px solid #e6e6ff;
  border-radius: 8px;
  padding: 8px;
  font-family: Inter;
  font-size: 16px;
  color: #292933;
  outline: none;

  &:focus {
    border-color: #007bff;
  }
`

const BalanceText = styled.div`
  font-family: Inter;
  font-size: 14px;
  color: #84849d;
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
