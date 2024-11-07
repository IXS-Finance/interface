import { createSlice } from '@reduxjs/toolkit'

export interface DexV2State {}

const initialState: DexV2State = {}

const dexV2Slice = createSlice({
  name: 'dexV2',
  initialState,
  reducers: {
    setDexV2State(state, action) {
      const newState = { ...state, ...action.payload }

      return newState
    },
    restDexV2State: () => initialState,
  },
})

export const { setDexV2State, restDexV2State } = dexV2Slice.actions
export default dexV2Slice.reducer
