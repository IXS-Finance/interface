import { useDispatch, useSelector } from 'react-redux'
import { setValueOfActionState } from '.'
import { AppState } from 'state'

export function usePoolState() {
  const dispatch = useDispatch()
  const { actionStates } = useSelector((state: AppState) => state.dexV2Pool)

  const updateActionState = (actionIndex: number, value: any) => {
    dispatch(setValueOfActionState({ actionIndex, value }))
  }

  return {
    actionStates,
    updateActionState,
  }
}
