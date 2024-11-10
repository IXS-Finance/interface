import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import TokenSelectInput from './TokenSelectInput'

import { ReactComponent as Lock } from 'assets/images/dex-v2/lock.svg'
import { ReactComponent as Unlock } from 'assets/images/dex-v2/unlock.svg'
import { ReactComponent as Trash } from 'assets/images/dex-v2/trash.svg'

interface TokenWeightInputProps {
  address?: string
  weight?: number
  label?: string
  fixedToken?: boolean
  hint?: string
  hintAmount?: string
  excludedTokens?: string[]
  showWarningIcon?: boolean
  updateWeight: (weight: string) => void
}

const TokenWeightInput: React.FC<TokenWeightInputProps> = ({ weight, address, updateWeight }) => {
  const [_weight, setWeight] = useState<any>('')
  const [_address, setAddress] = useState<any>('')

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    updateWeight(value)
  }

  useEffect(() => {
    setWeight(weight ? weight.toString() : '')
    setAddress(address)
  }, [weight])

  return (
    <Container>
      <TokenSelectInput modelValue={_address} />

      <InputWrap>
        <Input placeholder="0.0" value={_weight} onChange={onChange} />
        <Percent>%</Percent>

        <StyledButton>
          <StyledUnlock />
        </StyledButton>

        <StyledButton>
          <StyledTrash />
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
      stroke: #ef4444;
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
