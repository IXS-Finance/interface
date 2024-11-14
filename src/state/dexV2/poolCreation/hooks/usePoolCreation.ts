import { useDispatch } from 'react-redux'
import { useMemo } from 'react'

import { distributeWeights, setTokenLocked, setTokenWeight, setTokenWeights, setTokenAddress } from '..'
import { PoolSeedToken } from 'pages/DexV2/Pool/types'
import { usePoolCreationState } from '.'
import { bnum } from 'lib/utils'
import { useTokens } from 'state/dexV2/tokens/hooks/useTokens'

export const usePoolCreation = () => {
  const dispatch = useDispatch()
  const { tokensList } = usePoolCreationState()
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
    dispatch(distributeWeights())
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

  return {
    totalLiquidity,
    updateTokenWeights,
    updateTokenWeight,
    updateLockedWeight,
    updateTokenAddress,
  }
}
