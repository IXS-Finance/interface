import { useDispatch, useSelector } from 'react-redux'
import { setSwapState, setValueOfActionState } from '.'
import { AppState } from 'state'

export function useSwapState() {
  const dispatch = useDispatch()
  const { initialized, tokenInAddress, tokenOutAddress, tokenInAmount, tokenOutAmount, actionStates } = useSelector(
    (state: AppState) => state.swapDexV2
  )

  function setInitialized(val: boolean) {
    dispatch(setSwapState({ initialized: val }))
  }

  function setTokenInAddress(address: string) {
    dispatch(setSwapState({ tokenInAddress: address }))
  }
  function setTokenOutAddress(address: string) {
    dispatch(setSwapState({ tokenOutAddress: address }))
  }

  function setTokenInAmount(amount: string) {
    dispatch(setSwapState({ tokenInAmount: amount }))
  }
  function setTokenOutAmount(amount: string) {
    dispatch(setSwapState({ tokenOutAmount: amount }))
  }

  const updateActionState = (actionIndex: number, value: any) => {
    dispatch(setValueOfActionState({ actionIndex, value }))
  }

  return {
    actionStates,
    initialized,
    tokenInAddress,
    tokenOutAddress,
    tokenInAmount,
    tokenOutAmount,
    setInitialized,
    setTokenInAddress,
    setTokenOutAddress,
    setTokenInAmount,
    setTokenOutAmount,
    updateActionState,
  }
}
