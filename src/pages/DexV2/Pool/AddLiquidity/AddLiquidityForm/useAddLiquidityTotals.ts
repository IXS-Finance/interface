import { bnum, isSameAddress } from 'lib/utils'
import usePropMaxJoin from 'hooks/dex-v2/pools/usePropMaxJoin'
import { Pool } from 'services/pool/types'
import { useJoinPool } from 'state/dexV2/pool/useJoinPool'
import { useUserTokens } from 'state/dexV2/pool/useUserTokens'
import { useTokens } from 'state/dexV2/tokens/hooks/useTokens'
import { isWrappedNativeAsset } from 'hooks/dex-v2/usePoolHelpers'

export function useAddLiquidityTotals(pool: Pool) {
  // HOOKS (assumed to return plain objects/arrays)
  const { poolJoinTokens, highPriceImpact, supportsProportionalOptimization, amountsIn, tokensIn, setAmountsIn } =
    useJoinPool(pool)

  const { isWethOrEth, nativeAsset, balanceFor } = useTokens()
  const { tokensWithBalanceFrom, tokensWithoutBalanceFrom } = useUserTokens()

  // Check if any token in amountsIn is the native asset.
  const useNativeAsset = amountsIn.some((amount: any) => isSameAddress(amount.address, nativeAsset.address))

  const { getPropMax } = usePropMaxJoin(pool, tokensIn, useNativeAsset)

  // COMPUTED PROPERTIES (calculated on every render)

  const priceImpactClasses = {
    'dark:bg-gray-800': !highPriceImpact,
    'bg-red-500 dark:bg-red-500 text-white divide-red-400': highPriceImpact,
  }

  const optimizeBtnClasses = {
    'text-gradient': !highPriceImpact,
    'text-red-500 px-2 py-1 bg-white rounded-lg': highPriceImpact,
  }

  const hasBalanceForAllTokens = (() => {
    const hasBalanceForAll =
      tokensWithoutBalanceFrom(poolJoinTokens).filter((address) => !isWethOrEth(address)).length === 0

    // If the pool contains the wrapped native asset, the user might only hold one of them.
    if (isWrappedNativeAsset(pool)) {
      const hasWethOrEthBalance = tokensWithBalanceFrom(poolJoinTokens).some((address) => isWethOrEth(address))
      return hasBalanceForAll && hasWethOrEthBalance
    }
    return hasBalanceForAll
  })()

  const hasBalanceForSomeTokens = (() => {
    const hasBalanceForSome =
      tokensWithBalanceFrom(poolJoinTokens).filter((address) => !isWethOrEth(address)).length > 0

    if (isWrappedNativeAsset(pool)) {
      const hasWethOrEthBalance = tokensWithBalanceFrom(poolJoinTokens).some((address) => isWethOrEth(address))
      return hasBalanceForSome || hasWethOrEthBalance
    }
    return hasBalanceForSome
  })()

  const maximized = amountsIn.every((amount: any) => {
    if (isSameAddress(amount.address, nativeAsset.address)) {
      const balance = balanceFor(amount.address)
      return amount.value === bnum(balance).minus(nativeAsset.minTransactionBuffer).toString()
    } else {
      return amount.value === balanceFor(amount.address)
    }
  })

  const optimized = (() => {
    if (!supportsProportionalOptimization) return false
    const propMaxAmountsIn = getPropMax()
    return amountsIn.every((item: any, i: number) => {
      return Number(item.value) === Number(propMaxAmountsIn[i].value)
    })
  })()

  // METHODS

  function maximizeAmounts(): void {
    if (maximized) {
      return
    }
    const newAmounts = amountsIn.map((amount: any) => {
      if (isSameAddress(amount.address, nativeAsset.address)) {
        const balance = balanceFor(amount.address)
        return {
          ...amount,
          value: bnum(balance).gt(nativeAsset.minTransactionBuffer)
            ? bnum(balance).minus(nativeAsset.minTransactionBuffer).toString()
            : '0',
        }
      } else {
        return {
          ...amount,
          value: balanceFor(amount.address),
        }
      }
    })
    setAmountsIn(newAmounts)
  }

  function optimizeAmounts() {
    const propMaxAmountsIn = getPropMax()
    setAmountsIn(propMaxAmountsIn)
  }

  return {
    priceImpactClasses,
    optimizeBtnClasses,
    hasBalanceForAllTokens,
    hasBalanceForSomeTokens,
    optimized,
    maximized,
    maximizeAmounts,
    optimizeAmounts,
  }
}
