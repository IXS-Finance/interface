import { useDispatch, useSelector } from 'react-redux'
import { addTokenWeight, PoolToken, setTokenWeight, setTokenLocked, removeTokenWeightsByIndex } from '.'

const useVote = () => {
  const state = useSelector((state: any) => state.dexV2Vote)
  const dispatch = useDispatch()

  function addPoolToken(poolToken: PoolToken) {
    dispatch(addTokenWeight(poolToken))
  }

  function updateTokenWeight(id: number, weight: number) {
    dispatch(setTokenWeight({ id, weight }))
  }

  function updateLockedWeight(id: number, isLocked: boolean) {
    dispatch(setTokenLocked({ id, isLocked }))
  }

  function removeTokenWeights(id: number) {
    dispatch(removeTokenWeightsByIndex(id))
  }

  return {
    ...state,
    addPoolToken,
    updateTokenWeight,
    updateLockedWeight,
    removeTokenWeights,
  }
}

export default useVote
