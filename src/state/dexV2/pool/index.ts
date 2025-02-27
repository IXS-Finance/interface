// src/store/poolSlice.ts
import { createSlice } from '@reduxjs/toolkit'
import { AmountIn } from './useJoinPool'
import { AmountOut } from './useExitPool'

export enum Tab {
  PoolTokens,
  SingleToken,
}

export const tabs = [
  { value: Tab.PoolTokens, label: 'Proportional pool tokens' },
  { value: Tab.SingleToken, label: 'Single token' },
]
interface PoolState {
  amountsIn: AmountIn[]
  activeTab: Tab
  isSingleAssetExit: boolean
  priceImpact: number
  priceImpactValid: boolean
  propAmountsOut: AmountOut[]
  isTxPayloadReady: boolean
  bptIn: string
}

const initialState: PoolState = {
  amountsIn: [],
  activeTab: tabs[0].value,
  isSingleAssetExit: false,
  priceImpact: 0,
  priceImpactValid: true,
  propAmountsOut: [],
  isTxPayloadReady: false,
  bptIn: '0',
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
