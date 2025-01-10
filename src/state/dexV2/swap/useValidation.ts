import { useMemo } from 'react'

import { bnum } from 'lib/utils'
import { useAccount } from 'wagmi'
import { useTokens } from '../tokens/hooks/useTokens'

export enum SwapValidation {
  VALID,
  NO_ACCOUNT,
  EMPTY,
  NO_NATIVE_ASSET,
  NO_BALANCE,
  NO_LIQUIDITY,
}

export default function useValidation(
  tokenInAddress: string,
  tokenInAmount: string,
  tokenOutAddress: string,
  tokenOutAmount: string
) {
  const { address } = useAccount()
  const { balances } = useTokens()

  const noAmounts = !isValidTokenAmount(tokenInAmount) && !isValidTokenAmount(tokenOutAmount)
  const missingToken = !tokenInAddress || !tokenOutAddress
  const exceedsBalance = !balances[tokenInAddress] || bnum(balances[tokenInAddress]).lt(tokenInAmount)

  const validationStatus = useMemo(() => {
    if (noAmounts || missingToken) return SwapValidation.EMPTY

    if (address && exceedsBalance) return SwapValidation.NO_BALANCE

    return SwapValidation.VALID
  }, [noAmounts, missingToken, exceedsBalance])

  function isValidTokenAmount(tokenAmount: string) {
    return bnum(tokenAmount).gt(0) && tokenAmount.trim() !== ''
  }

  const errorMessage = validationStatus

  return {
    validationStatus,
    errorMessage,
    isValidTokenAmount,
  }
}
