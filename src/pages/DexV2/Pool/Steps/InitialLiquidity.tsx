import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useDispatch } from 'react-redux'

import { ReactComponent as WalletIcon } from 'assets/images/dex-v2/wallet.svg'
import { ReactComponent as WarningIcon } from 'assets/images/dex-v2/warning.svg'
import { Flex } from 'rebass'
import Switch from '../components/Switch'
import { usePoolCreationState } from 'state/dexV2/poolCreation/hooks'
import TokenInput from '../components/TokenInput'
import { isGreaterThan } from 'lib/utils/validations'
import { usePoolCreation } from 'state/dexV2/poolCreation/hooks/usePoolCreation'
import { setPoolCreationState, setTokenAmount } from 'state/dexV2/poolCreation'

interface SetPoolFeesProps {}

const InitialLiquidity: React.FC<SetPoolFeesProps> = () => {
  const { seedTokens, manuallySetToken, autoOptimiseBalances } = usePoolCreationState()
  const { tokensList, scaledLiquidity, getOptimisedLiquidity, proceed, goBack } = usePoolCreation()
  const dispatch = useDispatch()

  const [isOptimised, setIsOptimised] = useState(false)

  const handleAmountChange = (idx: number, amount: string) => {
    dispatch(setTokenAmount({ id: idx, amount }))
  }

  function optimiseLiquidity(force = false) {
    if (manuallySetToken && !force) return
    setIsOptimised(true)

    const optimisedLiquidity = getOptimisedLiquidity()

    seedTokens.forEach((token, idx) => {
      dispatch(setTokenAmount({ id: idx, amount: optimisedLiquidity[token.tokenAddress].balanceRequired }))
    })
  }

  function scaleLiquidity() {
    if (!autoOptimiseBalances || !manuallySetToken) return

    seedTokens.forEach((token, idx) => {
      if (token.tokenAddress !== manuallySetToken) {
        dispatch(setTokenAmount({ id: idx, amount: scaledLiquidity[token.tokenAddress].balanceRequired }))
      }
    })
  }

  function saveAndProcessed() {
    proceed()
  }

  useEffect(() => {
    optimiseLiquidity()
    scaleLiquidity()
  }, [manuallySetToken, autoOptimiseBalances])

  return (
    <div>
      {seedTokens.map((token, i) => {
        return (
          <TokenInput
            key={`tokenweight-${token.id}`}
            name={`initial-token-${token.tokenAddress}`}
            weight={token.weight}
            address={token.tokenAddress}
            amount={token.amount}
            rules={[isGreaterThan(0)]}
            updateAmount={(amount: any) => handleAmountChange(i, amount)}
          />
        )
      })}

      <Flex alignItems="center" style={{ gap: 8 }} marginTop={16}>
        <Switch />
        <SwitchText>Auto optimize liquidity</SwitchText>
      </Flex>

      <SummaryContainer>
        <SummaryItem>
          <div>Total</div>
          <div>$0.00</div>
        </SummaryItem>

        <SummaryItem>
          <div>
            Available: $0.00 <Maxed>Maxed</Maxed>
          </div>
          <Optimized>Optimized</Optimized>
        </SummaryItem>
      </SummaryContainer>

      <NavigationButtons>
        <BackButton onClick={() => goBack()}>Back</BackButton>
        <NextButton onClick={() => saveAndProcessed()}>Next</NextButton>
      </NavigationButtons>
    </div>
  )
}

export default InitialLiquidity

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

const ErrorText = styled.div`
  color: rgba(255, 128, 128, 0.9);
  text-align: center;
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  letter-spacing: -0.42px;
`

const SwitchText = styled.div`
  color: #b8b8d2;
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  letter-spacing: -0.42px;
`

const SummaryContainer = styled.div`
  margin-top: 16px;
  border-radius: 8px;
  border: 1px solid #e6e6ff;
  background: #fff;
  display: flex;
  padding: 16px;
  flex-direction: column;
  gap: 8px;
  align-self: stretch;
  color: rgba(41, 41, 51, 0.9);
  font-family: Inter;
  font-size: 14px;
  font-weight: 500;
`

const SummaryItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`

const Optimized = styled.div`
  color: #66f;
`

const Maxed = styled.span`
  color: #b8b8d2;
`
