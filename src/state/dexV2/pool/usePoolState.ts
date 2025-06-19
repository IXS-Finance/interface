import { useDispatch, useSelector } from 'react-redux'
import { setTokensSelectedFilters, setValueOfActionState } from '.'
import { AppState } from 'state'

export function usePoolState() {
  const dispatch = useDispatch()
  const { actionStates, tokensSelectedFilters } = useSelector((state: AppState) => state.dexV2Pool)

  const updateActionState = (actionIndex: number, value: any) => {
    dispatch(setValueOfActionState({ actionIndex, value }))
  }

  const updateTokensSelectedFilters = (tokensSelectedFilters: any[]) => {
    dispatch(setTokensSelectedFilters(tokensSelectedFilters))
  }

  return {
    actionStates,
    updateActionState,
    tokensSelectedFilters,
    updateTokensSelectedFilters,
  }
}
