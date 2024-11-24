import { useDispatch } from 'react-redux'

import { getAddress } from '@ethersproject/address'
import { bnum, getAddressFromPoolId, isSameAddress, selectByAddressFast } from 'lib/utils'
import { TokenInfo } from 'types/TokenList'
import { useTokensState } from '.'
import { fetchTokensAllowwances, setSpenders } from '..'
import { useWeb3React } from 'hooks/useWeb3React'
import BigNumber from 'bignumber.js'

export const useTokens = () => {
  const { tokens, balances, prices, spenders, allowances } = useTokensState()
  const dispatch = useDispatch()
  const { account } = useWeb3React()

  /**
   * Returns the allowance for a token, scaled by token decimals
   *  (so 1 ETH = 1, 1 GWEI = 0.000000001)
   */
  function allowanceFor(tokenAddress: string, spenderAddress: string): any {
    return bnum((allowances[getAddress(spenderAddress)] || {})[getAddress(tokenAddress)])
  }

  /**
   * Check if approval is required for given contract address
   * for a token and amount.
   */
  function approvalRequired(tokenAddress: string, amount: string, spenderAddress: string): boolean {
    if (!amount || bnum(amount).eq(0)) return false
    if (!spenderAddress) return false
    // if (isSameAddress(tokenAddress, nativeAsset.address)) return false

    const allowance = allowanceFor(tokenAddress, spenderAddress)
    return allowance.lt(amount)
  }

  /**
   * Check which tokens/amounts require approvals for the spender.
   *
   * @param {AmountToApprove[]} amountsToApprove - array of token addresses and amounts to check.
   * @param {string} spender - Contract address of spender to check approvals against.
   * @returns a subset of the amountsToApprove array.
   */
  function approvalsRequired(amountsToApprove: AmountToApprove[], spender: string): AmountToApprove[] {
    return amountsToApprove.filter(({ address, amount }) => {
      if (!spender) return false

      return approvalRequired(address, amount, spender)
    })
  }

  function refetchAllowances(contractAddress: string): void {
    const accountAddress = account || ''

    dispatch(
      fetchTokensAllowwances({
        tokens,
        account: accountAddress,
        contractAddress,
      })
    )
  }
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

  /**
   * Injects contract addresses that could possibly spend the users tokens into
   * the spenders map. E.g. This is used for injecting gauges into the map as they
   * must be allowed to spend a users BPT in order to stake the BPT in the gauge.
   */
  async function injectSpenders(addresses: string[]): Promise<void> {
    addresses = addresses.filter((a) => a).map(getAddress)

    const currentSpenders = [...spenders]
    const newSpenders = [...currentSpenders.concat(addresses)]

    dispatch(setSpenders(newSpenders))
  }

  return { getToken, balanceFor, priceFor, injectSpenders, refetchAllowances }
}
