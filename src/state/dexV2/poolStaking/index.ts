import { createSlice } from '@reduxjs/toolkit'
import { Pool } from 'services/pool/types'

interface PoolStakingState {
  currentPool: Pool | undefined
  stakedBalance: string
  isFetchingStakedBalance: boolean
}

const initialState: PoolStakingState = {
  currentPool: undefined,
  stakedBalance: '0',
  isFetchingStakedBalance: false,
}

const poolStakingSlice = createSlice({
  name: 'poolstaking',
  initialState,
  reducers: {
    setPoolStakingState(state, action) {
      const newState = { ...state, ...action.payload }

      return newState
    },
  },
})

export const { setPoolStakingState } = poolStakingSlice.actions

export default poolStakingSlice.reducer
