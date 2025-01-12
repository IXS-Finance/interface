import { bn } from 'lib/balancer/utils/numbers'
import { useDispatch, useSelector } from 'react-redux'
import { AppState } from 'state'
import { setUserSettingsState } from '.'

const useUserSettings = () => {
  const { slippage } = useSelector((state: AppState) => state.userSettings)
  const dispatch = useDispatch()

  const slippageDecimal = bn(slippage).div(100).toString()
  const slippageBps = bn(slippage).times(100).toString()

  const setSlippage = (newSlippage: string) => {
    dispatch(setUserSettingsState({ slippage: newSlippage }))
  }

  return { slippage, slippageDecimal, slippageBps, setSlippage }
}

export default useUserSettings
