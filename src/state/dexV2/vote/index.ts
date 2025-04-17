import { createSlice } from '@reduxjs/toolkit'
import { sum } from 'lodash'

import { bnum } from 'lib/utils'

export type PoolToken = {
  tokenAddress: string
  weight: number
  isLocked: boolean
  id: string
  tokensList: string[]
  name: string,
}


export interface VoteState {
  seedTokens: PoolToken[]
  txLoading: boolean
  txLoadingText: string
}

const initialState: VoteState = {
  seedTokens: [] as PoolToken[],
  txLoading: false,
  txLoadingText: '',
}


function handleDistributeWeights(seedTokens: PoolToken[]) {
  // get all the locked weights and sum those bad boys
  let lockedPct = sum(seedTokens.filter((w: PoolToken) => w.isLocked).map((w: PoolToken) => w.weight / 100))

  // makes it so that new allocations are set as 0
  if (lockedPct > 1) lockedPct = 1
  const pctAvailableToDistribute = bnum(1).minus(lockedPct)
  const unlockedWeights = seedTokens.filter((w: PoolToken) => !w.isLocked)
  const evenDistributionWeight = pctAvailableToDistribute.div(unlockedWeights.length)

  const error = pctAvailableToDistribute.minus(evenDistributionWeight.times(unlockedWeights.length))
  const isErrorDivisible = error.mod(unlockedWeights.length).eq(0)
  const distributableError = isErrorDivisible ? error.div(unlockedWeights.length) : error

  const normalisedWeights = unlockedWeights.map((_: PoolToken, i: number) => {
    const evenDistributionWeight4DP = Number(evenDistributionWeight.toFixed(4))
    const errorScaledTo4DP = Number(distributableError.toString()) * 1e14
    if (!isErrorDivisible && i === 0) {
      return evenDistributionWeight4DP + errorScaledTo4DP
    } else if (isErrorDivisible) {
      return evenDistributionWeight4DP + errorScaledTo4DP
    } else {
      return evenDistributionWeight4DP
    }
  })

  unlockedWeights.forEach((tokenWeight: PoolToken, i: number) => {
    tokenWeight.weight = Number((normalisedWeights[i] * 100).toFixed(2))
  })
}

const voteSlice = createSlice({
  name: 'vote',
  initialState,
  reducers: {
    setVoteState(state, action) {
      const newState = { ...state, ...action.payload }

      return newState
    },
    setTokenWeights(state, action) {
      state.seedTokens = action.payload
      handleDistributeWeights(state.seedTokens)
    },
    addTokenWeight(state, action) {
      state.seedTokens = [...state.seedTokens, action.payload]
      handleDistributeWeights(state.seedTokens)
    },
    setTokenWeight(state, action) {
      const seedTokens = state.seedTokens
      const targetToken = seedTokens[action.payload.id]
      targetToken.weight = action.payload.weight
    },
    setTokenAddress(state, action) {
      const seedTokens = state.seedTokens
      const targetToken = seedTokens[action.payload.id]
      targetToken.tokenAddress = action.payload.tokenAddress
    },
    setTokenLocked(state, action) {
      const seedTokens = state.seedTokens
      const targetToken = seedTokens[action.payload.id]
      targetToken.isLocked = action.payload.isLocked
      handleDistributeWeights(seedTokens)
    },
    distributeWeights(state) {
      handleDistributeWeights(state.seedTokens)
    },
    removeTokenWeightsByIndex(state, action) {
      state.seedTokens = state.seedTokens.filter((_: PoolToken, i: number) => i !== action.payload)
      handleDistributeWeights(state.seedTokens)
    },
    resetPoolCreation: () => initialState,
  },
})

export const {
  setVoteState,
  resetPoolCreation,
  setTokenWeight,
  distributeWeights,
  setTokenWeights,
  setTokenAddress,
  addTokenWeight,
  removeTokenWeightsByIndex,
  setTokenLocked,
} = voteSlice.actions

export default voteSlice.reducer
