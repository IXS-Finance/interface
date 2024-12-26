import { createSlice } from '@reduxjs/toolkit'

export interface SwapState {
  inputAsset: any
  outputAsset: any
  validationErrors: {
    highPriceImpact: boolean
    noSwaps: boolean
  }
  submissionError: string | null
  selectedTokens: string[]
  initialized: boolean
  tokenInAddress: string
  tokenOutAddress: string
  tokenInAmount: string
  tokenOutAmount: string
}

const initialState: SwapState = {
  inputAsset: null,
  outputAsset: null,
  validationErrors: {
    highPriceImpact: false,
    noSwaps: false,
  },
  submissionError: null,
  selectedTokens: [],
  initialized: false,
  tokenInAddress: '',
  tokenOutAddress: '',
  tokenInAmount: '',
  tokenOutAmount: '',
}

const swapSlice = createSlice({
  name: 'swapDexV2',
  initialState,
  reducers: {
    setSwapState(state, action) {
      const newState = { ...state, ...action.payload }

      return newState
    },
    setSelectedTokensState(state, action) {
      state.selectedTokens = action.payload
    },
    addSelectedTokenState(state, action) {
      state.selectedTokens.push(action.payload)
    },
    removeSelectedTokenState(state, action) {
      const tokenIndex = state.selectedTokens.indexOf(action.payload)
      state.selectedTokens.splice(tokenIndex, 1)
    },
    resetSwapState: () => initialState,
  },
})

export const { setSwapState, resetSwapState, setSelectedTokensState, addSelectedTokenState, removeSelectedTokenState } =
  swapSlice.actions
export default swapSlice.reducer
