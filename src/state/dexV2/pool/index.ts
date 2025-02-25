// src/store/poolSlice.ts
import { createSlice } from '@reduxjs/toolkit'
import { AmountIn } from './useJoinPool'

interface PoolState {
  amountsIn: AmountIn[]
}

const initialState: PoolState = {
  amountsIn: [],
}

const poolSlice = createSlice({
  name: 'dexV2Pool',
  initialState,
  reducers: {
    setPoolState(state, action) {
      return { ...state, ...action.payload }
    },
    setValueOfAmountIn(state, action) {
      const { index, value } = action.payload
      state.amountsIn[index].value = value
    },
  },
})

export const { setPoolState, setValueOfAmountIn } = poolSlice.actions

export default poolSlice.reducer
