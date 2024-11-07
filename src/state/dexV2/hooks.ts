import { useSelector } from "react-redux"
import { AppState } from "state"

export const useDexV2State = () => {
  const walletState = useSelector((state: AppState) => state.dexV2)

  return walletState
}
