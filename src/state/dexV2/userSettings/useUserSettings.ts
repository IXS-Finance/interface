import { bn } from 'lib/balancer/utils/numbers'
import { useDispatch, useSelector } from 'react-redux'
import { AppState } from 'state'
import { EthereumTxType, setUserSettingsState } from '.'

const useUserSettings = () => {
  const state = useSelector((state: AppState) => state.userSettings)
  const dispatch = useDispatch()

  const slippageDecimal = bn(state.slippage).div(100).toString()
  const slippageBps = bn(state.slippage).times(100).toString()
  const slippageBsp: number = parseFloat(state.slippage) * 10000

  const setSlippage = (newSlippage: string) => {
    dispatch(setUserSettingsState({ slippage: newSlippage }))
  }

  function setSupportSignatures(newValue: boolean): void {
    dispatch(setUserSettingsState({ supportSignatures: newValue }))
  }

  function setEthereumTxType(txType: any): void {
    dispatch(setUserSettingsState({ ethereumTxType: txType }))
  }

  function setTransactionDeadline(newTransactionDeadline: any) {
    dispatch(setUserSettingsState({ transactionDeadline: newTransactionDeadline }))
  }

  return {
    ...state,
    slippageDecimal,
    slippageBps,
    slippageBsp,
    setSlippage,
    setSupportSignatures,
    setEthereumTxType,
    setTransactionDeadline,
  }
}

export default useUserSettings
