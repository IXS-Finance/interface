import { useDispatch, useSelector } from 'react-redux'
import { setSwapState } from '.'
import { AppState } from 'state'

export function useSwapAssets() {
  const dispatch = useDispatch()
  const state = useSelector((state: AppState) => state.swapDexV2)

  const setInputAsset = (asset: string): void => {
    dispatch(setSwapState({ inputAsset: asset }))
  }

  const setOutputAsset = (asset: string): void => {
    dispatch(setSwapState({ outputAsset: asset }))
  }

  return {
    inputAsset: state.inputAsset,
    outputAsset: state.outputAsset,
    setInputAsset,
    setOutputAsset,
  }
}
