// usePoolCreation.ts
import { getAddress } from '@ethersproject/address'
import { TransactionResponse } from '@ethersproject/providers'
import BigNumber from 'bignumber.js'
import { flatten, sumBy } from 'lodash'
import { useState } from 'react'
import { PoolType } from '@ixswap1/dex-v2-sdk'

// Hooks & utilities – adjust paths as needed
import useEthers from 'hooks/dex-v2/useEthers'
import useTransactions from 'hooks/dex-v2/useTransactions'
import { POOLS } from 'constants/dexV2/pools'
import { bnum, includesAddress, isSameAddress, lsSet, scale } from 'lib/utils'
import { balancerService } from 'services/balancer/balancer.service'
import { wNativeAssetAddress } from '../usePoolHelpers'
import { isTestnet } from '../useNetwork'
import { useTokens } from 'state/dexV2/tokens/hooks/useTokens'
import useWeb3 from '../useWeb3'
import usePoolsQuery from '../queries/usePoolsQuery'

export const POOL_CREATION_STATE_VERSION = '1.0'
export const POOL_CREATION_STATE_KEY = 'poolCreationState'

export type PoolSeedToken = {
  tokenAddress: string
  weight: number
  isLocked: boolean
  amount: string
  id: string
}

export type OptimisedLiquidity = {
  liquidityRequired: string
  balanceRequired: string
}

type FeeManagementType = 'governance' | 'self'
type FeeType = 'fixed' | 'dynamic'
type FeeController = 'self' | 'other'

export interface PoolCreationState {
  name: string
  seedTokens: PoolSeedToken[]
  activeStep: number
  initialFee: string
  isFeeGovManaged: boolean
  feeManagementType: FeeManagementType
  feeType: FeeType
  feeController: FeeController
  thirdPartyFeeController: string
  fee: string
  tokensList: string[]
  poolId: string
  poolAddress: string
  symbol: string
  manuallySetToken: string
  autoOptimiseBalances: boolean
  useNativeAsset: boolean
  type: PoolType
  needsSeeding: boolean
  createPoolTxHash: string
}

const emptyPoolCreationState: PoolCreationState = {
  name: '',
  seedTokens: [],
  activeStep: 0,
  initialFee: '0.003',
  isFeeGovManaged: false,
  feeManagementType: 'governance',
  feeType: 'fixed',
  feeController: 'self',
  thirdPartyFeeController: '',
  fee: '',
  tokensList: [],
  poolId: '',
  poolAddress: '',
  symbol: '',
  manuallySetToken: '',
  autoOptimiseBalances: false,
  useNativeAsset: false,
  type: PoolType.Weighted,
  needsSeeding: false,
  createPoolTxHash: '',
}

function usePoolCreation() {
  // External hooks
  const {
    balanceFor,
    priceFor,
    getToken,
    nativeAsset,
    wrappedNativeAsset,
    balancerTokenListTokens,
    dynamicDataLoading,
  } = useTokens()
  const { account, getProvider } = useWeb3()
  const { txListener } = useEthers()
  const { addTransaction } = useTransactions()

  // Local state
  const [poolCreationStateString, setPoolCreationStateString] = useState<string>(
    JSON.stringify({
      ...emptyPoolCreationState,
    })
  )

  console.log('poolCreationStateString', poolCreationStateString)
  const poolCreationState: PoolCreationState = JSON.parse(poolCreationStateString)

  function updatePoolCreationState(updater: (prev: PoolCreationState) => PoolCreationState) {
    setPoolCreationStateString((prevString) => {
      const prev = JSON.parse(prevString) as PoolCreationState
      const next = updater(prev)
      return JSON.stringify(next)
    })
  }

  const [tokenColors, setTokenColors] = useState<string[]>([])
  const [hasRestoredFromSavedState, setHasRestoredFromSavedState] = useState<boolean | null>(null)

  // --- Computed values ---

  const tokensList = [...poolCreationState.tokensList].sort((a, b) => (a > b ? 1 : -1))

  // isUnlistedToken – a helper function
  const isUnlistedToken = (tokenAddress: string) => {
    return tokenAddress !== '' && !balancerTokenListTokens[tokenAddress]
  }

  const hasUnlistedToken = tokensList.some((tokenAddress) => tokenAddress && isUnlistedToken(tokenAddress))

  function getOptimisedLiquidity(): Record<string, OptimisedLiquidity> {
    const validTokens = tokensList.filter((t) => t !== '')
    const optimisedLiquidity: Record<string, OptimisedLiquidity> = {}
    if (dynamicDataLoading) return optimisedLiquidity

    // Find the bottleneck token (i.e. the one with the lowest USD value)
    let bottleneckToken = validTokens[0]
    let currentMin = bnum(balanceFor(validTokens[0])).times(priceFor(validTokens[0]))
    for (const token of validTokens) {
      const value = bnum(balanceFor(token)).times(priceFor(token))
      if (value.lt(currentMin)) {
        currentMin = value
        bottleneckToken = token
      }
    }
    let bottleneckWeight =
      poolCreationState.seedTokens.find((t) => isSameAddress(t.tokenAddress, bottleneckToken))?.weight || 0
    let bottleneckPrice = priceFor(bottleneckToken || '0')

    // If using the native asset, use the appropriate token addresses and weights
    if (poolCreationState.useNativeAsset && bottleneckToken === wrappedNativeAsset.address) {
      bottleneckToken = nativeAsset.address
      bottleneckWeight =
        poolCreationState.seedTokens.find((t) => isSameAddress(t.tokenAddress, wrappedNativeAsset.address))?.weight || 0
      bottleneckPrice = priceFor(wrappedNativeAsset.address)
    }
    if (!bottleneckToken) return optimisedLiquidity

    const bip = bnum(bottleneckPrice).times(balanceFor(bottleneckToken)).div(bottleneckWeight)
    return getTokensScaledByBIP(bip)
  }

  const scaledLiquidity: Record<string, OptimisedLiquidity> = (() => {
    const result: Record<string, OptimisedLiquidity> = {}
    const manuallySetToken =
      poolCreationState.manuallySetToken === nativeAsset.address
        ? wrappedNativeAsset.address
        : poolCreationState.manuallySetToken
    const modifiedToken = findSeedTokenByAddress(manuallySetToken)
    if (!modifiedToken) return result
    const bip = bnum(priceFor(modifiedToken.tokenAddress || '0'))
      .times(modifiedToken.amount)
      .div(modifiedToken.weight)
    return getTokensScaledByBIP(bip)
  })()

  const maxInitialLiquidity: number = (() => {
    const liquidityObj = getOptimisedLiquidity()
    return sumBy(Object.values(liquidityObj), (liq: any) => Number(liq.liquidityRequired))
  })()

  const totalLiquidity = (() => {
    let total = bnum(0)
    for (const token of tokensList) {
      total = total.plus(bnum(priceFor(token)).times(balanceFor(token)))
    }
    return total
  })()

  const currentLiquidity = (() => {
    let total = bnum(0)
    for (const token of poolCreationState.seedTokens) {
      total = total.plus(bnum(token.amount).times(priceFor(token.tokenAddress)))
    }
    return total
  })()

  const poolLiquidity = (() => {
    let sum = bnum(0)
    for (const token of poolCreationState.seedTokens) {
      sum = sum.plus(bnum(token.amount).times(priceFor(token.tokenAddress)))
    }
    return sum
  })()

  const poolTypeString: string = (() => {
    switch (poolCreationState.type) {
      case PoolType.Weighted:
        return 'weighted'
      default:
        return ''
    }
  })()

  const tokensWithNoPrice = (() => {
    const validTokens = tokensList.filter((t) => t !== '')
    return validTokens.filter((token) => priceFor(token) === 0)
  })()

  const filterOptions = { tokens: tokensList, useExactTokens: true }

  const { data: similarPoolsResponse, isLoading: isLoadingSimilarPools } = usePoolsQuery(filterOptions)

  const similarPools = (() => {
    return flatten(similarPoolsResponse?.pages.map((p: any) => p.pools) || [])
  })()

  const existingPool = (() => {
    if (!similarPools.length) return null
    const similarPool = similarPools.find((pool: any) => {
      if (pool.swapFee === poolCreationState.initialFee) {
        let weightsMatch = true
        for (const token of pool.tokens) {
          const relevantToken = poolCreationState.seedTokens.find((t) => isSameAddress(t.tokenAddress, token.address))
          const similarPoolWeight = Number(token.weight).toFixed(2)
          const seedTokenWeight = ((relevantToken?.weight || 0) / 100).toFixed(2)
          if (similarPoolWeight !== seedTokenWeight) {
            weightsMatch = false
          }
        }
        return weightsMatch
      }
      return false
    })
    return similarPool
  })()

  const isWrappedNativeAssetPool: boolean = includesAddress(tokensList, wNativeAssetAddress())

  const poolOwner: string = (() => {
    if (poolCreationState.feeManagementType === 'governance') {
      return POOLS.DelegateOwner
    } else {
      return poolCreationState.feeController === 'self' ? account : poolCreationState.thirdPartyFeeController
    }
  })()

  // --- Functions that update state ---

  function resetPoolCreationState() {
    updatePoolCreationState(() => ({ ...emptyPoolCreationState }))
    setRestoredState(false)
    resetState()
  }

  function updateTokenWeights(weights: PoolSeedToken[]) {
    updatePoolCreationState((prev) => ({ ...prev, seedTokens: weights }))
  }

  function sortSeedTokens() {
    updatePoolCreationState((prev) => ({
      ...prev,
      seedTokens: [...prev.seedTokens].sort((a, b) =>
        a.tokenAddress.toLowerCase() > b.tokenAddress.toLowerCase() ? 1 : -1
      ),
    }))
  }

  function proceed() {
    updatePoolCreationState((prev) => {
      const newStep = !similarPools.length && prev.activeStep === 1 ? prev.activeStep + 2 : prev.activeStep + 1
      const newState = { ...prev, activeStep: newStep }
      saveState(newState)
      return newState
    })
  }

  function goBack() {
    updatePoolCreationState((prev) => {
      const newStep = !similarPools.length && prev.activeStep === 3 ? prev.activeStep - 2 : prev.activeStep - 1
      return { ...prev, activeStep: newStep }
    })
    if (hasRestoredFromSavedState) {
      setRestoredState(false)
    }
  }

  function findSeedTokenByAddress(address: string) {
    return poolCreationState.seedTokens.find((token) => isSameAddress(token.tokenAddress, address))
  }

  function setFeeManagement(type: FeeManagementType) {
    updatePoolCreationState((prev) => ({ ...prev, feeManagementType: type }))
  }

  function setFeeType(type: FeeType) {
    updatePoolCreationState((prev) => ({ ...prev, feeType: type }))
  }

  function setStep(step: number) {
    updatePoolCreationState((prev) => ({ ...prev, activeStep: step }))
  }

  function setFeeController(controller: FeeController) {
    updatePoolCreationState((prev) => ({ ...prev, feeController: controller }))
  }

  function setTrpController(address: string) {
    updatePoolCreationState((prev) => ({ ...prev, thirdPartyFeeController: address }))
  }

  function updateTokenColors(colors: string[]) {
    setTokenColors(colors)
  }

  function updateManuallySetToken(address: string) {
    updatePoolCreationState((prev) => ({ ...prev, manuallySetToken: address }))
  }

  function clearAmounts() {
    updatePoolCreationState((prev) => ({
      ...prev,
      seedTokens: prev.seedTokens.map((token) => ({ ...token, amount: '0' })),
    }))
  }

  function setAmountsToMaxBalances() {
    updatePoolCreationState((prev) => ({
      ...prev,
      seedTokens: prev.seedTokens.map((token) => ({
        ...token,
        amount: balanceFor(token.tokenAddress),
      })),
    }))
  }

  function setTokensList(newList: string[]) {
    updatePoolCreationState((prev) => ({ ...prev, tokensList: newList }))
  }

  function getTokensScaledByBIP(bip: BigNumber): Record<string, OptimisedLiquidity> {
    const optimisedLiquidity: Record<string, OptimisedLiquidity> = {}
    for (const token of poolCreationState.seedTokens) {
      const tokenPrice = bnum(priceFor(token.tokenAddress))
      const liquidityRequired: BigNumber = bip.times(token.weight)
      const balanceRequired: BigNumber = liquidityRequired.div(tokenPrice)
      optimisedLiquidity[token.tokenAddress] = {
        liquidityRequired: liquidityRequired.toString(),
        balanceRequired: balanceRequired.toString(),
      }
    }
    return optimisedLiquidity
  }

  function getAmounts() {
    return poolCreationState.seedTokens.map((token) => token.amount)
  }

  function getScaledAmounts() {
    return poolCreationState.seedTokens.map((token) => {
      const tokenInfo = getToken(token.tokenAddress)
      if (!tokenInfo) return '0'
      const amount = new BigNumber(token.amount)
      const scaledAmount = scale(amount, tokenInfo.decimals)
      return scaledAmount.toFixed(0, BigNumber.ROUND_FLOOR)
    })
  }

  function getPoolSymbol() {
    let valid = true
    const tokenSymbols = poolCreationState.seedTokens.map((token) => {
      const weightRounded = Math.round(token.weight)
      const tokenInfo = getToken(token.tokenAddress)
      if (!tokenInfo) {
        valid = false
      }
      return tokenInfo ? `${Math.round(weightRounded)}${tokenInfo.symbol}` : ''
    })
    return valid ? tokenSymbols.join('-') : ''
  }

  async function createPool(): Promise<TransactionResponse> {
    if (hasUnlistedToken && !isTestnet) {
      throw new Error('Invalid pool creation due to unlisted tokens.')
    }
    const provider = await getProvider()
    const tx = await balancerService.pools.weighted.create(
      provider,
      poolCreationState.name,
      poolCreationState.symbol,
      poolCreationState.initialFee,
      poolCreationState.seedTokens,
      poolOwner
    )
    updatePoolCreationState((prev) => ({ ...prev, createPoolTxHash: tx.hash }))
    saveState()

    addTransaction({
      id: tx.hash,
      type: 'tx',
      action: 'createPool',
      summary: poolCreationState.name,
      details: { name: poolCreationState.name },
    })

    txListener(tx, {
      onTxConfirmed: async () => {
        await retrievePoolAddress(tx.hash)
      },
      onTxFailed: () => {
        console.log('Create failed')
      },
    })

    return tx
  }

  async function joinPool() {
    const provider = await getProvider()
    const tokenAddresses: string[] = poolCreationState.seedTokens.map((token) => {
      if (isSameAddress(token.tokenAddress, wrappedNativeAsset.address) && poolCreationState.useNativeAsset) {
        return nativeAsset.address
      }
      return token.tokenAddress
    })
    const tx = await balancerService.pools.weighted.initJoin(
      provider,
      poolCreationState.poolId,
      account,
      account,
      tokenAddresses,
      getScaledAmounts()
    )

    addTransaction({
      id: tx.hash,
      type: 'tx',
      action: 'fundPool',
      summary: poolCreationState.name,
    })

    txListener(tx, {
      onTxConfirmed: async () => {
        resetState()
      },
      onTxFailed: () => {
        console.log('Seed failed')
      },
    })

    return tx
  }

  function setActiveStep(step: number) {
    updatePoolCreationState((prev) => ({ ...prev, activeStep: step }))
  }

  function saveState(stateToSave: PoolCreationState = poolCreationState) {
    // lsSet(POOL_CREATION_STATE_KEY, JSON.stringify(stateToSave), POOL_CREATION_STATE_VERSION)
  }

  function resetState() {
    // lsRemove(POOL_CREATION_STATE_KEY)
  }

  function importState(state: any) {
    updatePoolCreationState((prev) => {
      const newState: any = { ...prev }
      for (const key of Object.keys(newState)) {
        if (key === 'activeStep') continue
        if (key === 'seedTokens') {
          newState.seedTokens = state['seedTokens'].filter((token: any) => !!token.address)
          continue
        }
        newState[key] = state[key]
      }
      return newState
    })
  }

  function setRestoredState(value: boolean) {
    setHasRestoredFromSavedState(value)
  }

  async function retrievePoolAddress(hash: string) {
    const provider = await getProvider()
    const response = await balancerService.pools.weighted.retrievePoolIdAndAddress(provider, hash)
    if (response !== null) {
      updatePoolCreationState((prev) => ({
        ...prev,
        poolId: response.id,
        poolAddress: response.address,
        needsSeeding: true,
      }))
      saveState()
    }
  }

  async function retrievePoolDetails(hash: string) {
    const provider = await getProvider()
    const details = await balancerService.pools.weighted.retrievePoolDetails(provider, hash)
    if (!details) return
    const seedTokens = details.tokens
      .map((token: any, i: number) => ({
        tokenAddress: getAddress(token),
        weight: Number(details.weights[i]) * 100,
        isLocked: true,
        amount: '0',
        id: i.toString(),
      }))
      .filter((token: any) => !!token.tokenAddress)
    updatePoolCreationState((prev) => ({
      ...prev,
      seedTokens,
      tokensList: details.tokens,
      createPoolTxHash: hash,
      activeStep: 3,
    }))
    setHasRestoredFromSavedState(true)
    await retrievePoolAddress(hash)
  }

  // --- Return public API ---
  return {
    ...poolCreationState,
    tokenColors,
    hasRestoredFromSavedState,
    updateTokenWeights,
    proceed,
    setFeeManagement,
    setFeeType,
    setFeeController,
    setTrpController,
    setStep,
    resetPoolCreationState,
    updateTokenColors,
    goBack,
    getPoolSymbol,
    getAmounts,
    getScaledAmounts,
    createPool,
    joinPool,
    setActiveStep,
    updateManuallySetToken,
    sortSeedTokens,
    clearAmounts,
    setAmountsToMaxBalances,
    saveState,
    resetState,
    importState,
    setRestoredState,
    setTokensList,
    retrievePoolAddress,
    retrievePoolDetails,
    getOptimisedLiquidity,
    currentLiquidity,
    scaledLiquidity,
    tokensWithNoPrice,
    similarPools,
    isLoadingSimilarPools,
    existingPool,
    totalLiquidity,
    maxInitialLiquidity,
    poolLiquidity,
    poolTypeString,
    isWrappedNativeAssetPool,
    hasUnlistedToken,
    isUnlistedToken, // helper function
  }
}

export default usePoolCreation
