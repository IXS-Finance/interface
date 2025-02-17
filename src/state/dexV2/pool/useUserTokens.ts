import { bnum, includesAddress } from 'lib/utils'
import { useTokens } from '../tokens/hooks/useTokens'
import { useMemo } from 'react'

/**
 * Provides access to functionality related to tokens in a user's connected
 * wallet.
 */
export function useUserTokens() {
  /**
   * COMPOSABLES
   */
  const { balances, balanceFor, balanceQueryLoading: isLoadingBalances } = useTokens()

  /**
   * COMPUTED
   */
  // Array of token addresses that have a balance in the user's wallet.
  const tokensWithBalance = useMemo<string[]>(() => {
    return Object.keys(balances).filter((tokenAddress) => {
      return bnum(balanceFor(tokenAddress)).gt(0)
    })
  }, [JSON.stringify(balances)])

  /**
   * METHODS
   */

  /**
   * Get subset of tokensWithBalance included in the provided array of addresses.
   *
   * @param {string[]} addresses Array of token addresses to filter by.
   * @returns Array of token addresses that are included in the provided array of addresses.
   */
  function tokensWithBalanceFrom(addresses: string[]): string[] {
    return addresses.filter((address) => includesAddress(tokensWithBalance, address))
  }

  /**
   * Get subset of tokensWithBalance not included in the provided array of addresses.
   *
   * @param {string[]} addresses Array of token addresses to filter by.
   * @returns Array of token addresses that are not included in the provided array of addresses.
   */
  function tokensWithBalanceNotIn(addresses: string[]): string[] {
    return tokensWithBalance.filter((address: any) => !includesAddress(addresses, address))
  }

  /**
   * Get subset of provided addresses not included in the tokensWithBalance array.
   *
   * @param {string[]} addresses Array of token addresses to filter by.
   * @returns Array of token addresses without a balance in the user's wallet.
   */
  function tokensWithoutBalanceFrom(addresses: string[]): string[] {
    return addresses.filter((address) => !includesAddress(tokensWithBalance, address))
  }

  return {
    isLoadingBalances,
    tokensWithBalance,
    tokensWithBalanceFrom,
    tokensWithoutBalanceFrom,
    tokensWithBalanceNotIn,
  }
}
