import { useDispatch } from 'react-redux'
import { setPoolCreationState, setTokenLocked, setTokenWeight } from '..'
import { PoolSeedToken } from 'pages/DexV2/Pool/types'

export const usePoolCreation = () => {
  const dispatch = useDispatch()

  function updateTokenWeights(weights: PoolSeedToken[]) {
    dispatch(setPoolCreationState({ seedTokens: weights }))
  }

  function updateTokenWeight(id: number, weight: number) {
    dispatch(setTokenWeight({ id, weight }))
  }

  function updateLockedWeight(id: number, isLocked: boolean) {
    dispatch(setTokenLocked({ id, isLocked }))
  }

  return {
    updateTokenWeights,
    updateTokenWeight,
    updateLockedWeight,
  }
}
