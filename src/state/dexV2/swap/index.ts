import { createSlice } from '@reduxjs/toolkit'

export interface SwapState {
  inputAsset: any
  outputAsset: any
  validationErrors: {
    highPriceImpact: boolean
    noSwaps: boolean
  }
  submissionError: string | null
}

const initialState: SwapState = {
  inputAsset: null,
  outputAsset: null,
  validationErrors: {
    highPriceImpact: false,
    noSwaps: false,
  },
  submissionError: null,
}

const swapSlice = createSlice({
  name: 'swap',
  initialState,
  reducers: {
    setSwapState(state, action) {
      const newState = { ...state, ...action.payload }

      return newState
    },
    resetSwapState: () => initialState,
  },
})

export const {} = swapSlice.actions
export default swapSlice.reducer
