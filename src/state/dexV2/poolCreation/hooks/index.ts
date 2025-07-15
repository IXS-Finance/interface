import { useSelector } from "react-redux"
import { AppState } from "state"

export const usePoolCreationState = () => {
  const state = useSelector((state: AppState) => state.poolCreation)

  return state
}
