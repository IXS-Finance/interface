import { useTokenListsState } from './hooks'

const useTokenLists = () => {
  const state = useTokenListsState()

  return {
    ...state,
  }
}

export default useTokenLists
