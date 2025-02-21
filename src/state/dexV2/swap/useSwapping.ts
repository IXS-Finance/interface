import { parseFixed } from '@ethersproject/bignumber'
import { canUseJoinExit, someJoinExit, SubgraphPoolBase, SwapTypes } from '@ixswap1/dex-v2-sdk'
import { useEffect, useMemo, useState } from 'react'

import LS_KEYS from 'constants/local-storage.keys'
import { bnum, lsSet } from 'lib/utils'
import { getWrapAction, WrapType } from 'lib/utils/balancer/wrapper'

import useNumbers, { FNumFormats } from 'hooks/dex-v2/useNumbers'
// import { useUserSettings } from '@/providers/user-settings.provider'
import useSor from './useSor'
import useJoinExit from './useJoinExit'
import { useSwapAssets } from './useSwapAssets'
import { NATIVE_ASSET_ADDRESS } from 'constants/dexV2/tokens'
import { useTokens } from '../tokens/hooks/useTokens'
import { TokenInfo } from 'types/TokenList'
import useWeb3 from 'hooks/dex-v2/useWeb3'

export type SwapRoute = 'wrapUnwrap' | 'balancer' | 'joinExit'

export type UseSwapping = ReturnType<typeof useSwapping>

export const emptyToken: TokenInfo = {
  address: '',
  chainId: 0,
  decimals: 0,
  logoURI: '',
  name: '',
  symbol: '',
}

export default function useSwapping(
  exactIn: boolean,
  tokenInAddressInput: string,
  tokenInAmountInput: string,
  tokenOutAddressInput: string,
  tokenOutAmountInput: string,
  setTokenInAmountInput: (amount: string) => void,
  setTokenOutAmountInput: (amount: string) => void
) {
  const [swapGasless, setSwapGaslessValue] = useState<boolean>(false)

  const { fNum } = useNumbers()
  const { getToken, tokens } = useTokens()
  const { blockNumber } = useWeb3()
  // const { slippage } = useUserSettings()
  const slippage = '0.005' // Defaults to 0.5%
  const { setInputAsset, setOutputAsset } = useSwapAssets()

  // COMPUTED
  const slippageBufferRate = parseFloat(slippage)
  const wrapType = getWrapAction(tokenInAddressInput, tokenOutAddressInput)
  const isWrap = wrapType === WrapType.Wrap
  const isUnwrap = wrapType === WrapType.Unwrap
  const tokenIn = useMemo(
    () => (tokenInAddressInput ? getToken(tokenInAddressInput) : emptyToken),
    [tokenInAddressInput]
  )
  const tokenOut = useMemo(
    () => (tokenOutAddressInput ? getToken(tokenOutAddressInput) : emptyToken),
    [tokenOutAddressInput]
  )
  const isNativeAssetSwap = tokenInAddressInput === NATIVE_ASSET_ADDRESS
  const tokenInAmountScaled = parseFixed(tokenInAmountInput || '0', tokenIn?.decimals)

  const tokenOutAmountScaled = parseFixed(tokenOutAmountInput || '0', tokenOut?.decimals)
  const requiresTokenApproval = useMemo(() => {
    if (wrapType === WrapType.Unwrap || isNativeAssetSwap) {
      return false
    }
    return true
  }, [wrapType, isNativeAssetSwap])

  const effectivePriceMessage = useMemo(() => {
    const tokenInAmount = parseFloat(tokenInAmountInput)
    const tokenOutAmount = parseFloat(tokenOutAmountInput)

    if (tokenInAmount > 0 && tokenOutAmount > 0) {
      return {
        tokenIn: `1 ${tokenIn?.symbol} = ${fNum(
          bnum(tokenOutAmount).div(tokenInAmount).toString(),
          FNumFormats.token
        )} ${tokenOut?.symbol}`,
        tokenOut: `1 ${tokenOut?.symbol} = ${fNum(
          bnum(tokenInAmount).div(tokenOutAmount).toString(),
          FNumFormats.token
        )} ${tokenIn?.symbol}`,
      }
    }
    return {
      tokenIn: '',
      tokenOut: '',
    }
  }, [tokenInAmountInput, tokenOutAmountInput])
  const sor = useSor({
    exactIn,
    tokenInAddressInput,
    tokenInAmountInput,
    tokenOutAddressInput,
    tokenOutAmountInput,
    wrapType,
    tokenInAmountScaled,
    tokenOutAmountScaled,
    sorConfig: {
      handleAmountsOnFetchPools: true,
    },
    tokenIn,
    tokenOut,
    slippageBufferRate,
    setTokenInAmountInput,
    setTokenOutAmountInput,
  })
  const [pools, setPools] = useState<SubgraphPoolBase[]>(sor.pools)
  const joinExit = useJoinExit({
    exactIn,
    tokenInAddressInput,
    tokenInAmountInput,
    tokenOutAddressInput,
    tokenOutAmountInput,
    tokenInAmountScaled,
    tokenOutAmountScaled,
    tokenIn,
    tokenOut,
    slippageBufferRate,
    pools: pools,
    setTokenInAmountInput,
    setTokenOutAmountInput,
  })
  const swapRoute = useMemo<SwapRoute>(() => {
    if (wrapType !== WrapType.NonWrap) {
      return 'wrapUnwrap'
    } else if (isNativeAssetSwap) {
      return 'balancer'
    }

    const swapInfoAvailable = joinExit.swapInfo?.returnAmount && !joinExit.swapInfo?.returnAmount.isZero()

    const joinExitSwapAvailable = swapInfoAvailable
      ? canUseJoinExit(
          exactIn ? SwapTypes.SwapExactIn : SwapTypes.SwapExactOut,
          tokenInAddressInput,
          tokenOutAddressInput
        )
      : false

    const joinExitSwapPresent = joinExitSwapAvailable
      ? someJoinExit(
          sor.pools as SubgraphPoolBase[],
          joinExit.swapInfo?.swaps ?? [],
          joinExit.swapInfo?.tokenAddresses ?? []
        )
      : false
    // Currently joinExit swap is only suitable for ExactIn and non-eth swaps
    return joinExitSwapPresent ? 'joinExit' : 'balancer'
  }, [])

  const isBalancerSwap = swapRoute === 'balancer'
  const isJoinExitSwap = swapRoute === 'joinExit'
  const isWrapUnwrapSwap = swapRoute === 'wrapUnwrap'
  const isGaslessSwappingDisabled = isNativeAssetSwap || isWrapUnwrapSwap
  const hasSwapQuote = parseFloat(tokenInAmountInput) > 0 && parseFloat(tokenOutAmountInput) > 0

  const isLoading = useMemo(() => {
    if (hasSwapQuote || isWrapUnwrapSwap) {
      return false
    }

    return joinExit.swapInfoLoading || sor.poolsLoading
  }, [hasSwapQuote, isWrapUnwrapSwap, joinExit.swapInfoLoading, sor.poolsLoading])

  const isConfirming = sor.confirming || joinExit.confirming

  const submissionError = sor.submissionError || joinExit.submissionError

  // METHODS
  async function swap(successCallback?: () => void) {
    if (isJoinExitSwap) {
      return joinExit.swap(() => {
        if (successCallback) {
          successCallback()
        }

        joinExit.resetState()
      })
    } else {
      // handles both Balancer and Wrap/Unwrap swaps
      return sor.swap(() => {
        if (successCallback) {
          successCallback()
        }

        sor.resetState()
      })
    }
  }

  function resetSubmissionError() {
    sor.submissionError = null
    joinExit.submissionError = null
  }

  function setSwapGasless(flag: boolean) {
    setSwapGaslessValue(flag)

    lsSet(LS_KEYS.Swap.Gasless, swapGasless.toString())
  }

  function toggleSwapGasless() {
    setSwapGasless(!swapGasless)

    handleAmountChange()
  }

  function getQuote() {
    if (isJoinExitSwap) {
      return joinExit.getQuote()
    }
    return sor.getQuote()
  }

  function resetAmounts() {
    sor.resetInputAmounts('')
  }

  async function handleAmountChange() {
    if (exactIn) {
      setTokenOutAmountInput('')
    } else {
      setTokenInAmountInput('')
    }

    sor.resetState()
    joinExit.resetState()

    await sor.handleAmountChange()
    await joinExit.handleAmountChange()
  }

  // WATCHERS
  useEffect(() => {
    setInputAsset(tokenInAddressInput)

    handleAmountChange()
  }, [tokenInAddressInput])

  useEffect(() => {
    setOutputAsset(tokenOutAddressInput);

    handleAmountChange()
  }, [tokenOutAddressInput])

  useEffect(() => {
    handleAmountChange()
  }, [tokenInAmountInput, tokenOutAmountInput])

  useEffect(() => {
    const gaslessDisabled = window.location.href.includes('gasless=false')

    if (gaslessDisabled) {
      setSwapGasless(false)
    }
  }, [])

  // TODO: Fix this
  // watch(blockNumber, () => {
  //   if (isJoinExitSwap.value) {
  //     if (!joinExit.hasValidationError.value) {
  //       joinExit.handleAmountChange()
  //     }
  //   } else if (isBalancerSwap.value) {
  //     sor.updateSwapAmounts()
  //   }
  // })

  useEffect(() => {
    if (isJoinExitSwap) {
      if (!joinExit.hasValidationError) {
        joinExit.handleAmountChange();
      }
    } else if (isBalancerSwap) {
      sor.updateSwapAmounts();
    }
  }, [blockNumber]);

  useEffect(() => {
    handleAmountChange()
  }, [slippageBufferRate])

  return {
    // computed
    isWrap,
    isUnwrap,
    isNativeAssetSwap,
    tokenIn,
    tokenOut,
    tokenInAmountScaled,
    tokenOutAmountScaled,
    tokens,
    requiresTokenApproval,
    effectivePriceMessage,
    swapRoute,
    exactIn,
    isLoading,
    sor,
    joinExit,
    isBalancerSwap,
    isJoinExitSwap,
    wrapType,
    isWrapUnwrapSwap,
    tokenInAddressInput,
    tokenInAmountInput,
    tokenOutAddressInput,
    tokenOutAmountInput,
    slippageBufferRate,
    isConfirming,
    submissionError,
    resetSubmissionError,
    swapGasless,
    toggleSwapGasless,
    isGaslessSwappingDisabled,
    resetAmounts,
    // methods
    getQuote,
    swap,
    handleAmountChange,
  }
}
