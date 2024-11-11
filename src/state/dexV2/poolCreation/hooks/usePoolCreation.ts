import { useDispatch } from 'react-redux'
import { distributeWeights, setTokenLocked, setTokenWeight, setTokenWeights, setTokenAddress } from '..'
import { PoolSeedToken } from 'pages/DexV2/Pool/types'

export const usePoolCreation = () => {
  const dispatch = useDispatch()

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
    updateTokenWeights,
    updateTokenWeight,
    updateLockedWeight,
    updateTokenAddress,
  }
}
