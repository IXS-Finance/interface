import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { Box, Flex } from 'rebass'

import { ReactComponent as Trash } from 'assets/images/dex-v2/trash.svg'
import AssetSet from 'pages/DexV2/common/AssetSet'

interface PoolWeightInputProps {
  tokensList: string[]
  weight?: number
  label?: string
  fixedToken?: boolean
  hint?: string
  hintAmount?: string
  showWarningIcon?: boolean
  updateWeight: (weight: string) => void
  updateLocked: (isLocked: boolean) => void
  deleteItem: () => void
}

function blockInvalidChar(event: KeyboardEvent) {
  if (['e', 'E', '+', '-'].includes(event.key)) {
    event.preventDefault()
  }
}

const PoolWeightInput: React.FC<PoolWeightInputProps> = ({
  weight = 0,
  label,
  tokensList,
  updateWeight,
  updateLocked,
  deleteItem,
}) => {
  const [_weight, setWeight] = useState<any>('')

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (!isNaN(Number(value)) || value === '') {
      setWeight(value)
      updateWeight(value)
      updateLocked(true)
    }
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>): void {
    blockInvalidChar(event.nativeEvent)
  }

  const handleDelete = () => {
    deleteItem()
  }

  useEffect(() => {
    setWeight(weight)
  }, [weight])

  return (
    <Container>
      <Flex css={{ gap: '8px' }} alignItems="center">
        <AssetSet addresses={tokensList} width={70} />
        <Box color="#292933" fontSize="14px" fontWeight={600}>
          {label}
        </Box>
      </Flex>

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

        <StyledButton onClick={handleDelete}>
          <StyledTrash />
        </StyledButton>
      </InputWrap>
    </Container>
  )
}

export default PoolWeightInput

const Container = styled.div`
  display: flex;
  padding: 16px;
  justify-content: space-between;
  align-items: center;
  align-self: stretch;
  border-radius: 8px;
  background: #f7f7fa;
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
