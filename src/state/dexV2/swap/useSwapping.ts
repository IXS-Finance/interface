import { parseFixed } from '@ethersproject/bignumber'
import { canUseJoinExit, someJoinExit, SubgraphPoolBase, SwapTypes } from '@ixswap1/dex-v2-sdk'
import { useEffect, useState } from 'react'

import LS_KEYS from 'constants/local-storage.keys'
import { bnum, lsSet } from 'lib/utils'
import { getWrapAction, WrapType } from 'lib/utils/balancer/wrapper'
import useNumbers, { FNumFormats } from 'hooks/dex-v2/useNumbers'
import useSor from './useSor'
import { useSwapAssets } from './useSwapAssets'
import { NATIVE_ASSET_ADDRESS } from 'constants/dexV2/tokens'
import { useTokens } from '../tokens/hooks/useTokens'
import { TokenInfo } from 'types/TokenList'
import useWeb3 from 'hooks/dex-v2/useWeb3'
import useUserSettings from '../userSettings/useUserSettings'

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
  const { slippage } = useUserSettings()
  const { setInputAsset, setOutputAsset } = useSwapAssets()

  // COMPUTED VALUES (recalculated each render)
  const slippageBufferRate = parseFloat(slippage)
  const wrapType = getWrapAction(tokenInAddressInput, tokenOutAddressInput)
  const isWrap = wrapType === WrapType.Wrap
  const isUnwrap = wrapType === WrapType.Unwrap
  const tokenIn = tokenInAddressInput ? getToken(tokenInAddressInput) : emptyToken
  const tokenOut = tokenOutAddressInput ? getToken(tokenOutAddressInput) : emptyToken
  const isNativeAssetSwap = tokenInAddressInput === NATIVE_ASSET_ADDRESS
  const tokenInAmountScaled = parseFixed(tokenInAmountInput || '0', tokenIn?.decimals)
  const tokenOutAmountScaled = parseFixed(tokenOutAmountInput || '0', tokenOut?.decimals)
  const requiresTokenApproval = wrapType === WrapType.Unwrap || isNativeAssetSwap ? false : true

  const tokenInAmount = parseFloat(tokenInAmountInput)
  const tokenOutAmount = parseFloat(tokenOutAmountInput)
  const effectivePriceMessage =
    tokenInAmount > 0 && tokenOutAmount > 0
      ? {
          tokenIn: `1 ${tokenIn?.symbol} = ${fNum(
            bnum(tokenOutAmount).div(tokenInAmount).toString(),
            FNumFormats.token
          )} ${tokenOut?.symbol}`,
          tokenOut: `1 ${tokenOut?.symbol} = ${fNum(
            bnum(tokenInAmount).div(tokenOutAmount).toString(),
            FNumFormats.token
          )} ${tokenIn?.symbol}`,
        }
      : { tokenIn: '', tokenOut: '' }

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

  const swapRoute: SwapRoute = (() => {
    if (wrapType !== WrapType.NonWrap) {
      return 'wrapUnwrap'
    }

    return 'balancer'
  })()

  const isBalancerSwap = swapRoute === 'balancer'
  const isWrapUnwrapSwap = swapRoute === 'wrapUnwrap'
  const isGaslessSwappingDisabled = isNativeAssetSwap || isWrapUnwrapSwap
  const hasSwapQuote = parseFloat(tokenInAmountInput) > 0 && parseFloat(tokenOutAmountInput) > 0

  const isLoading = hasSwapQuote || isWrapUnwrapSwap ? false : sor.poolsLoading

  const isConfirming = sor.confirming
  const submissionError = sor.submissionError

  // METHODS
  async function swap(successCallback?: () => void) {
    return sor.swap(() => {
      if (successCallback) {
        successCallback()
      }
      sor.resetState()
    })
  }

  function resetSubmissionError() {
    sor.submissionError = null
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
    await sor.handleAmountChange()
  }

  // WATCHERS / EFFECTS
  useEffect(() => {
    setInputAsset(tokenInAddressInput)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenInAddressInput])

  useEffect(() => {
    setOutputAsset(tokenOutAddressInput)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenOutAddressInput])

  useEffect(() => {
    handleAmountChange()
  }, [tokenInAddressInput, tokenInAmountInput])

  useEffect(() => {
    handleAmountChange()
  }, [tokenInAmountInput, tokenOutAmountInput])

  useEffect(() => {
    const gaslessDisabled = window.location.href.includes('gasless=false')
    if (gaslessDisabled) {
      setSwapGasless(false)
    }
  }, [])

  useEffect(() => {
    if (isBalancerSwap) {
      sor.updateSwapAmounts()
    }
  }, [blockNumber])

  useEffect(() => {
    handleAmountChange()
  }, [slippageBufferRate])

  return {
    // computed values
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
    isBalancerSwap,
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
