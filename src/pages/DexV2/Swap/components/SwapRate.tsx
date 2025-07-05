import useNumbers, { FNumFormats } from 'hooks/dex-v2/useNumbers'
import { bnum } from 'lib/utils'
import React, { useMemo, useState } from 'react'
import { Text } from 'rebass'
import { emptyToken, UseSwapping } from 'state/dexV2/swap/useSwapping'
import { useSwapState } from 'state/dexV2/swap/useSwapState'
import { useTokens } from 'state/dexV2/tokens/hooks/useTokens'

interface SwapRateProps {
  swapping: UseSwapping
}

const SwapRate: React.FC<SwapRateProps> = ({ swapping }) => {
  const { tokenInAddress, tokenOutAddress, tokenInAmount, tokenOutAmount } = useSwapState()
  const { getToken } = useTokens()
  const { fNum } = useNumbers()

  const [isInRate, setIsInRate] = useState(true)

  const missingToken = !tokenInAddress || !tokenOutAddress
  const missingAmount = !tokenInAmount || !tokenOutAmount
  const tokenIn = tokenInAddress ? getToken(tokenInAddress) : emptyToken
  const tokenOut = tokenOutAddress ? getToken(tokenOutAddress) : emptyToken

  const rateLabel = useMemo(() => {
    if (missingToken || missingAmount) return ''

    if (swapping.effectivePriceMessage)
      return isInRate ? swapping.effectivePriceMessage.tokenIn : swapping.effectivePriceMessage.tokenOut

    let rate: any, inSymbol, outSymbol

    if (isInRate) {
      rate = bnum(tokenOutAmount).div(tokenInAmount).toString()
      inSymbol = tokenIn.symbol
      outSymbol = tokenOut.symbol
    } else {
      rate = bnum(tokenInAmount).div(tokenOutAmount).toString()
      inSymbol = tokenOut.symbol
      outSymbol = tokenIn.symbol
    }

    return `1 ${inSymbol} = ${fNum(rate, FNumFormats.token)} ${outSymbol}`
  }, [missingAmount, missingToken, isInRate, tokenIn, tokenOut, tokenInAmount, tokenOutAmount, swapping.effectivePriceMessage])

  return (
    <Text css={{ cursor: 'pointer', color: 'rgba(41, 41, 51, 0.90)' }} fontSize={14} onClick={() => setIsInRate(!isInRate)}>
      {rateLabel}
    </Text>
  )
}

export default SwapRate
