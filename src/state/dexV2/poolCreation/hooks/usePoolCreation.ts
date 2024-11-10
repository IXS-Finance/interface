import { useDispatch } from 'react-redux'
import { distributeWeights, setPoolCreationState, setTokenWeight } from '..'
import { PoolSeedToken } from 'pages/DexV2/Pool/types'

export const usePoolCreation = () => {
  const dispatch = useDispatch()

  function updateTokenWeights(weights: PoolSeedToken[]) {
    dispatch(setPoolCreationState({ seedTokens: weights }))
  }

  function updateTokenWeight(id: number, weight: number) {
    dispatch(setTokenWeight({ id, weight }))
  }

  return {
    updateTokenWeights,
    updateTokenWeight,
  }
}
