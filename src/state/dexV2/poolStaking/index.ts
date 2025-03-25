import { createSlice } from '@reduxjs/toolkit'

interface PoolStakingState {
  poolGaugeQuery: any
}

const initialState: PoolStakingState = {
  poolGaugeQuery: {},
}

const poolStakingSlice = createSlice({
  name: 'poolstaking',
  initialState,
  reducers: {
    setPoolGaugeQuery(state, action) {
      state.poolGaugeQuery = action.payload
    },
  },
})

export const { setPoolGaugeQuery } = poolStakingSlice.actions

export default poolStakingSlice.reducer
