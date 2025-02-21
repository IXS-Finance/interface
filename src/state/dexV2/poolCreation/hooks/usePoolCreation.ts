import { useDispatch, useSelector } from 'react-redux'
import { useMemo, useState } from 'react'
import BigNumber from 'bignumber.js'
import { flatten, sumBy } from 'lodash'
import { BigNumber as EPBigNumber } from '@ethersproject/bignumber'
import { TransactionResponse } from '@ethersproject/providers'
import { simulateContract, waitForTransactionReceipt, writeContract } from '@wagmi/core'
import { Vault__factory, WeightedPool__factory, WeightedPoolFactory__factory } from '@balancer-labs/typechain'
import {
  Address,
  Hex,
  TransactionNotFoundError,
  TransactionReceipt,
  TransactionReceiptNotFoundError,
  parseUnits,
} from 'viem'
import { defaultAbiCoder } from '@ethersproject/abi'

import {
  setActiveStep,
  setTokenLocked,
  setTokenWeight,
  setTokenWeights,
  setTokenAddress,
  addTokenWeight,
  PoolType,
  setPoolCreationState,
  removeTokenWeightsByIndex,
  setValueOfActionState,
} from '..'
import { PoolSeedToken } from 'pages/DexV2/types'
import { usePoolCreationState } from '.'
import { bnum, isSameAddress, retryWaitForTransaction, scale, toNormalizedWeights } from 'lib/utils'
import { useTokens } from 'state/dexV2/tokens/hooks/useTokens'
import { wagmiConfig } from 'components/Web3Provider'
import { useWeb3React } from 'hooks/useWeb3React'
import config from 'lib/config'
import WeightedPoolFactoryV4Abi from 'lib/abi/WeightedPoolFactoryV4.json'
import { ZERO_ADDRESS } from 'constants/misc'
import { generateSalt } from 'lib/utils/random'
import { useSubgraphQueryLegacy, useSubgraphQuery } from 'hooks/useSubgraphQuery'
import { SUBGRAPH_QUERY } from 'constants/subgraph'
import { isAddress } from 'utils'
import { AppState } from 'state'
import usePoolsQuery from 'hooks/dex-v2/queries/usePoolsQuery'
import useWeb3 from 'hooks/dex-v2/useWeb3'
import { balancerService } from 'services/balancer/balancer.service'
import { isTestnet } from 'hooks/dex-v2/useNetwork'
import useEthers from 'hooks/dex-v2/useEthers'
import { POOLS } from 'constants/dexV2/pools'

export type OptimisedLiquidity = {
  liquidityRequired: string
  balanceRequired: string
}

export interface JoinPoolRequest {
  assets: Address[]
  maxAmountsIn: string[]
  userData: any
  fromInternalBalance: boolean
}

const JOIN_KIND_INIT = 0

export const usePoolCreation = () => {
  const poolCreationState = useSelector((state: AppState) => state.poolCreation)
  const { account, getProvider } = useWeb3()
  const { txListener } = useEthers()

  const dispatch = useDispatch()
  const { name, symbol, activeStep, seedTokens, manuallySetToken, initialFee, poolId } = poolCreationState
  const { priceFor, balanceFor, getToken, balancerTokenListTokens } = useTokens()
  // const { account, chainId, provider } = useWeb3React()

  const tokensList = [...poolCreationState.tokensList].sort((tokenA, tokenB) => (tokenA > tokenB ? 1 : -1))

  const isUnlistedToken = (tokenAddress: string) => {
    return tokenAddress !== '' && !balancerTokenListTokens[tokenAddress]
  }

  const hasUnlistedToken = tokensList.some((tokenAddress) => tokenAddress && isUnlistedToken(tokenAddress))
  const filterOptions = {
    tokens: tokensList,
    useExactTokens: true,
  }
  const { data: similarPoolsResponse, isLoading: isLoadingSimilarPools } = usePoolsQuery(filterOptions)

  const [hasRestoredFromSavedState, setHasRestoredFromSavedState] = useState<boolean | null>(null)

  const similarPools = flatten(similarPoolsResponse?.pages?.map((p: any) => p.pools) || [])

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

  const totalLiquidity = (() => {
    let total = bnum(0)
    for (const token of tokensList) {
      total = total.plus(bnum(priceFor(token)).times(balanceFor(token)))
    }
    return total
  })()

  const poolOwner: string = (() => {
    if (poolCreationState.feeManagementType === 'governance') {
      return POOLS.DelegateOwner
    } else {
      return poolCreationState.feeController === 'self' ? account : poolCreationState.thirdPartyFeeController
    }
  })()

  const tokensWithNoPrice = (() => {
    const validTokens = tokensList.filter((t) => t !== '')
    return validTokens.filter((token) => priceFor(token) === 0)
  })()

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
    const validTokens = tokensList.filter((t: any) => t !== '')
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

  function resetPoolCreationState() {
    dispatch(resetPoolCreationState())
    setRestoredState(false)
  }

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

  function removeTokenWeights(id: number) {
    dispatch(removeTokenWeightsByIndex(id))
  }

  function proceed() {
    dispatch(setActiveStep(activeStep + 1))
    // if (!similarPools.length && poolCreationState.activeStep === 1) {
    //   dispatch(setActiveStep(activeStep + 2))
    // } else {
    //   dispatch(setActiveStep(activeStep + 1))
    // }
  }

  function goBack() {
    // if (!similarPools.length && poolCreationState.activeStep === 3) {
    //   dispatch(setActiveStep(activeStep - 2))
    //   return
    // }
    dispatch(setActiveStep(activeStep - 1))
    if (hasRestoredFromSavedState) {
      setRestoredState(false)
    }
  }

  function getPoolSymbol() {
    let valid = true

    const tokenSymbols = seedTokens
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

  function getAmounts() {
    const amounts = seedTokens.map((token: PoolSeedToken) => {
      return token.amount
    })
    return amounts
  }

  function calculateTokenWeights(tokens: PoolSeedToken[]): string[] {
    const weights: EPBigNumber[] = tokens.map((token: PoolSeedToken) => {
      const normalizedWeight = new BigNumber(token.weight).multipliedBy(new BigNumber(1e16))
      return EPBigNumber.from(normalizedWeight.toString())
    })
    const normalizedWeights = toNormalizedWeights(weights)
    const weightStrings = normalizedWeights.map((weight: EPBigNumber) => {
      return weight.toString()
    })

    return weightStrings
  }

  function parseValue(amountsIn: string[], tokensIn: string[]): EPBigNumber {
    let value = '0'
    // const nativeAsset = configService.network.nativeAsset;

    // amountsIn.forEach((amount, i) => {
    //   if (tokensIn[i] === nativeAsset.address) {
    //     value = amount;
    //   }
    // });

    return EPBigNumber.from(value)
  }

  function getScaledAmounts() {
    const scaledAmounts: string[] = seedTokens.map((token: PoolSeedToken) => {
      const tokenInfo = getToken(token.tokenAddress)
      if (!tokenInfo) return '0'
      const amount = new BigNumber(token.amount)
      const scaledAmount = scale(amount, tokenInfo.decimals)
      const scaledRoundedAmount = scaledAmount.toFixed(0, BigNumber.ROUND_FLOOR)
      return scaledRoundedAmount
    })
    return scaledAmounts
  }

  // async function joinPool(poolID: string) {
  //   const address = networkConfig.addresses.vault as Address
  //   const tokenAddresses: string[] = seedTokens.map((token: PoolSeedToken) => {
  //     return token.tokenAddress
  //   })

  //   const tokenBalances = getScaledAmounts()

  //   const initUserData = defaultAbiCoder.encode(['uint256', 'uint256[]'], [JOIN_KIND_INIT, tokenBalances])

  //   const joinPoolRequest: JoinPoolRequest = {
  //     // @ts-ignore
  //     assets: tokenAddresses,
  //     maxAmountsIn: tokenBalances,
  //     userData: initUserData,
  //     fromInternalBalance: false,
  //   }

  //   const sender = account
  //   const receiver = account

  //   console.log('poolID', poolID)

  //   const params = [poolID.toLowerCase(), sender, receiver, joinPoolRequest] as any

  //   // @ts-ignore
  //   const { request } = await simulateContract(wagmiConfig, {
  //     account,
  //     address,
  //     abi: Vault__factory.abi,
  //     args: params,
  //     functionName: 'joinPool',
  //     // @ts-ignore
  //     value: parseValue(tokenBalances, tokenAddresses),
  //   })

  //   // @ts-ignore
  //   const txHash = await writeContract(wagmiConfig, request)

  //   // @ts-ignore
  //   await waitForTransactionReceipt(wagmiConfig, { hash: txHash })

  //   return txHash
  // }

  function setRestoredState(value: boolean) {
    setHasRestoredFromSavedState(value)
  }

  async function retrievePoolAddress(hash: string) {
    const provider = await getProvider()
    const response = await balancerService.pools.weighted.retrievePoolIdAndAddress(provider, hash)
    if (response !== null) {
      // updatePoolCreationState((prev) => ({
      //   ...prev,
      //   poolId: response.id,
      //   poolAddress: response.address,
      //   needsSeeding: true,
      // }))
      // saveState()
    }
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
    debugger
    // updatePoolCreationState((prev) => ({ ...prev, createPoolTxHash: tx.hash }))
    // saveState()

    // addTransaction({
    //   id: tx.hash,
    //   type: 'tx',
    //   action: 'createPool',
    //   summary: poolCreationState.name,
    //   details: { name: poolCreationState.name },
    // })

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
    // const provider = await getProvider()
    // const tokenAddresses: string[] = poolCreationState.seedTokens.map((token) => {
    //   if (isSameAddress(token.tokenAddress, wrappedNativeAsset.address) && poolCreationState.useNativeAsset) {
    //     return nativeAsset.address
    //   }
    //   return token.tokenAddress
    // })
    // const tx = await balancerService.pools.weighted.initJoin(
    //   provider,
    //   poolCreationState.poolId,
    //   account,
    //   account,
    //   tokenAddresses,
    //   getScaledAmounts()
    // )
    // addTransaction({
    //   id: tx.hash,
    //   type: 'tx',
    //   action: 'fundPool',
    //   summary: poolCreationState.name,
    // })
    // txListener(tx, {
    //   onTxConfirmed: async () => {
    //     resetState()
    //   },
    //   onTxFailed: () => {
    //     console.log('Seed failed')
    //   },
    // })
    // return tx
  }

  const updateActionState = (actionIndex: number, value: any) => {
    dispatch(setValueOfActionState({ actionIndex, value }))
  }

  return {
    ...poolCreationState,
    hasRestoredFromSavedState,
    totalLiquidity,
    updateTokenWeights,
    updateTokenWeight,
    updateLockedWeight,
    updateTokenAddress,
    addTokenWeightToPool,
    poolLiquidity,
    proceed,
    goBack,
    getPoolSymbol,
    getOptimisedLiquidity,
    scaledLiquidity,
    getAmounts,
    poolTypeString,
    createPool,
    joinPool,
    removeTokenWeights,
    tokensList,
    setRestoredState,
    resetPoolCreationState,
    tokensWithNoPrice,
    similarPools,
    updateActionState,
  }
}
