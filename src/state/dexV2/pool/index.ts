// src/store/poolSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AmountIn } from './useJoinPool'
import { AmountOut } from './useExitPool'
import { TransactionActionInfo, TransactionActionState } from 'types/transactions'

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
  priceImpactValid: boolean
  propAmountsOut: AmountOut[]
  isTxPayloadReady: boolean
  bptIn: string
  singleAmountOut: AmountOut
  bptOut: string
  priceImpact: number
  approvalActions: TransactionActionInfo[]
  actionStates: TransactionActionState[]
}

const initialState: PoolState = {
  amountsIn: [],
  activeTab: tabs[0].value,
  isSingleAssetExit: false,
  priceImpactValid: true,
  propAmountsOut: [],
  isTxPayloadReady: false,
  bptIn: '0',
  singleAmountOut: {
    address: '',
    value: '',
    max: '',
    valid: true,
  },
  bptOut: '0',
  priceImpact: 0,
  approvalActions: [],
  actionStates: [],
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
    setDataForSingleAmountOut(state, action: PayloadAction<{ key: keyof AmountOut; value: string | boolean }>) {
      const { key, value } = action.payload
      if (typeof value === 'string' || typeof value === 'boolean') {
        state.singleAmountOut[key] = value as never
      }
    },
    setActionStates(state, action) {
      state.actionStates = action.payload
    },
    setValueOfActionState(state, action) {
      const { actionIndex, value } = action.payload
      const currentState = state.actionStates[actionIndex] as any
      state.actionStates[actionIndex] = {
        ...currentState,
        ...value,
      }
    },
  },
})

export const { setPoolState, setValueOfAmountIn, setDataForSingleAmountOut, setValueOfActionState, setActionStates } =
  poolSlice.actions

export default poolSlice.reducer
