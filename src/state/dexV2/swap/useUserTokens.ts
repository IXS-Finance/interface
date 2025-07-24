import { useMemo } from 'react'

import { bnum, includesAddress } from 'lib/utils'
import { useTokens } from '../tokens/hooks/useTokens'

export function useUserTokens() {
  const { balances, balanceFor, balanceQueryLoading: isLoadingBalances } = useTokens()

  // Compute the array of token addresses that have a balance in the user's wallet.
  const tokensWithBalance = useMemo(() => {
    return Object.keys(balances).filter((tokenAddress) => {
      return bnum(balanceFor(tokenAddress)).gt(0)
    })
  }, [balances, balanceFor])

  /**
   * Returns tokens with balance that are included in the provided addresses.
   */
  function tokensWithBalanceFrom(addresses: string[]): string[] {
    return addresses.filter((address) => includesAddress(tokensWithBalance, address))
  }

  /**
   * Returns tokens with balance that are not included in the provided addresses.
   */
  function tokensWithBalanceNotIn(addresses: string[]): string[] {
    return tokensWithBalance.filter((address) => !includesAddress(addresses, address))
  }

  /**
   * Returns tokens without balance from the provided addresses.
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
