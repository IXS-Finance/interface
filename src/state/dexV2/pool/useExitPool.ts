import { useState, useEffect, useRef, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import debounce from 'debounce-promise'
import { bnSum, bnum, includesAddress, isSameAddress, removeAddress, selectByAddress } from 'lib/utils'
import { ExitHandler, ExitPoolService } from 'services/balancer/pools/exits/exit-pool.service'
import { ExitType } from 'services/balancer/pools/exits/handlers/exit-pool.handler'
import { Pool, PoolToken } from 'services/pool/types'
import { TokenInfoMap } from 'types/TokenList'
import { TransactionActionInfo } from 'types/transactions'
import { TransactionResponse } from '@ethersproject/abstract-provider'
import { HIGH_PRICE_IMPACT, REKT_PRICE_IMPACT } from 'constants/dexV2/poolLiquidity'
import QUERY_KEYS from 'constants/dexV2/queryKeys'
import { captureBalancerException } from 'lib/utils/errors'
import { useTokens } from '../tokens/hooks/useTokens'
import useUserSettings from '../userSettings/useUserSettings'
import useWeb3 from 'hooks/dex-v2/useWeb3'
import { useTxState } from 'hooks/dex-v2/useTxState'
import {
  fiatValueOf,
  flatTokenTree,
  isDeep,
  isPreMintedBptType,
  isRecoveryExitsOnly,
  tokenTreeLeafs,
  tokenTreeNodes,
  isComposableStableV1,
} from 'hooks/dex-v2/usePoolHelpers'
import { POOLS } from 'constants/dexV2/pools'
import useNumbers from 'hooks/dex-v2/useNumbers' // assumed similar to your Vue version

// TYPES
export type AmountOut = {
  address: string
  value: string
  valid: boolean
  max: string
}

export const useExitPool = (pool: Pool, debounceQueryExitMillis = 1000, debounceGetSingleAssetMaxMillis = 1000) => {
  // === STATE (using React useState) ===
  const [isMounted, setIsMounted] = useState(false)
  const [isSingleAssetExit, setIsSingleAssetExit] = useState(false)
  const [priceImpact, setPriceImpact] = useState(0)
  const [priceImpactValid, setPriceImpactValid] = useState(true)
  const [highPriceImpactAccepted, setHighPriceImpactAccepted] = useState(false)
  const [bptIn, setBptIn] = useState('0')
  const [bptInValid, setBptInValid] = useState(true)
  const [txError, setTxError] = useState('')
  const [singleAmountOut, setSingleAmountOut] = useState<AmountOut>({
    address: '',
    value: '',
    max: '',
    valid: true,
  })
  const [propAmountsOut, setPropAmountsOut] = useState<AmountOut[]>([])
  const [isTxPayloadReady, setIsTxPayloadReady] = useState(false)

  // === SERVICES & COMPOSABLES ===
  const exitPoolService = new ExitPoolService(pool)
  const { toFiat } = useNumbers()
  const { injectTokens, getTokens, balanceFor } = useTokens()
  const { txState, txInProgress, resetTxState } = useTxState()
  const { slippageBsp, transactionDeadline } = useUserSettings()
  const { account, getSigner } = useWeb3()

  // === DEBOUNCED FUNCTIONS (stored in refs for stability) ===
  // We will define the functions below and assign them to these refs.
  const debounceQueryExitRef = useRef<any>()
  const debounceGetSingleAssetMaxRef = useRef<any>()

  // === Derived flag for enabling queries (recalculated on every render) ===
  const queriesEnabled = isMounted && !txInProgress

  // === User’s BPT balance ===
  const bptBalance = balanceFor(pool.address)

  // === React Query: query for exit simulation ===
  const queryExitQuery = useQuery({
    queryKey: QUERY_KEYS.Pools.Exits.QueryExit(account, bptIn, isSingleAssetExit, singleAmountOut, ''),
    queryFn: () => debounceQueryExitRef.current(),
    enabled: queriesEnabled,
    refetchOnWindowFocus: false,
  })

  // === React Query: query for single asset max ===
  const singleAssetMaxQuery = useQuery({
    queryKey: QUERY_KEYS.Pools.Exits.SingleAssetMax(bptBalance, isSingleAssetExit, singleAmountOut.address),
    queryFn: () => debounceGetSingleAssetMaxRef.current(),
    enabled: queriesEnabled,
    refetchOnWindowFocus: false,
  })

  // === Derived values (computed inline each render) ===

  const isLoadingQuery = queryExitQuery.isFetching
  const queryError = queryExitQuery.error ? queryExitQuery.error.message : undefined
  const isLoadingMax = singleAssetMaxQuery.isFetching || !queriesEnabled
  const maxError = singleAssetMaxQuery.error ? singleAssetMaxQuery.error.message : undefined
  const isDeepPool = isDeep(pool)
  const canSwapExit = isDeep(pool) && isPreMintedBptType(pool.poolType)
  const shouldUseSwapExit =
    isSingleAssetExit && !includesAddress(pool.tokensList, singleAmountOut.address) && canSwapExit
  const shouldUseGeneralisedExit = !isSingleAssetExit && (isDeep(pool) || isComposableStableV1(pool))
  const shouldExitViaInternalBalance = !!(
    POOLS.ExitViaInternalBalance && POOLS.ExitViaInternalBalance.includes(pool.id)
  )
  const shouldUseRecoveryExit = isRecoveryExitsOnly(pool)

  const singleAssetMaxed = bnum(singleAmountOut.value).eq(singleAmountOut.max)
  const exitHandlerType = (() => {
    if (shouldUseRecoveryExit) return ExitHandler.Recovery
    if (shouldUseSwapExit) return ExitHandler.Swap
    if (shouldUseGeneralisedExit) return ExitHandler.Generalised
    if (isSingleAssetExit) {
      if (singleAssetMaxed) return ExitHandler.ExactIn
      return ExitHandler.ExactOut
    }
    return ExitHandler.ExactIn
  })()

  const approvalActions: any = []
  const exitTokenAddresses = (() => {
    let addresses: string[] = isDeep(pool) ? tokenTreeNodes(pool.tokens) : pool.tokensList
    return removeAddress(pool.address, addresses)
  })()
  const exitTokenInfo: TokenInfoMap = getTokens([
    ...exitTokenAddresses,
    pool.address,
    ...propAmountsOut.map((ao) => ao.address),
  ])
  const exitTokens = (() => {
    let tokens: PoolToken[] = isDeep(pool) ? flatTokenTree(pool) : pool.tokens
    return tokens.filter((token) => !isSameAddress(token.address, pool.address))
  })()
  const amountsOut = isSingleAssetExit ? [singleAmountOut] : propAmountsOut
  const hasBpt = bnum(bptBalance).gt(0)
  const hasAmountsOut = amountsOut.some((amountOut) => bnum(amountOut.value).gt(0))
  const validAmounts = isSingleAssetExit
    ? amountsOut.every((ao) => ao.valid && bnum(ao.value).gt(0))
    : bptInValid && bnum(bptIn).gt(0)
  const fiatAmountsOut = Object.fromEntries(amountsOut.map(({ address, value }) => [address, toFiat(value, address)]))
  const fiatTotalOut = bnSum(Object.values(fiatAmountsOut)).toString()
  const fiatValueIn = fiatValueOf(pool, bptIn)
  const exitType = (() => {
    if (isSingleAssetExit && !singleAssetMaxed) return ExitType.GivenOut
    return ExitType.GivenIn
  })()
  const _bptIn = (() => {
    if (isSingleAssetExit && singleAssetMaxed) return bptBalance
    return bptIn
  })()

  const hasBptIn = bnum(bptIn).gt(0)
  const validExitInputs = isSingleAssetExit
    ? amountsOut.every((ao) => ao.valid && bnum(ao.value).gt(0))
    : bptInValid && bnum(bptIn).gt(0)
  const fiatAmountsOutMap = fiatAmountsOut // already computed above
  const hasAcceptedHighPriceImpact = highPriceImpact() ? highPriceImpactAccepted : true
  // Define high and rekt price impact flags:
  function highPriceImpact() {
    return bnum(priceImpact).isGreaterThanOrEqualTo(HIGH_PRICE_IMPACT)
  }
  function rektPriceImpact() {
    return bnum(priceImpact).isGreaterThanOrEqualTo(REKT_PRICE_IMPACT)
  }

  // === METHODS ===

  async function queryExit() {
    setPriceImpactValid(false)
    if (isSingleAssetExit && !validExitInputs) return null
    if (!isSingleAssetExit && !bnum(bptIn).gt(0)) return null

    exitPoolService.setExitHandler(exitHandlerType)
    console.log('exitHandler:', exitHandlerType)
    try {
      const output = await exitPoolService.queryExit({
        exitType: exitType,
        bptIn: _bptIn,
        amountsOut: amountsOut,
        signer: await getSigner(),
        slippageBsp: slippageBsp,
        tokenInfo: exitTokenInfo,
        approvalActions: approvalActions,
        bptInValid: bptInValid,
        relayerSignature: '',
        transactionDeadline: transactionDeadline,
        toInternalBalance: shouldExitViaInternalBalance,
      })
      setPriceImpact(output.priceImpact)
      const newPropAmountsOut = Object.keys(output.amountsOut).map((address) => ({
        address,
        value: output.amountsOut[address],
        max: '',
        valid: true,
      }))
      setPropAmountsOut(newPropAmountsOut)
      setIsTxPayloadReady(output.txReady)
      setPriceImpactValid(true)
      return output
    } catch (error: any) {
      await logExitException(error, queryExitQuery)
      throw new Error('Failed to construct exit.', { cause: error })
    }
  }
  // Assign debounced queryExit to a ref (once on first render)
  if (!debounceQueryExitRef.current) {
    debounceQueryExitRef.current = debounce(queryExit, debounceQueryExitMillis)
  }

  async function getSingleAssetMax() {
    setSingleAmountOut((prev) => ({ ...prev, max: '0' }))
    if (!isSingleAssetExit) return null
    if (!hasBpt) return null
    const singleAssetMaxedExitHandler = shouldUseSwapExit ? ExitHandler.Swap : ExitHandler.ExactIn
    exitPoolService.setExitHandler(singleAssetMaxedExitHandler)
    try {
      const output = await exitPoolService.queryExit({
        exitType: ExitType.GivenIn,
        bptIn: bptBalance,
        amountsOut: [singleAmountOut],
        signer: await getSigner(),
        slippageBsp: slippageBsp,
        tokenInfo: exitTokenInfo,
        approvalActions: approvalActions,
        bptInValid: bptInValid,
        relayerSignature: '',
        transactionDeadline: transactionDeadline,
        toInternalBalance: shouldExitViaInternalBalance,
      })
      const newMax = selectByAddress(output.amountsOut, singleAmountOut.address) || '0'
      setSingleAmountOut((prev) => ({ ...prev, max: newMax }))
      return newMax
    } catch (error: any) {
      await logExitException(error, singleAssetMaxQuery)
      throw new Error('Failed to calculate max.', { cause: error })
    }
  }
  // Assign debounced getSingleAssetMax to a ref (once)
  if (!debounceGetSingleAssetMaxRef.current) {
    debounceGetSingleAssetMaxRef.current = debounce(getSingleAssetMax, debounceGetSingleAssetMaxMillis, {
      leading: true,
    })
  }

  async function exit(): Promise<TransactionResponse> {
    try {
      setTxError('')
      exitPoolService.setExitHandler(exitHandlerType)
      console.log('exitHandler:', exitHandlerType)
      return await exitPoolService.exit({
        exitType: exitType,
        bptIn: _bptIn,
        amountsOut: amountsOut,
        signer: await getSigner(),
        slippageBsp: slippageBsp,
        tokenInfo: exitTokenInfo,
        approvalActions: approvalActions,
        bptInValid: bptInValid,
        relayerSignature: '',
        transactionDeadline: transactionDeadline,
        toInternalBalance: shouldExitViaInternalBalance,
      })
    } catch (error: any) {
      await logExitException(error)
      setTxError(error.message)
      throw error
    }
  }

  function setInitialPropAmountsOut() {
    const leafNodes: string[] = isDeep(pool)
      ? tokenTreeLeafs(pool.tokens)
      : pool.tokensList.filter((token) => !isSameAddress(token, pool.address))
    setPropAmountsOut(
      leafNodes.map((address) => ({
        address,
        value: '0',
        max: '',
        valid: true,
      }))
    )
  }

  function handleSetIsSingleAssetExit(value: boolean) {
    setIsSingleAssetExit(value)
  }

  async function logExitException(error: Error, query?: any) {
    // If transaction already confirmed and there is a query error, ignore.
    // (Assuming txState has a 'confirmed' flag; adjust as needed.)
    // Here we assume txState is an object from useTxState.
    if ((txState as any).confirmed && queryError) return
    const signer = await getSigner()
    const sender = await signer.getAddress()
    captureBalancerException({
      error,
      action: 'withdraw',
      query,
      context: {
        level: 'fatal',
        extra: {
          exitHandler: exitHandlerType,
          params: JSON.stringify(
            {
              exitType: exitType,
              bptIn: _bptIn,
              amountsOut: amountsOut,
              signer: sender,
              slippageBsp: slippageBsp,
              tokenInfo: exitTokenInfo,
              approvalActions: approvalActions,
              bptInValid: bptInValid,
              relayerSignature: '',
              transactionDeadline: transactionDeadline,
              toInternalBalance: shouldExitViaInternalBalance,
            },
            null,
            2
          ),
        },
      },
    })
  }

  // === WATCHERS / EFFECTS ===

  // When isSingleAssetExit changes, reset bptIn and (if false) initialize propAmountsOut.
  useEffect(() => {
    setBptIn('')
    exitPoolService.setExitHandler(exitHandlerType)
    if (!isSingleAssetExit) {
      setInitialPropAmountsOut()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSingleAssetExit])

  // onBeforeMount equivalent: run once on mount.
  useEffect(() => {
    injectTokens([...exitTokenAddresses, pool.address])
    exitPoolService.setExitHandler(exitHandlerType)
    if (!isSingleAssetExit) {
      setInitialPropAmountsOut()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // onMounted equivalent:
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // === RETURN OBJECT (exposing state, computed values, and methods) ===
  return {
    // state
    txState,
    singleAmountOut,
    highPriceImpactAccepted,
    bptIn,
    bptInValid,
    pool,
    isSingleAssetExit,
    propAmountsOut,
    priceImpact,
    priceImpactValid,
    exitPoolService,
    // computed (derived inline)
    exitTokenAddresses,
    exitTokens,
    isLoadingQuery,
    isLoadingMax,
    highPriceImpact: highPriceImpact(),
    rektPriceImpact: rektPriceImpact(),
    hasAcceptedHighPriceImpact: highPriceImpact() ? highPriceImpactAccepted : true,
    txInProgress,
    queryError,
    maxError,
    amountsOut,
    validAmounts,
    hasAmountsOut,
    bptBalance,
    hasBpt,
    fiatTotalOut,
    fiatValueIn,
    fiatAmountsOut,
    exitTokenInfo,
    queryExitQuery,
    approvalActions,
    transactionDeadline,
    shouldExitViaInternalBalance,
    isTxPayloadReady,
    shouldUseSwapExit,
    // canSwapExit: computed above as canSwapExit,
    canSwapExit,
    shouldUseRecoveryExit,
    exitType,
    _bptIn,
    // methods
    setIsSingleAssetExit: handleSetIsSingleAssetExit,
    exit,
  }
}

export default useExitPool
