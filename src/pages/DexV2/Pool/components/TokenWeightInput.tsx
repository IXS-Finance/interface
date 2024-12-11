import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import TokenSelectInput from '../../common/TokenSelectInput'

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
  excludedTokens: string[]
  showWarningIcon?: boolean
  updateWeight: (weight: string) => void
  updateLocked: (isLocked: boolean) => void
  deleteItem: () => void
  updateAddress: (address: string) => void
}

function blockInvalidChar(event: KeyboardEvent) {
  if (['e', 'E', '+', '-'].includes(event.key)) {
    event.preventDefault()
  }
}

const TokenWeightInput: React.FC<TokenWeightInputProps> = ({
  weight = 0,
  address,
  excludedTokens = [],
  updateWeight,
  updateLocked,
  deleteItem,
  updateAddress,
}) => {
  const [_weight, setWeight] = useState<any>('')
  const [_address, setAddress] = useState<any>('')
  const [isLocked, setLocked] = useState(false)

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (!isNaN(Number(value)) || value === '') {
      setWeight(value)
      updateWeight(value)
      updateLocked(true)
      setLocked(true)
    }
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>): void {
    blockInvalidChar(event.nativeEvent)
  }

  const handleLocked = () => {
    setLocked(!isLocked)
    updateLocked(!isLocked)
  }

  const handleDelete = () => {
    deleteItem()
  }

  useEffect(() => {
    setWeight(weight)
  }, [weight])

  useEffect(() => {
    setAddress(address)
  }, [address])

  return (
    <Container>
      <TokenSelectInput modelValue={_address} excludedTokens={excludedTokens} updateAddress={updateAddress} />

      <InputWrap>
        <Input
          placeholder="0.0"
          value={_weight}
          onChange={onChange}
          min="0"
          step="0.01"
          onKeyDown={onKeyDown}
          type="text"
          inputMode="decimal"
          pattern="[0-9]*[.,]?[0-9]*"
        />
        <Percent>%</Percent>

        <StyledButton onClick={handleLocked}>{isLocked ? <StyledUnLock /> : <StyledLock />}</StyledButton>

        <StyledButton onClick={handleDelete}>
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

const StyledUnLock = styled(Lock)`
  &:hover {
    path {
      stroke: #6666ff;
    }
  }
`

const StyledLock = styled(Unlock)`
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
