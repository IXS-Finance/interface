import { useSelector } from "react-redux"
import { AppState } from "state"

const useTokenLists = () => {
  const state = useSelector((state: AppState) => state.tokenLists)

  return {
    ...state,
  }
}

export default useTokenLists;