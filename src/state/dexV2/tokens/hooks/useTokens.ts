import { getAddress } from '@ethersproject/address'
import { getAddressFromPoolId, selectByAddressFast } from 'lib/utils'
import { TokenInfo } from 'types/TokenList'
import { useTokensState } from '.'

export const useTokens = () => {
  const { tokens, balances, prices } = useTokensState()

  /**
   * Get single token from state
   */
  function getToken(address: string): TokenInfo {
    address = getAddressFromPoolId(address) // In case pool ID has been passed

    return selectByAddressFast(tokens, getAddress(address)) as TokenInfo
  }

  /**
   * Fetch balance for a token
   */
  function balanceFor(address: string): string {
    try {
      return selectByAddressFast(balances, getAddress(address)) || '0'
    } catch {
      return '0'
    }
  }

  /**
   * Fetch price for a token
   */
  function priceFor(address: string): number {
    try {
      const price = selectByAddressFast(prices, getAddress(address))

      if (!price) {
        return 0
      }

      return price
    } catch {
      return 0
    }
  }

  return { getToken, balanceFor, priceFor }
}
