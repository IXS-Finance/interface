import React, { useState } from 'react'
import styled from 'styled-components'

interface TokenInputProps {}

const TokenInput: React.FC<TokenInputProps> = () => {
  return (
    <Container>
      <div>
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
      </div>
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
  align-items: center;
  gap: 8px;
  align-self: stretch;
`

const StyledInput = styled.input`
  color: rgba(41, 41, 51, 0.9);
  font-family: Inter;
  font-size: 28px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  letter-spacing: -0.84px;
  text-align: right;
  outline: none;
  border: none;
  background: transparent;
  min-width: 50px;
`
