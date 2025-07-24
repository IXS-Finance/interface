import { createSlice } from '@reduxjs/toolkit'
import { FiatCurrency } from 'constants/dexV2/currency'

export type YesNo = 'yes' | 'no'

const DEFAULT_SLIPPAGE = '0.005' // 0.5%
const DEFAULT_ENABLE_SIGNATURES: YesNo = 'yes'
export enum EthereumTxType {
  LEGACY = 'Legacy',
  EIP1559 = 'EIP1559',
}
const defaultSwapDeadlineMinutes = 100

export interface UserSettingsState {
  currency: FiatCurrency
  slippage: string
  enableSignatures: YesNo
  supportSignatures: boolean
  ethereumTxType: any
  transactionDeadline: number
}

const initialState: UserSettingsState = {
  currency: FiatCurrency.usd,
  slippage: DEFAULT_SLIPPAGE,
  enableSignatures: DEFAULT_ENABLE_SIGNATURES,
  supportSignatures: true,
  ethereumTxType: EthereumTxType.EIP1559,
  transactionDeadline: defaultSwapDeadlineMinutes,
}

const userSettingsSlice = createSlice({
  name: 'userSettings',
  initialState,
  reducers: {
    setUserSettingsState(state, action) {
      const newState = { ...state, ...action.payload }

      return newState
    },
  },
})

export const { setUserSettingsState } = userSettingsSlice.actions
export default userSettingsSlice.reducer
