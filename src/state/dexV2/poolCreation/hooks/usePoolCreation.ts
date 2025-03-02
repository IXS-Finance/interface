import { useDispatch, useSelector } from 'react-redux'
import BigNumber from 'bignumber.js'
import { flatten, sumBy } from 'lodash'
import { TransactionResponse } from '@ethersproject/providers'
import { getAddress } from '@ethersproject/address'

import {
  setTokenLocked,
  setTokenWeight,
  setTokenWeights,
  setTokenAddress,
  addTokenWeight,
  PoolType,
  setPoolCreationState,
  removeTokenWeightsByIndex,
  setValueOfActionState,
  resetPoolCreation,
  FeeManagementType,
  FeeType,
  FeeController,
} from '..'
import { PoolSeedToken } from 'pages/DexV2/types'
import { bnum, includesAddress, isSameAddress, scale } from 'lib/utils'
import { useTokens } from 'state/dexV2/tokens/hooks/useTokens'
import { isAddress } from 'utils'
import { AppState } from 'state'
import usePoolsQuery from 'hooks/dex-v2/queries/usePoolsQuery'
import useWeb3 from 'hooks/dex-v2/useWeb3'
import { balancerService } from 'services/balancer/balancer.service'
import { isTestnet } from 'hooks/dex-v2/useNetwork'
import useEthers from 'hooks/dex-v2/useEthers'
import { POOLS } from 'constants/dexV2/pools'
import useTransactions from 'hooks/dex-v2/useTransactions'
import { wNativeAssetAddress } from 'hooks/dex-v2/usePoolHelpers'

export type OptimisedLiquidity = {
  liquidityRequired: string
  balanceRequired: string
}

type Address = string

export interface JoinPoolRequest {
  assets: Address[]
  maxAmountsIn: string[]
  userData: any
  fromInternalBalance: boolean
}

const JOIN_KIND_INIT = 0

export const usePoolCreation = () => {
  const poolCreationState = useSelector((state: AppState) => state.poolCreation)
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
  const dispatch = useDispatch()

  /**
   * COMPUTED
   */

  const tokensList = [...poolCreationState.tokensList].sort((tokenA, tokenB) => (tokenA > tokenB ? 1 : -1))

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
    const modifiedToken = findSeedTokenByAddress(poolCreationState.manuallySetToken)
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

  const isWrappedNativeAssetPool: boolean = includesAddress(tokensList, wNativeAssetAddress())

  const poolOwner: string = (() => {
    if (poolCreationState.feeManagementType === 'governance') {
      return POOLS.DelegateOwner
    } else {
      return poolCreationState.feeController === 'self' ? account : poolCreationState.thirdPartyFeeController
    }
  })()

  /**
   * FUNCTIONS
   */
  const filterOptions = {
    tokens: tokensList,
    useExactTokens: true,
  }
  const { data: similarPoolsResponse, isLoading: isLoadingSimilarPools } = usePoolsQuery(filterOptions)

  const similarPools = flatten(similarPoolsResponse?.pages?.map((p: any) => p.pools) || [])

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

  function resetPoolCreationState() {
    dispatch(resetPoolCreation())
    setRestoredState(false)
  }

  function updateTokenWeights(weights: PoolSeedToken[]) {
    dispatch(setTokenWeights(weights))
  }

  function sortSeedTokens() {
    dispatch(
      setTokenWeights(
        poolCreationState.seedTokens.sort((a, b) =>
          a.tokenAddress.toLowerCase() > b.tokenAddress.toLowerCase() ? 1 : -1
        )
      )
    )
  }

  function proceed() {
    setActiveStep(poolCreationState.activeStep + 1)
    if (!similarPools.length && poolCreationState.activeStep === 1) {
      setActiveStep(poolCreationState.activeStep + 2)
    } else {
      setActiveStep(poolCreationState.activeStep + 1)
    }
  }

  function goBack() {
    if (!similarPools.length && poolCreationState.activeStep === 3) {
      dispatch(setActiveStep(poolCreationState.activeStep - 2))
      return
    }
    setActiveStep(poolCreationState.activeStep - 1)
    if (poolCreationState.hasRestoredFromSavedState) {
      setRestoredState(false)
    }
  }

  function findSeedTokenByAddress(address: string) {
    return poolCreationState.seedTokens.find((token: PoolSeedToken) => isSameAddress(token.tokenAddress, address))
  }

  function setFeeManagement(type: FeeManagementType) {
    dispatch(setPoolCreationState({ feeManagementType: type }))
  }

  function setFeeType(type: FeeType) {
    dispatch(setPoolCreationState({ feeType: type }))
  }

  function setFeeController(controller: FeeController) {
    dispatch(setPoolCreationState({ feeController: controller }))
  }

  function setTrpController(address: string) {
    dispatch(setPoolCreationState({ thirdPartyFeeController: address }))
  }

  function setStep(step: number) {
    dispatch(setPoolCreationState({ activeStep: step }))
  }

  function updateTokenColors(colors: string[]) {
    dispatch(setPoolCreationState({ tokenColors: colors }))
  }

  function updateManuallySetToken(address: string) {
    dispatch(setPoolCreationState({ manuallySetToken: address }))
  }

  function clearAmounts() {
    const newSeedTokens = [...poolCreationState.seedTokens]
    for (const token of newSeedTokens) {
      token.amount = '0'
    }
    dispatch(setTokenWeights(newSeedTokens))
  }

  function setAmountsToMaxBalances() {
    const newSeedTokens = [...poolCreationState.seedTokens]
    for (const token of newSeedTokens) {
      token.amount = balanceFor(token.tokenAddress)
    }
    dispatch(setTokenWeights(newSeedTokens))
  }

  function setTokensList(newList: string[]) {
    dispatch(setPoolCreationState({ tokensList: newList }))
  }

  function getTokensScaledByBIP(bip: BigNumber): Record<string, OptimisedLiquidity> {
    const optimisedLiquidity = {} as any
    for (const token of poolCreationState.seedTokens) {
      // get the price for a single token
      const tokenPrice = bnum(priceFor(token.tokenAddress))
      // the usd value needed for its weight
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
    const amounts = poolCreationState.seedTokens.map((token: PoolSeedToken) => {
      return token.amount
    })
    return amounts
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

    const tokenSymbols = poolCreationState.seedTokens
      ?.filter((token) => isAddress(token.tokenAddress))
      .map((token: PoolSeedToken) => {
        const weightRounded = Math.round(token.weight)
        const tokenInfo = getToken(token.tokenAddress)
        if (!tokenInfo) {
          valid = false
        }
        return tokenInfo ? `${Math.round(weightRounded)}${tokenInfo.symbol}` : ''
      })

    return valid && tokenSymbols ? tokenSymbols.join('-') : ''
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
    dispatch(setPoolCreationState({ createPoolTxHash: tx.hash }))
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
        console.log('Tx confirmed', tx)
      },
      onTxFailed: () => {
        console.log('Seed failed')
      },
    })
    return tx
  }

  function setActiveStep(step: number) {
    dispatch(setPoolCreationState({ activeStep: step }))
  }

  function saveState() {}

  function resetState() {}

  function importState(state: any) {
    const tempState: any = { ...poolCreationState }
    for (const key of Object.keys(tempState)) {
      if (key === 'activeStep') continue
      if (key === 'seedTokens') {
        const seedTokens = state['seedTokens'].filter((token: any) => !!token.address)
        tempState['seedTokens'] = seedTokens
        continue
      }
      tempState[key] = state[key]
    }
    dispatch(setPoolCreationState(tempState))
  }

  function setRestoredState(value: boolean) {
    dispatch(setPoolCreationState({ hasRestoredFromSavedState: value }))
  }

  async function retrievePoolAddress(hash: string) {
    const provider = await getProvider()
    const response = await balancerService.pools.weighted.retrievePoolIdAndAddress(provider, hash)
    if (response !== null) {
      dispatch(setPoolCreationState({ poolId: response.id, poolAddress: response.address, needsSeeding: true }))
    }
  }

  async function retrievePoolDetails(hash: string) {
    const temState = { ...poolCreationState } as any
    const details = await balancerService.pools.weighted.retrievePoolDetails(getProvider(), hash)
    if (!details) return
    temState.seedTokens = details.tokens
      .map((token: any, i: string) => {
        return {
          tokenAddress: getAddress(token),
          weight: Number(details.weights[i]) * 100,
          isLocked: true,
          amount: '0',
          id: i.toString(),
        }
      })
      .filter((token: any) => {
        return !!token.tokenAddress
      })
    temState.tokensList = details.tokens
    temState.createPoolTxHash = hash
    temState.activeStep = 3
    temState.hasRestoredFromSavedState = true

    dispatch(setPoolCreationState(temState))
    await retrievePoolAddress(hash)
  }

  const isUnlistedToken = (tokenAddress: string) => {
    return tokenAddress !== '' && !balancerTokenListTokens[tokenAddress]
  }

  function addTokenWeightToPool(token: PoolSeedToken) {
    dispatch(addTokenWeight(token))
  }

  function updateTokenWeight(id: number, weight: number) {
    dispatch(setTokenWeight({ id, weight }))
  }

  function updateTokenAddress(id: number, tokenAddress: string) {
    dispatch(setTokenAddress({ id, tokenAddress }))
  }

  function updateLockedWeight(id: number, isLocked: boolean) {
    dispatch(setTokenLocked({ id, isLocked }))
  }

  function removeTokenWeights(id: number) {
    dispatch(removeTokenWeightsByIndex(id))
  }

  const updateActionState = (actionIndex: number, value: any) => {
    dispatch(setValueOfActionState({ actionIndex, value }))
  }

  return {
    ...poolCreationState,
    isLoadingSimilarPools,
    existingPool,
    totalLiquidity,
    currentLiquidity,
    maxInitialLiquidity,
    updateTokenWeights,
    updateTokenWeight,
    updateLockedWeight,
    updateTokenAddress,
    addTokenWeightToPool,
    poolLiquidity,
    isWrappedNativeAssetPool,
    resetPoolCreationState,
    sortSeedTokens,
    proceed,
    goBack,
    setFeeManagement,
    setFeeType,
    setFeeController,
    setTrpController,
    setStep,
    updateTokenColors,
    updateManuallySetToken,
    clearAmounts,
    setAmountsToMaxBalances,
    setTokensList,
    getAmounts,
    getScaledAmounts,
    getPoolSymbol,
    createPool,
    joinPool,
    saveState,
    resetState,
    setActiveStep,
    importState,
    setRestoredState,
    retrievePoolDetails,
    getOptimisedLiquidity,
    scaledLiquidity,
    poolTypeString,
    removeTokenWeights,
    tokensList,
    tokensWithNoPrice,
    similarPools,
    updateActionState,
  }
}
