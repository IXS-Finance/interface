import { useDispatch } from 'react-redux'
import { useMemo } from 'react'
import BigNumber from 'bignumber.js'

import {
  setActiveStep,
  setTokenLocked,
  setTokenWeight,
  setTokenWeights,
  setTokenAddress,
  addTokenWeight,
  PoolType,
} from '..'
import { PoolSeedToken } from 'pages/DexV2/types'
import { usePoolCreationState } from '.'
import { bnum, isSameAddress } from 'lib/utils'
import { useTokens } from 'state/dexV2/tokens/hooks/useTokens'

export type OptimisedLiquidity = {
  liquidityRequired: string
  balanceRequired: string
}

export const usePoolCreation = () => {
  const dispatch = useDispatch()
  const { tokensList, activeStep, seedTokens, manuallySetToken, poolType } = usePoolCreationState()
  const { priceFor, balanceFor, getToken } = useTokens()

  const totalLiquidity = useMemo(() => {
    let total = bnum(0)
    for (const token of tokensList) {
      total = total.plus(bnum(priceFor(token)).times(balanceFor(token)))
    }
    return total
  }, [JSON.stringify(tokensList)])

  const poolTypeString = useMemo((): string => {
    switch (poolType) {
      case PoolType.Weighted:
        return 'weighted'
      default:
        return ''
    }
  }, [])

  function getTokensScaledByBIP(bip: BigNumber): Record<string, OptimisedLiquidity> {
    const optimisedLiquidity = {} as any
    for (const token of seedTokens) {
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

  function getOptimisedLiquidity(): Record<string, OptimisedLiquidity> {
    // need to filter out the empty tokens just in case
    const validTokens = tokensList.filter((t) => t !== '')
    const optimisedLiquidity = {}

    // TODO: implement dynamic data loading
    // if (dynamicDataLoading.value) return optimisedLiquidity;

    // token with the lowest balance is the bottleneck
    let bottleneckToken = validTokens[0]
    // keeping track of the lowest amt
    let currentMin = bnum(balanceFor(validTokens[0])).times(priceFor(validTokens[0]))

    // find the bottleneck token
    for (const token of validTokens) {
      const value = bnum(balanceFor(token)).times(priceFor(token))
      if (value.lt(currentMin)) {
        currentMin = value
        bottleneckToken = token
      }
    }
    let bottleneckWeight = seedTokens.find((t) => isSameAddress(t.tokenAddress, bottleneckToken))?.weight || 0
    let bottleneckPrice = priceFor(bottleneckToken || '0')

    // make sure that once we recognise that we are
    // using the nativeAsset for optimisation of liquidity
    // that we use the appropriate weights and balances
    // since we do not want to change the original seedTokens array
    // as the wrapped native asset there is what will
    // be sent to the contract for creation
    // TODO: implement wrapped native asset
    // if (
    //   poolCreationState.useNativeAsset &&
    //   bottleneckToken === wrappedNativeAsset.value.address
    // ) {
    //   bottleneckToken = nativeAsset.address;
    //   bottleneckWeight =
    //     poolCreationState.seedTokens.find(t =>
    //       isSameAddress(t.tokenAddress, wrappedNativeAsset.value.address)
    //     )?.weight || 0;
    //   bottleneckPrice = priceFor(wrappedNativeAsset.value.address);
    // }
    if (!bottleneckToken) return optimisedLiquidity

    const bip = bnum(bottleneckPrice).times(balanceFor(bottleneckToken)).div(bottleneckWeight)

    return getTokensScaledByBIP(bip)
  }

  function findSeedTokenByAddress(address: string) {
    return seedTokens.find((token: PoolSeedToken) => isSameAddress(token.tokenAddress, address))
  }

  const scaledLiquidity = useMemo((): Record<string, OptimisedLiquidity> => {
    const scaledLiquidity: Record<string, OptimisedLiquidity> = {}

    const modifiedToken = findSeedTokenByAddress(manuallySetToken)

    if (!modifiedToken) return scaledLiquidity

    const bip = bnum(priceFor(modifiedToken.tokenAddress || '0'))
      .times(modifiedToken.amount)
      .div(modifiedToken.weight)

    return getTokensScaledByBIP(bip)
  }, [manuallySetToken])

  function updateTokenWeights(weights: PoolSeedToken[]) {
    dispatch(setTokenWeights(weights))
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

  function proceed() {
    dispatch(setActiveStep(activeStep + 1))
  }

  function goBack() {
    if (activeStep === 3) {
      dispatch(setActiveStep(1))
      return
    }
    dispatch(setActiveStep(activeStep - 1))
  }

  function getPoolSymbol() {
    let valid = true

    const tokenSymbols = seedTokens.map((token: PoolSeedToken) => {
      const weightRounded = Math.round(token.weight)
      const tokenInfo = getToken(token.tokenAddress)
      if (!tokenInfo) {
        valid = false
      }
      return tokenInfo ? `${Math.round(weightRounded)}${tokenInfo.symbol}` : ''
    })

    return valid ? tokenSymbols.join('-') : ''
  }

  function getAmounts() {
    const amounts = seedTokens.map((token: PoolSeedToken) => {
      return token.amount
    })
    return amounts
  }

  return {
    totalLiquidity,
    updateTokenWeights,
    updateTokenWeight,
    updateLockedWeight,
    updateTokenAddress,
    addTokenWeightToPool,
    proceed,
    goBack,
    getPoolSymbol,
    getOptimisedLiquidity,
    scaledLiquidity,
    getAmounts,
    poolTypeString,
    createPool: () => {},
    joinPool: () => {},
  }
}
