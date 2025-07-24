import { useDispatch, useSelector } from 'react-redux'
import { setSelectedTokensState, addSelectedTokenState, removeSelectedTokenState } from '.'
import { AppState } from 'state'

export default function usePoolFilters() {
  const selectedTokens = useSelector((state: AppState) => state.swapDexV2.selectedTokens)
  const dispatch = useDispatch()

  function setSelectedTokens(addresses: string[]): void {
    dispatch(setSelectedTokensState(addresses))
  }

  function addSelectedToken(address: string): void {
    dispatch(addSelectedTokenState(address))
  }

  function removeSelectedToken(address: string): void {
    dispatch(removeSelectedTokenState(address))
  }

  return {
    // state
    selectedTokens,
    // methods
    setSelectedTokens,
    addSelectedToken,
    removeSelectedToken,
  }
}
