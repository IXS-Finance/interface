import { useSelector } from 'react-redux'
import { AppState } from 'state'

export const useTokensState = () => {
  const tokens = useSelector((state: AppState) => state.tokens)

  return tokens
}
