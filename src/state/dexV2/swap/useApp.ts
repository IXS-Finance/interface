import { useDispatch } from 'react-redux'

import { setSwapState } from '.'

export function useApp() {
  const dispatch = useDispatch()

  function setTransactionDeadline(newTransactionDeadline: number) {
    dispatch(setSwapState({ transactionDeadline: newTransactionDeadline }))
  }

  return {
    setTransactionDeadline,
  }
}
