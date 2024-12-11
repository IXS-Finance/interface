import React, { useState } from 'react'
import styled from 'styled-components'

import TokenSelectInput from '../../common/TokenSelectInput'
import { Flex } from 'rebass'

interface TokenInputProps {}

const TokenInput: React.FC<TokenInputProps> = () => {
  const [_address, setAddress] = useState<any>('')
  const [excludedTokens, setExcludedTokens] = useState<string[]>([])

  const updateAddress = (address: string) => {
    setAddress(address)
  }
  return (
    <Container>
      <Flex justifyContent="space-between" alignItems="center">
        <StyledInput
          placeholder="0.00"
          min="0"
          step="0.01"
          onKeyDown={() => {}}
          type="text"
          inputMode="decimal"
          pattern="[0-9]*[.,]?[0-9]*"
          value={''}
          onChange={(e) => {}}
        />

        <TokenSelectInput modelValue={_address} excludedTokens={excludedTokens} updateAddress={updateAddress} />
      </Flex>

      <FiatValue>$0.00</FiatValue>
    </Container>
  )
}

export default TokenInput

const Container = styled.div`
  border-radius: 8px;
  background: #f7f7fa;
  display: flex;
  padding: 16px;
  flex-direction: column;
  gap: 8px;
`

const StyledInput = styled.input`
  color: rgba(41, 41, 51, 0.9);
  font-family: Inter;
  font-size: 28px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  letter-spacing: -0.84px;
  text-align: left;
  outline: none;
  border: none;
  background: transparent;
  min-width: 50px;
  max-width: 185px;
`

const FiatValue = styled.div`
  color: #b8b8d2;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  letter-spacing: -0.42px;
`
