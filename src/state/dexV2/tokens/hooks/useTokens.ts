import { useDispatch } from 'react-redux'
import { compact, omit, pick } from 'lodash'
import { useMemo, useState } from 'react'
import { getAddress, isAddress } from '@ethersproject/address'

import { bnum, getAddressFromPoolId, includesAddress, isSameAddress, selectByAddressFast } from 'lib/utils'
import { NativeAsset, TokenInfo, TokenInfoMap, TokenListMap } from 'types/TokenList'
import { useTokensState } from '.'
import { fetchTokensAllowwances, setSpenders, setTokensState } from '..'
import { useWeb3React } from 'hooks/useWeb3React'
import BigNumber from 'bignumber.js'
import { AmountToApprove } from './useTokenApprovalActions'
import useConfig from 'hooks/dex-v2/useConfig'
import TokenService from 'services/token/token.service'
import { tokenListService } from 'services/token-list/token-list.service'
import useTokenLists from 'state/dexV2/tokenLists/useTokenLists'
import useBalancesQuery from 'hooks/dex-v2/queries/useBalancesQuery'
import { TOKENS } from 'constants/dexV2/tokens'
import useAllowancesQuery from 'hooks/dex-v2/queries/useAllowancesQuery'
import useTokenPricesQuery, { TokenPrices } from 'hooks/dex-v2/queries/useTokenPricesQuery'
import useWeb3 from 'hooks/dex-v2/useWeb3'
import { BalanceMap } from 'services/token/concerns/balances.concern'
import { ContractAllowancesMap } from 'services/token/concerns/allowances.concern'

const { uris: tokenListUris } = tokenListService

export const useTokens = () => {
  const state = useTokensState()

  const dispatch = useDispatch()
  const { networkConfig } = useConfig()
  const { isWalletReady } = useWeb3();
  const { allTokenLists, activeTokenLists, balancerTokenLists } = useTokenLists()

  /**
   * STATE
   */

  const nativeAsset: NativeAsset = {
    ...networkConfig.nativeAsset,
    chainId: networkConfig.chainId,
  }

  /**
   * COMPUTED
   */

  /**
   * All tokens from all token lists.
   */
  const allTokenListTokens = useMemo(
    (): TokenInfoMap => ({
      [networkConfig.nativeAsset.address]: nativeAsset,
      ...mapTokenListTokens(allTokenLists),
      ...state.injectedTokens,
    }),
    [JSON.stringify(allTokenLists), JSON.stringify(state.injectedTokens)]
  )

  /**
   * All tokens from token lists that are toggled on.
   */
  const activeTokenListTokens = useMemo(
    (): TokenInfoMap => mapTokenListTokens(activeTokenLists),
    [JSON.stringify(activeTokenLists)]
  )

  /**
   * All tokens from Balancer token lists, e.g. 'listed' and 'vetted'.
   */
  const balancerTokenListTokens = useMemo(
    (): TokenInfoMap => mapTokenListTokens(balancerTokenLists),
    [JSON.stringify(balancerTokenLists)]
  )

  /**
   * The main tokens map
   * A combination of activated token list tokens
   * and any injected tokens. Static and dynamic
   * meta data should be available for these tokens.
   */
  const tokens = useMemo(
    (): TokenInfoMap => ({
      [networkConfig.nativeAsset.address]: nativeAsset,
      ...allTokenListTokens,
      ...state.injectedTokens,
    }),
    [JSON.stringify(allTokenListTokens), JSON.stringify(state.injectedTokens)]
  )

  const wrappedNativeAsset = useMemo((): TokenInfo => getToken(TOKENS.Addresses.wNativeAsset), [JSON.stringify(tokens)])

  /****************************************************************
   * Dynamic metadata
   *
   * The prices, balances and allowances maps provide dynamic
   * metadata for each token in the tokens state array.
   ****************************************************************/
  const {
    data: priceData,
    isSuccess: priceQuerySuccess,
    isLoading: priceQueryLoading,
    isRefetching: priceQueryRefetching,
    isError: priceQueryError,
    refetch: refetchPrices,
  } = useTokenPricesQuery(state.injectedPrices)

  const {
    data: balanceData,
    isSuccess: balanceQuerySuccess,
    isLoading: balanceQueryLoading,
    isRefetching: balanceQueryRefetching,
    isError: balancesQueryError,
    refetch: refetchBalances,
  } = useBalancesQuery({ tokens, isEnabled: true })

  const {
    data: allowanceData,
    isSuccess: allowanceQuerySuccess,
    isLoading: allowanceQueryLoading,
    isRefetching: allowanceQueryRefetching,
    isError: allowancesQueryError,
    refetch: refetchAllowances,
  } = useAllowancesQuery({
    tokens,
    contractAddresses: state.spenders,
    isEnabled: true,
  })

  const prices = useMemo((): TokenPrices => (priceData ? priceData : {}), [JSON.stringify(priceData)])
  const balances = useMemo((): BalanceMap => (balanceData ? balanceData : {}), [JSON.stringify(balanceData)])
  const allowances = useMemo((): ContractAllowancesMap => (allowanceData ? allowanceData : {}), [JSON.stringify(allowanceData)])

  const onchainDataLoading = useMemo(
    (): boolean =>
      isWalletReady &&
      (balanceQueryLoading ||
        balanceQueryRefetching ||
        allowanceQueryLoading ||
        allowanceQueryRefetching)
  , [balanceQueryLoading, balanceQueryRefetching, allowanceQueryLoading, allowanceQueryRefetching])

  const dynamicDataLoaded = useMemo(
    (): boolean => priceQuerySuccess && balanceQuerySuccess && allowanceQuerySuccess
  , [priceQuerySuccess, balanceQuerySuccess, allowanceQuerySuccess])

  const dynamicDataLoading = useMemo(
    (): boolean => priceQueryLoading || priceQueryRefetching || onchainDataLoading
  , [priceQueryLoading, priceQueryRefetching, onchainDataLoading])

  /**
   * METHODS
   */
  /**
   * Create token map from a token list tokens array.const isEmpty = Object.keys(person).length === 0;
   */
  function mapTokenListTokens(tokenListMap: TokenListMap): TokenInfoMap {
    const isEmpty = Object.keys(tokenListMap).length === 0
    if (isEmpty) return {}

    const tokens = [...Object.values(tokenListMap)].map((list) => list.tokens).flat()

    const tokensMap = tokens.reduce<TokenInfoMap>((acc, token) => {
      const address: string = getAddress(token.address)

      // Don't include if already included
      if (acc[address]) return acc

      // Don't include if not on app network
      if (token.chainId !== networkConfig.chainId) return acc

      acc[address] = token
      return acc
    }, {})

    return tokensMap
  }

  /**
   * Fetches static token metadata for given addresses and injects
   * tokens into state tokens map.
   */
  async function injectTokens(addresses: string[]): Promise<void> {
    addresses = addresses
      .filter((a) => a)
      .map(getAddressFromPoolId)
      .map(getAddress)

    // Remove any duplicates
    addresses = [...new Set(addresses)]

    const existingAddresses = Object.keys(tokens)
    const existingAddressesMap = Object.fromEntries(
      existingAddresses.map((address: string) => [getAddress(address), true])
    )

    // Only inject tokens that aren't already in tokens
    const injectable = addresses.filter((address) => !existingAddressesMap[address])
    if (injectable.length === 0) return

    const newTokens = await new TokenService().metadata.get(
      injectable,
      omit(allTokenLists, tokenListUris.Balancer.Allowlisted)
    )

    dispatch(setTokensState({ injectedTokens: newTokens }))
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

  /**
   * Given query, filters tokens map by name, symbol or address.
   * If address is provided, search for address in tokens or injectToken
   */
  async function searchTokens(
    query: string,
    {
      excluded = [],
      disableInjection = false,
      subset = [],
    }: { excluded?: string[]; disableInjection?: boolean; subset?: string[] }
  ): Promise<TokenInfoMap> {
    console.log('nativeAsset', nativeAsset)
    console.log('allTokenListTokens', allTokenListTokens)
    console.log('injectedTokens', state.injectedTokens)
    debugger
    let tokensToSearch = subset.length > 0 ? getTokens(subset) : tokens
    if (!query) return removeExcluded(tokensToSearch, excluded)

    tokensToSearch = subset.length > 0 ? tokensToSearch : allTokenListTokens

    const potentialAddress = getAddressFromPoolId(query)

    if (isAddress(potentialAddress)) {
      const address = getAddress(potentialAddress)
      const token = tokensToSearch[address]
      if (token) {
        return { [address]: token }
      } else {
        if (!disableInjection) {
          await injectTokens([address])
          return pick(tokens, address)
        } else {
          return { [address]: token }
        }
      }
    } else {
      const tokensArray = Object.entries(tokensToSearch)
      const results = tokensArray.filter(
        ([, token]) =>
          token.name?.toLowerCase().includes(query.toLowerCase()) ||
          token.symbol?.toLowerCase().includes(query.toLowerCase())
      )
      return removeExcluded(Object.fromEntries(results), excluded)
    }
  }

  /**
   * Checks if token has a balance
   */
  function hasBalance(address: string): boolean {
    return Number(selectByAddressFast(balances, getAddress(address)) || '0') > 0
  }

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
    if (isSameAddress(tokenAddress, nativeAsset.address)) return false

    const allowance = allowanceFor(tokenAddress, spenderAddress)

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

  /**
   * Get subset of tokens from state
   */
  function getTokens(addresses: string[]) {
    return pick(tokens, addresses.map(getAddress))
  }

  /**
   * Injects prices for tokens where the pricing provider
   * may have not found a valid price for provided tokens
   * @param pricesToInject A map of <address, price> to inject
   */
  function injectPrices(pricesToInject: TokenPrices) {
    state.injectedPrices = {
      ...state.injectedPrices,
      ...pricesToInject,
    }
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

      return typeof price === 'number' ? price : 0
    } catch {
      return 0
    }
  }

  /**
   * Remove excluded tokens from given token map.
   */
  function removeExcluded(tokens: TokenInfoMap, excluded: string[]): TokenInfoMap {
    return Object.keys(tokens)
      .filter((address: any) => !includesAddress(excluded, address))
      .reduce((result: any, address: any) => {
        result[address] = tokens[address]
        return result
      }, {})
  }

  /**
   * Get max balance of token
   * @param tokenAddress
   * @param disableNativeAssetBuffer Optionally disable native asset buffer
   */
  function getMaxBalanceFor(tokenAddress: string, disableNativeAssetBuffer = false): string {
    let maxAmount
    const tokenBalance = balanceFor(tokenAddress) || '0'
    const tokenBalanceBN = bnum(tokenBalance)

    if (tokenAddress === nativeAsset.address && !disableNativeAssetBuffer) {
      // Subtract buffer for gas
      maxAmount = tokenBalanceBN.gt(nativeAsset.minTransactionBuffer)
        ? tokenBalanceBN.minus(nativeAsset.minTransactionBuffer).toString()
        : tokenBalance.toString()
    } else {
      maxAmount = tokenBalance
    }
    return maxAmount
  }

  /**
   * Returns true if the token is the native asset or wrapped native asset
   */
  function isWethOrEth(tokenAddress: string): boolean {
    return isSameAddress(tokenAddress, nativeAsset.address) || isSameAddress(tokenAddress, wrappedNativeAsset.address)
  }

  return {
    ...state,
    nativeAsset,
    // computed
    tokens,
    wrappedNativeAsset,
    activeTokenListTokens,
    balancerTokenListTokens,
    prices,
    balances,
    allowances,
    balanceQueryLoading,
    dynamicDataLoaded,
    dynamicDataLoading,
    priceQueryError,
    priceQueryLoading,
    balancesQueryError,
    allowancesQueryError,
    // methods
    refetchPrices,
    refetchBalances,
    refetchAllowances,
    injectTokens,
    injectSpenders,
    searchTokens,
    hasBalance,
    approvalRequired,
    approvalsRequired,
    allowanceFor,
    priceFor,
    balanceFor,
    getTokens,
    getToken,
    injectPrices,
    getMaxBalanceFor,
    isWethOrEth,
  }
}
