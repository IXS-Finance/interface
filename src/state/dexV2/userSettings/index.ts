import { createSlice } from '@reduxjs/toolkit'

export type YesNo = 'yes' | 'no'

const DEFAULT_SLIPPAGE = '0.5' // 0.5%
const DEFAULT_ENABLE_SIGNATURES: YesNo = 'yes'

export interface UserSettingsState {
  slippage: string
  enableSignatures: YesNo
}

const initialState: UserSettingsState = {
  slippage: DEFAULT_SLIPPAGE,
  enableSignatures: DEFAULT_ENABLE_SIGNATURES,
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
