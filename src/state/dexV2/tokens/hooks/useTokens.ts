import { useDispatch } from 'react-redux'

import { getAddress } from '@ethersproject/address'
import { bnum, getAddressFromPoolId, isSameAddress, selectByAddressFast } from 'lib/utils'
import { NativeAsset, TokenInfo } from 'types/TokenList'
import { useTokensState } from '.'
import { fetchTokensAllowwances, setSpenders } from '..'
import { useWeb3React } from 'hooks/useWeb3React'
import BigNumber from 'bignumber.js'
import { AmountToApprove } from './useTokenApprovalActions'
import useConfig from 'hooks/dex-v2/useConfig'

export const useTokens = () => {
  const { tokens, balances, prices, spenders, allowances } = useTokensState()
  const dispatch = useDispatch()
  const { account } = useWeb3React()
  const { networkConfig } = useConfig();

  const nativeAsset: NativeAsset = {
    ...networkConfig.nativeAsset,
    chainId: networkConfig.chainId,
  };

  /**
   * Returns the allowance for a token, scaled by token decimals
   *  (so 1 ETH = 1, 1 GWEI = 0.000000001)
   */
  function allowanceFor(tokenAddress: string, spenderAddress: string): any {
    console.log('allowances', allowances)
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

    console.log('allowance', allowance.toString(), bnum(amount).toString())
    return allowance.lt(bnum(amount))
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
   * Get max balance of token
   * @param tokenAddress
   * @param disableNativeAssetBuffer Optionally disable native asset buffer
   */
  function getMaxBalanceFor(
    tokenAddress: string,
    disableNativeAssetBuffer = false
  ): string {
    let maxAmount;
    const tokenBalance = balanceFor(tokenAddress) || '0';
    const tokenBalanceBN = bnum(tokenBalance);

    if (tokenAddress === nativeAsset.address && !disableNativeAssetBuffer) {
      // Subtract buffer for gas
      maxAmount = tokenBalanceBN.gt(nativeAsset.minTransactionBuffer)
        ? tokenBalanceBN.minus(nativeAsset.minTransactionBuffer).toString()
        : tokenBalance.toString();
    } else {
      maxAmount = tokenBalance;
    }
    return maxAmount;
  }


  /**
   * Injects contract addresses that could possibly spend the users tokens into
   * the spenders map. E.g. This is used for injecting gauges into the map as they
   * must be allowed to spend a users BPT in order to stake the BPT in the gauge.
   */
  async function injectSpenders(addresses: string[]): Promise<void> {
    addresses = addresses.filter((a) => a).map(getAddress)

    dispatch(setSpenders(addresses))
  }

  return {
    balances,
    nativeAsset,
    tokens,
    getToken,
    balanceFor,
    priceFor,
    injectSpenders,
    refetchAllowances,
    approvalsRequired,
    allowanceFor,
    approvalRequired,
    getMaxBalanceFor,
  }
}
