import { useDispatch } from 'react-redux'
import { useMemo } from 'react'

import { setActiveStep, setTokenLocked, setTokenWeight, setTokenWeights, setTokenAddress, addTokenWeight } from '..'
import { PoolSeedToken } from 'pages/DexV2/Pool/types'
import { usePoolCreationState } from '.'
import { bnum } from 'lib/utils'
import { useTokens } from 'state/dexV2/tokens/hooks/useTokens'

export const usePoolCreation = () => {
  const dispatch = useDispatch()
  const { tokensList, activeStep } = usePoolCreationState()
  const { priceFor, balanceFor } = useTokens()

  const totalLiquidity = useMemo(() => {
    let total = bnum(0)
    for (const token of tokensList) {
      total = total.plus(bnum(priceFor(token)).times(balanceFor(token)))
    }
    return total
  }, [JSON.stringify(tokensList)])

  function updateTokenWeights(weights: PoolSeedToken[]) {
    dispatch(setTokenWeights(weights))
  }

  function addTokenWeightToPool(token: PoolSeedToken) {
    dispatch(addTokenWeight(token))
  }

  function updateTokenWeight(id: number, weight: number) {
    dispatch(setTokenWeight({ id, weight }))
  }

  function updateTokenAddress(id: number, tokenAddress: string) {
    dispatch(setTokenAddress({ id, tokenAddress }))
  }

  function updateLockedWeight(id: number, isLocked: boolean) {
    dispatch(setTokenLocked({ id, isLocked }))
  }

  function proceed() {
    dispatch(setActiveStep(activeStep + 1))
  }

  function goBack() {
    if (activeStep === 3) {
      dispatch(setActiveStep(1))
      return
    }
    dispatch(setActiveStep(activeStep - 1))
  }

  return {
    totalLiquidity,
    updateTokenWeights,
    updateTokenWeight,
    updateLockedWeight,
    updateTokenAddress,
    addTokenWeightToPool,
    proceed,
    goBack,
  }
}
