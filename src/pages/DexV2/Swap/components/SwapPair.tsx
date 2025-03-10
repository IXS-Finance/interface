import React, { useEffect, useState } from 'react'
import { Box } from 'rebass'
import styled from 'styled-components'

import TokenInput from './TokenInput'
import SwapIcon from 'assets/images/dex-v2/swap.svg'
import { emptyToken, UseSwapping } from 'state/dexV2/swap/useSwapping'
import useNumbers, { FNumFormats } from 'hooks/dex-v2/useNumbers'
import { useTokens } from 'state/dexV2/tokens/hooks/useTokens'
import { useSwapState } from 'state/dexV2/swap/useSwapState'
import { bnum } from 'lib/utils'

type Props = {
  exactIn: boolean
  priceImpact?: number
  swapLoading?: boolean
  amountChange: () => void
  setExactIn: (exactIn: boolean) => void
}

const SwapPair: React.FC<Props> = ({
  exactIn,
  priceImpact,
  swapLoading,
  amountChange,
  setExactIn,
}) => {
  const {
    tokenInAddress,
    tokenOutAddress,
    tokenInAmount,
    tokenOutAmount,
    setTokenInAddress,
    setTokenOutAddress,
    setTokenInAmount,
    setTokenOutAmount,
  } = useSwapState()

  function handleInAmountChange(value: string): void {
    setTokenInAmount(value)
  }

  function handleOutAmountChange(value: string): void {
    setTokenOutAmount(value)
  }

  function handleTokenSwitch(): void {
    setExactIn(!exactIn)
    setTokenInAmount(tokenOutAmount)
    setTokenInAddress(tokenOutAddress)
    setTokenOutAmount(tokenInAmount)
    setTokenOutAddress(tokenInAddress)
    amountChange()
  }

  async function handleInputTokenChange(newTokenIn: string) {
    if (newTokenIn === tokenOutAddress) {
      handleTokenSwitch()
      return
    }
    setTokenInAddress(newTokenIn)
  }

  async function handleOutputTokenChange(newTokenOut: string) {
    if (newTokenOut === tokenInAddress) {
      handleTokenSwitch()
      return
    }
    setTokenOutAddress(newTokenOut)
  }

  useEffect(() => {
    // populates initial tokenOutAmount
    if (tokenOutAmount) {
      handleOutAmountChange(tokenOutAmount)
    }
  }, [])

  return (
    <Container>
      <div>
        <TokenInput
          disabled={swapLoading}
          amount={tokenInAmount}
          address={tokenInAddress}
          name="tokenIn"
          excludedTokens={[]}
          autoFocus
          updateAmount={handleInAmountChange}
          updateAddress={handleInputTokenChange}
          setMax={() => setExactIn(true)}
          setExactInOnChange={() => setExactIn(true)}
        />
      </div>

      <Box mt={24} css={{ position: 'relative' }}>
        <SwapIconWrapper onClick={handleTokenSwitch}>
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M1 10L3.29289 12.2929C3.92286 12.9229 5 12.4767 5 11.5858V1"
              stroke="#B8B8CC"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M14 5L11.7071 2.70711C11.0771 2.07714 10 2.52331 10 3.41421V14"
              stroke="#B8B8CC"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </SwapIconWrapper>
        <TokenInput
          disabled={swapLoading}
          amount={tokenOutAmount}
          address={tokenOutAddress}
          name="tokenOut"
          excludedTokens={[]}
          noRules
          noMax
          disableNativeAssetBuffer
          updateAmount={handleOutAmountChange}
          updateAddress={handleOutputTokenChange}
          setExactInOnChange={() => setExactIn(false)}
        />
      </Box>
    </Container>
  )
}

export default SwapPair

const Container = styled.div``

const SwapIconWrapper = styled.div`
  position: absolute;
  top: -12%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: #ffffff;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0px 0px 64px 0px rgba(102, 102, 255, 0.1);
  cursor: pointer;

  &:hover {
    background: #6666ff;
    svg {
      path {
        stroke: #ffffff;
      }
    }
  }
`
