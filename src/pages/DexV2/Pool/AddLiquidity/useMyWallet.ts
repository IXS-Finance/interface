import { isSameAddress } from 'lib/utils'
// import useAddLiquidityTabs, { Tab, tabs } from '@/composables/pools/useAddLiquidityTabs'
import { useTokens } from 'state/dexV2/tokens/hooks/useTokens'
import { usePool } from 'state/dexV2/pool/usePool'
import { AmountIn, useJoinPool } from 'state/dexV2/pool/useJoinPool'

export function useMyWallet(poolId: string) {
  /**
   * COMPOSABLES
   */
  const { pool, isLoadingPool } = usePool(poolId)
  const { setAmountsIn, setJoinWithNativeAsset, isSingleAssetJoin, amountsIn } = useJoinPool(pool)
  const { nativeAsset, wrappedNativeAsset, getMaxBalanceFor } = useTokens()
  // const { activeTab } = useAddLiquidityTabs()

  /**
   * COMPUTED
   */
  const excludedTokens: string[] = pool?.address ? [pool.address] : []

  /**
   * METHODS
   */

  function setMaxAmount(address: string, maxBalance: string) {
    if (isSingleAssetJoin) {
      // Set the new Token address, and set the input value to max token balance
      setAmountsIn([
        {
          address: address,
          value: maxBalance,
          valid: true,
        },
      ])
    } else {
      const isNativeAsset = isSameAddress(address, nativeAsset.address)
      const isWrappedNativeAsset = isSameAddress(address, wrappedNativeAsset.address)
      // If the token is ETH or WETH, we find the other one and switch the token address
      if (isNativeAsset || isWrappedNativeAsset) {
        setJoinWithNativeAsset(isNativeAsset)
      }
      // Find the token in the amounts array
      const amountIn: AmountIn | undefined = amountsIn.find((item) => isSameAddress(address, item.address))

      // Update the amount in values
      if (amountIn) {
        amountIn.valid = true
        amountIn.value = maxBalance
      }
    }
  }

  function handleMyWalletTokenClick(address: string, isPoolToken: boolean) {
    const maxBalance = getMaxBalanceFor(address)

    if (isPoolToken) {
      setMaxAmount(address, maxBalance)
    } else {
      // If non pool token is clicked, switch to Single Token tab
      // activeTab = tabs[Tab.SingleToken]
      // Wait for the tab to update, the set the max amount
      setMaxAmount(address, maxBalance)
    }
  }

  return {
    handleMyWalletTokenClick,
    isLoadingPool,
    pool,
    excludedTokens,
    amountsIn,
    setAmountsIn,
    // activeTab,
  }
}
