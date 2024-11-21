import { createSlice } from '@reduxjs/toolkit'
import { set, sum } from 'lodash'

import { bnum } from 'lib/utils'
import { PoolSeedToken, StepIds } from 'pages/DexV2/types'

export enum PoolType {
  Weighted = 'Weighted',
  Investment = 'Investment',
  Stable = 'Stable',
  ComposableStable = 'ComposableStable',
  MetaStable = 'MetaStable',
  StablePhantom = 'StablePhantom',
  LiquidityBootstrapping = 'LiquidityBootstrapping',
  Element = 'Element',
  Gyro2 = 'Gyro2',
  Gyro3 = 'Gyro3',
  GyroE = 'GyroE',
  Managed = 'Managed',
  AaveLinear = 'AaveLinear',
  Linear = 'Linear',
  EulerLinear = 'EulerLinear',
  ERC4626Linear = 'ERC4626Linear',
  BeefyLinear = 'BeefyLinear',
  GearboxLinear = 'GearboxLinear',
  MidasLinear = 'MidasLinear',
  ReaperLinear = 'ReaperLinear',
  SiloLinear = 'SiloLinear',
  TetuLinear = 'TetuLinear',
  YearnLinear = 'YearnLinear',
  FX = 'FX',
}

export interface DexV2State {
  activeStep: StepIds
  seedTokens: PoolSeedToken[]
  initialFee: string
  name: string
  symbol: string
  tokensList: string[]
  manuallySetToken: string
  autoOptimiseBalances: boolean
  poolType: PoolType
}

const initialState: DexV2State = {
  seedTokens: [],
  name: '',
  symbol: '',
  activeStep: StepIds.ChooseWeights,
  initialFee: '0.003',
  tokensList: [],
  manuallySetToken: '',
  autoOptimiseBalances: false,
  poolType: PoolType.Weighted,
}

function handleDistributeWeights(seedTokens: PoolSeedToken[]) {
  // get all the locked weights and sum those bad boys
  let lockedPct = sum(seedTokens.filter((w) => w.isLocked).map((w) => w.weight / 100))

  // makes it so that new allocations are set as 0
  if (lockedPct > 1) lockedPct = 1
  const pctAvailableToDistribute = bnum(1).minus(lockedPct)
  const unlockedWeights = seedTokens.filter((w) => !w.isLocked)
  const evenDistributionWeight = pctAvailableToDistribute.div(unlockedWeights.length)

  const error = pctAvailableToDistribute.minus(evenDistributionWeight.times(unlockedWeights.length))
  const isErrorDivisible = error.mod(unlockedWeights.length).eq(0)
  const distributableError = isErrorDivisible ? error.div(unlockedWeights.length) : error

  const normalisedWeights = unlockedWeights.map((_, i) => {
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

  console.log('normalisedWeights', normalisedWeights)
  unlockedWeights.forEach((tokenWeight, i) => {
    tokenWeight.weight = Number((normalisedWeights[i] * 100).toFixed(2))
  })
}

const poolCreationSlice = createSlice({
  name: 'poolCreation',
  initialState,
  reducers: {
    setPoolCreationState(state, action) {
      const newState = { ...state, ...action.payload }

      return newState
    },
    setTokenWeights(state, action) {
      state.seedTokens = action.payload
      handleDistributeWeights(state.seedTokens)
    },
    addTokenWeight(state, action) {
      state.seedTokens = [...state.seedTokens, action.payload]
      console.log('state.seedTokens', state.seedTokens)
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
    setTokenAmount(state, action) {
      const seedTokens = state.seedTokens
      const targetToken = seedTokens[action?.payload?.id]
      targetToken.amount = action.payload.amount
    },
    distributeWeights(state) {
      handleDistributeWeights(state.seedTokens)
    },
    setTokensList(state, action) {
      state.tokensList = action.payload
    },
    setActiveStep(state, action) {
      state.activeStep = action.payload
    },
    resetPoolCreationState: () => initialState,
  },
})

export const {
  setPoolCreationState,
  resetPoolCreationState,
  setTokenWeight,
  setTokenLocked,
  distributeWeights,
  setTokenWeights,
  setTokenAddress,
  setTokensList,
  addTokenWeight,
  setActiveStep,
  setTokenAmount,
} = poolCreationSlice.actions
export default poolCreationSlice.reducer
