import { useSelector } from "react-redux"
import { AppState } from "state"

export const useTokenListsState = () => {
  const state = useSelector((state: AppState) => state.tokenLists)

  return {
    ...state,
  }
}
