import { useState } from 'react'

import { useTokens } from '../tokens/hooks/useTokens'
import { isSameAddress } from 'lib/utils'

/**
 * TYPES
 */
export type AmountIn = {
  address: string
  value: string
  valid: boolean
}

export const useJoinPool = () => {
  const { getTokens, injectTokens, priceFor, nativeAsset, wrappedNativeAsset } = useTokens()

  const [amountsIn, setStateAmountsIn] = useState<AmountIn[]>([])
  const [isSingleAssetJoin, setIsSingleAssetJoin] = useState<boolean>(false)

  /**
   * METHODS
   */

  /**
   * Sets full amountsIn state.
   *
   * @param {AmountIn[]} _amountsIn - Array of amounts in: token address, value
   * & input validity.
   */
  function setAmountsIn(_amountsIn: AmountIn[]) {
    setStateAmountsIn(_amountsIn)
  }

  /**
   * Swap the native token address to wrapped token address
   * or vice versa
   */
  function setJoinWithNativeAsset(joinWithNativeAsset: boolean): void {
    const newAddress = joinWithNativeAsset ? nativeAsset.address : wrappedNativeAsset.address

    const prevAddress = joinWithNativeAsset ? wrappedNativeAsset.address : nativeAsset.address

    const amountIn = amountsIn.find((item) => isSameAddress(prevAddress, item.address))
    if (amountIn) {
      amountIn.address = newAddress
    }
  }

  return {
    amountsIn,
    isSingleAssetJoin,
    setAmountsIn,
    setJoinWithNativeAsset,
  }
}
