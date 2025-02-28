import React, { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { useDispatch } from 'react-redux'

import { usePoolCreation } from 'state/dexV2/poolCreation/hooks/usePoolCreation'
import { usePoolCreationState } from 'state/dexV2/poolCreation/hooks'
import { setPoolCreationState } from 'state/dexV2/poolCreation'
import { Line } from '../..'
import BalCard from 'pages/DexV2/common/Card'
import BalStack from 'pages/DexV2/common/BalStack'
import { Box } from 'rebass'
import { configService } from 'services/config/config.service'

interface SetPoolFeesProps {}

const SetPoolFees: React.FC<SetPoolFeesProps> = () => {
  const { goBack, getPoolSymbol, proceed } = usePoolCreation()
  const { initialFee } = usePoolCreationState()
  const dispatch = useDispatch()

  const [fee, setFee] = useState((Number(initialFee) * 100).toString())
  const [name, setName] = useState('')
  const [isInvalidFee, setIsInvalidFee] = useState(false)

  const networkName = configService.network.name
  const poolSymbol = getPoolSymbol()

  const isProceedDisabled = useMemo(() => {
    if (isInvalidFee) return true

    return false
  }, [isInvalidFee])

  const onFeeChange = (value: string) => {
    if (!isNaN(Number(value)) || value === '') {
      setFee(value)
      dispatch(setPoolCreationState({ initialFee: (Number(value) / 100).toString() }))

      if (Number(value) < 0.0001 || Number(value) > 10) {
        setIsInvalidFee(true)
      } else {
        setIsInvalidFee(false)
      }
    }
  }

  function blockInvalidChar(event: KeyboardEvent) {
    if (['e', 'E', '+', '-'].includes(event.key)) {
      event.preventDefault()
    }
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>): void {
    blockInvalidChar(event.nativeEvent)
  }

  function onNameChange(value: string) {
    setName(value)
    dispatch(setPoolCreationState({ name: value }))
  }

  useEffect(() => {
    setName(poolSymbol)
    dispatch(setPoolCreationState({ symbol: poolSymbol, name: poolSymbol }))
  }, [poolSymbol])

  return (
    <BalCard shadow="xl" noBorder>
      <BalStack vertical spacing="sm">
        <Box color="#b8b8d2" fontSize="14px" fontWeight={500}>
          {networkName}
        </Box>
        <Box color="rgba(41, 41, 51, 0.9)" fontSize="20px" fontWeight={600}>
          Set pool fees
        </Box>

        <Line />

        <Title>Initial swap fees</Title>
        <Desc>0.30% is best for most weighted pools with established tokens. Go higher for more exotic tokens.</Desc>
        <Wrapper>
          <StyledInput
            placeholder="0"
            value={fee}
            min="0"
            step="0.01"
            onKeyDown={onKeyDown}
            type="text"
            inputMode="decimal"
            pattern="[0-9]*[.,]?[0-9]*"
            onChange={(e) => onFeeChange(e.target.value)}
          />
          <PercentSymbol>%</PercentSymbol>
        </Wrapper>
        <ButtonContainer>
          <StyledButton onClick={() => onFeeChange('0.1')}>0.1%</StyledButton>
          <StyledButton onClick={() => onFeeChange('0.3')}>0.3%</StyledButton>
          <StyledButton onClick={() => onFeeChange('0.5')}>0.5%</StyledButton>
          <StyledButton onClick={() => onFeeChange('1')}>1%</StyledButton>
        </ButtonContainer>

        <Line />
        <Title>Pool Name</Title>
        <Desc>
          Choose a name for your pool, or keep the auto-generated one based on tokens and weights. The pool symbol is
          set by your token choices and their weights.
        </Desc>

        <Wrapper>
          <StyledInput placeholder={name} value={name} onChange={(e) => onNameChange(e.target.value)} />
        </Wrapper>

        <NavigationButtons>
          <BackButton onClick={goBack}>Back</BackButton>
          <NextButton disabled={isProceedDisabled} onClick={proceed}>
            Next
          </NextButton>
        </NavigationButtons>
      </BalStack>
    </BalCard>
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
    transform: scale(0.99);
  }

  &:disabled {
    background: #ececfb;
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
    transform: scale(0.99);
  }

  &:disabled {
    background: #ececfb;
  }
`
