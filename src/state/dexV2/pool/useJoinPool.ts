// useJoinPool.ts
import { useState, useEffect, useCallback } from 'react'
import debounce from 'debounce-promise'
import { useQuery } from '@tanstack/react-query'

import { joinTokens, fiatValueOf, isDeep, isStableLike } from 'hooks/dex-v2/usePoolHelpers'
import useNumbers from 'hooks/dex-v2/useNumbers'
import { useTxState } from 'hooks/dex-v2/useTxState'
import { HIGH_PRICE_IMPACT, REKT_PRICE_IMPACT } from 'constants/dexV2/poolLiquidity'
import QUERY_KEYS from 'constants/dexV2/queryKeys'
import { bnSum, bnum, isSameAddress } from 'lib/utils'
import { JoinHandler, JoinPoolService } from 'services/balancer/pools/joins/join-pool.service'
import { TokenInfoMap } from 'types/TokenList'
import { TransactionActionInfo } from 'types/transactions'
import { TransactionResponse } from '@ethersproject/abstract-provider'
import { ApprovalAction } from 'hooks/dex-v2/approvals/types'
import { throwQueryError } from 'lib/utils/queries'
import { captureBalancerException } from 'lib/utils/errors'
import useTokenApprovalActions from 'hooks/dex-v2/approvals/useTokenApprovalActions'
import { useTokens } from '../tokens/hooks/useTokens'
import useWeb3 from 'hooks/dex-v2/useWeb3'
import useUserSettings from '../userSettings/useUserSettings'
import { useDispatch, useSelector } from 'react-redux'
import { setPoolState } from '.'

// --- Types ---
export type AmountIn = {
  address: string
  value: string
  valid: boolean
}

// --- Hook ---
export const useJoinPool = (pool: any, queryJoinDebounceMillis = 1000) => {
  const dispatch = useDispatch()
  const state = useSelector((state: any) => state.dexV2Pool)
  const { amountsIn } = state
  // STATE
  const [isMounted, setIsMounted] = useState(false)
  const [bptOut, setBptOut] = useState<string>('0')
  const [priceImpact, setPriceImpact] = useState<number>(0)
  const [highPriceImpactAccepted, setHighPriceImpactAccepted] = useState<boolean>(false)
  const [txError, setTxError] = useState<string>('')
  const [approvalActions, setApprovalActionsState] = useState<TransactionActionInfo[]>([])
  const [isSingleAssetJoin, setSingleAssetJoin] = useState<boolean>(false)
  // (For relayer approval/signature, these are placeholders—you may replace them with real state.)
  const [relayerSignature, setRelayerSignature] = useState<string>('')
  const [relayerApproval, setRelayerApproval] = useState({ isUnlocked: false })

  // SERVICES & COMPOSABLES
  const { fNum, toFiat } = useNumbers()
  const { slippageBsp, transactionDeadline } = useUserSettings()
  const { getSigner, appNetworkConfig } = useWeb3()
  const { txState, txInProgress, resetTxState } = useTxState()
  const { getTokenApprovalActions } = useTokenApprovalActions()
  const { getTokens, priceFor, nativeAsset, wrappedNativeAsset } = useTokens()

  // Create a join pool service instance.
  const joinPoolService = new JoinPoolService(pool)

  // --- Derived values (computed inline) ---
  const isDeepPool = isDeep(pool)
  const poolJoinTokens = joinTokens(pool)
  const tokensIn: TokenInfoMap = getTokens(amountsIn.map((a: any) => a.address))
  const highPriceImpactFlag = bnum(priceImpact).isGreaterThanOrEqualTo(HIGH_PRICE_IMPACT)
  const rektPriceImpactFlag = bnum(priceImpact).isGreaterThanOrEqualTo(REKT_PRICE_IMPACT)
  const hasAcceptedHighPriceImpact = highPriceImpactFlag ? highPriceImpactAccepted : true
  const hasValidInputs = amountsIn.every((a: any) => a.valid) && hasAcceptedHighPriceImpact
  const hasAmountsIn = amountsIn.some((a: any) => bnum(a.value).gt(0))
  const amountsInWithValue = amountsIn.filter((a: any) => bnum(a.value).gt(0))
  const missingPricesIn = !amountsInWithValue.every((a: any) => bnum(priceFor(a.address)).gt(0))
  const fiatValueIn = bnSum(amountsIn.map((a: any) => toFiat(a.value || 0, a.address))).toString()
  const fiatValueOut = fiatValueOf(pool, bptOut)

  const amountsToApprove = amountsIn.map((amountIn: any) => ({
    address: amountIn.address,
    amount: amountIn.value,
    spender: appNetworkConfig.addresses.vault,
  }))

  const joinHandlerType: JoinHandler = isDeepPool
    ? isSingleAssetJoin
      ? JoinHandler.Swap
      : JoinHandler.Generalised
    : JoinHandler.ExactIn

  const supportsProportionalOptimization = !isStableLike(pool.poolType)

  // --- Methods ---

  const setTokensIn = (tokens: string[]) => {
    dispatch(setPoolState({ amountsIn: tokens.map((address) => ({ address, value: '', valid: true })) }))
  }

  const resetAmounts = () => {
    dispatch(setPoolState({ amountsIn: amountsIn.map((a: any) => ({ ...a, value: '' })) }))
  }

  const resetQueryJoinState = () => {
    setBptOut('0')
    setPriceImpact(0)
    // if (queryJoinQuery.remove) {
    //   queryJoinQuery.remove()
    // }
  }

  const setApprovalActions = async () => {
    const tokenApprovalActions = await getTokenApprovalActions({
      amountsToApprove,
      spender: appNetworkConfig.addresses.vault,
      actionType: ApprovalAction.AddLiquidity,
      skipAllowanceCheck: true,
    })
    setApprovalActionsState(tokenApprovalActions)
  }

  const validateAmountsIn = (): boolean => {
    if (!hasAmountsIn) {
      setPriceImpact(0)
      return false
    }
    return true
  }

  // The function to query expected join output (debounced later)
  const queryJoin = async () => {
    if (!validateAmountsIn()) return null
    try {
      joinPoolService.setJoinHandler(joinHandlerType)
      await setApprovalActions()
      if (!validateAmountsIn()) return null
      const output = await joinPoolService.queryJoin({
        amountsIn: amountsInWithValue,
        tokensIn,
        signer: await getSigner(),
        slippageBsp: slippageBsp,
        relayerSignature: relayerSignature,
        approvalActions,
        transactionDeadline: transactionDeadline,
      })
      setBptOut(output.bptOut)
      setPriceImpact(output.priceImpact)
      return output
    } catch (error) {
      await logJoinException(error as Error, queryJoinQuery)
      throwQueryError('Failed to construct join.', error)
    }
  }

  // Create a debounced version of queryJoin.
  const debounceQueryJoin = debounce(queryJoin, queryJoinDebounceMillis)

  // --- React Query ---
  const queryEnabled = isMounted && !txInProgress
  // @ts-ignore
  const queryJoinQuery = useQuery({
    // The query key includes amountsIn and isSingleAssetJoin
    queryKey: QUERY_KEYS.Pools.Joins.QueryJoin(amountsIn, isSingleAssetJoin),
    queryFn: debounceQueryJoin,
    enabled: queryEnabled,
    refetchOnWindowFocus: false,
  })

  // Execute join transaction.
  const join = async (): Promise<TransactionResponse> => {
    try {
      setTxError('')
      joinPoolService.setJoinHandler(joinHandlerType)
      await setApprovalActions()
      const joinRes = await joinPoolService.join({
        amountsIn: amountsInWithValue,
        tokensIn,
        signer: await getSigner(),
        slippageBsp: slippageBsp,
        relayerSignature: relayerSignature,
        approvalActions,
        transactionDeadline: transactionDeadline,
      })
      return joinRes
    } catch (error) {
      await logJoinException(error as Error)
      setTxError((error as Error).message)
      throw error
    }
  }

  const setIsSingleAssetJoin = (value: boolean) => {
    setSingleAssetJoin(value)
  }

  const setJoinWithNativeAsset = (joinWithNativeAsset: boolean): void => {
    const newAddress = joinWithNativeAsset ? nativeAsset.address : wrappedNativeAsset.address
    const prevAddress = joinWithNativeAsset ? wrappedNativeAsset.address : nativeAsset.address

    dispatch(
      setPoolState({
        amountsIn: amountsIn.map((item: any) =>
          isSameAddress(prevAddress, item.address) ? { ...item, address: newAddress } : item
        ),
      })
    )
  }

  const logJoinException = async (error: Error, query?: any) => {
    const signer = await getSigner()
    const sender = await signer.getAddress()
    captureBalancerException({
      error,
      action: 'invest',
      query,
      context: {
        level: 'fatal',
        extra: {
          joinHandler: joinHandlerType,
          params: JSON.stringify(
            {
              amountsIn: amountsInWithValue,
              tokensIn,
              signer: sender,
              slippageBsp,
              relayerSignature,
              approvalActions,
              transactionDeadline,
            },
            null,
            2
          ),
        },
      },
    })
  }

  const setAmountsIn = (amountsInParam: AmountIn[]) => {
    dispatch(setPoolState({ amountsIn: amountsInParam }))
  }

  // When isSingleAssetJoin changes, reset query state and update join handler.
  useEffect(() => {
    resetQueryJoinState()
    joinPoolService.setJoinHandler(joinHandlerType)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSingleAssetJoin])

  useEffect(() => {
    setIsMounted(true)
  }, [])

  return {
    // State
    amountsIn,
    highPriceImpactAccepted,
    txState,
    pool, // read-only (the pool object passed in)
    isSingleAssetJoin,
    bptOut,
    priceImpact,
    txError,
    poolJoinTokens,
    isLoadingQuery: queryJoinQuery.isFetching,
    queryError: queryJoinQuery.error ? queryJoinQuery.error.message : undefined,
    highPriceImpact: highPriceImpactFlag,
    rektPriceImpact: rektPriceImpactFlag,
    hasAcceptedHighPriceImpact,
    hasValidInputs,
    hasAmountsIn,
    fiatValueIn,
    fiatValueOut,
    txInProgress,
    approvalActions,
    missingPricesIn,
    tokensIn,
    supportsProportionalOptimization,

    // Methods
    setAmountsIn,
    setTokensIn,
    resetAmounts,
    join,
    resetTxState,
    setIsSingleAssetJoin,
    setJoinWithNativeAsset,

    // Query
    queryJoinQuery,
  }
}
