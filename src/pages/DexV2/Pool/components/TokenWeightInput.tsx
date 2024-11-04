import React from 'react'
import styled from 'styled-components'
import TokenSelectInput from './TokenSelectInput'

import { ReactComponent as Lock } from 'assets/images/dex-v2/lock.svg'
import { ReactComponent as Unlock } from 'assets/images/dex-v2/unlock.svg'
import { ReactComponent as Trash } from 'assets/images/dex-v2/trash.svg'

interface TokenWeightInputProps {}

const TokenWeightInput: React.FC<TokenWeightInputProps> = () => {
  return (
    <Container>
      <TokenSelectInput />

      <InputWrap>
        <Input placeholder="Weight" value="50" />
        <Percent>%</Percent>

        <StyledButton>
          <StyledUnlock />
        </StyledButton>

        <StyledButton>
          <StyledTrash/>
        </StyledButton>
      </InputWrap>
    </Container>
  )
}

export default TokenWeightInput

const Container = styled.div`
  display: flex;
  padding: 16px;
  justify-content: space-between;
  align-items: center;
  align-self: stretch;
  border-radius: 8px;
  background: #f7f7fa;
  margin-top: 16px;
`

const InputWrap = styled.div`
  display: flex;
  align-items: center;
`

const Input = styled.input`
  color: rgba(41, 41, 51, 0.9);
  font-family: Inter;
  font-size: 20px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  letter-spacing: -0.6px;
  outline: none;
  border: none;
  background: transparent;
  text-align: right;
  max-width: 140px;
`

const Percent = styled.span`
  color: rgba(41, 41, 51, 0.9);
  font-family: Inter;
  font-size: 20px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  letter-spacing: -0.6px;
`

const StyledLock = styled(Lock)`
  &:hover {
    path {
      stroke: #6666ff;
    }
  }
`

const StyledUnlock = styled(Unlock)`
  &:hover {
    path {
      stroke: #6666ff;
    }
  }
`

const StyledTrash = styled(Trash)`
  &:hover {
    path {
      stroke: #EF4444;
    }
  }
`

const StyledButton = styled.button`
  display: flex;
  padding: 8px;
  align-items: center;
  gap: 8px;
  border-radius: 8px;
  border: 1px solid #e6e6ff;
  background: #fff;
  cursor: pointer;
  margin-left: 8px;
`
