import { Currency, Token, CurrencyAmount, Ether } from '@ixswap1/sdk-core'
import JSBI from 'jsbi'
import { useMemo } from 'react'
import { useActiveWeb3React } from '../../hooks/web3'
import { useAllTokens } from '../../hooks/Tokens'
import { useMulticall2Contract, useTokenContract } from '../../hooks/useContract'
import { isAddress } from '../../utils'
import { useSingleCallResult, useSingleContractMultipleData } from '../multicall/hooks'
import { useSelector } from 'react-redux'
import { AppState } from 'state'
import { useReadContracts, useBalance } from 'wagmi'
import { erc20Abi } from 'viem'

/**
 * Modern implementation using Wagmi's useBalance for single ETH balance
 */
export function useETHBalance(address?: string): CurrencyAmount<Currency> | undefined {
  const { chainId } = useActiveWeb3React()

  const { data: balance } = useBalance({
    address: address as `0x${string}`,
    query: {
      enabled: Boolean(address),
      staleTime: 30_000,
      gcTime: 5 * 60 * 1000,
    },
  })

  return useMemo(() => {
    if (!balance || !chainId) return undefined
    return CurrencyAmount.fromRawAmount(Ether.onChain(chainId), JSBI.BigInt(balance.value.toString()))
  }, [balance, chainId])
}

/**
 * Returns a map of the given addresses to their eventually consistent ETH balances.
 * Legacy implementation using multicall
 */
export function useETHBalances(uncheckedAddresses?: (string | undefined)[]): {
  [address: string]: CurrencyAmount<Currency> | undefined
} {
  const { chainId } = useActiveWeb3React()
  const multicallContract = useMulticall2Contract()

  const addresses: string[] = useMemo(
    () =>
      uncheckedAddresses
        ? uncheckedAddresses
            .map(isAddress)
            .filter((a): a is string => a !== false)
            .sort()
        : [],
    [uncheckedAddresses]
  )

  const results = useSingleContractMultipleData(
    multicallContract,
    'getEthBalance',
    addresses.map((address) => [address])
  )

  return useMemo(
    () =>
      addresses.reduce<{ [address: string]: CurrencyAmount<Currency> }>((memo, address, i) => {
        const value = results?.[i]?.result?.[0]
        if (value && chainId)
          memo[address] = CurrencyAmount.fromRawAmount(Ether.onChain(chainId), JSBI.BigInt(value.toString()))
        return memo
      }, {}),
    [addresses, chainId, results]
  )
}

export function useSimpleTokenBalanceWithLoading(
  account?: string | null,
  currency?: Currency | null,
  tokenAddress?: string
) {
  const tokenContract = useTokenContract(tokenAddress)
  const balance = useSingleCallResult(tokenContract, 'balanceOf', [account ?? undefined])
  const value = balance?.result
  const amount = value && currency ? CurrencyAmount.fromRawAmount(currency, JSBI.BigInt(value.toString())) : undefined
  return { amount, loading: balance?.loading }
}

/**
 * Returns a map of token addresses to their eventually consistent token balances for a single account.
 * Using Wagmi/Viem for better performance and modern API
 */
export function useTokenBalancesWithLoadingIndicator(
  address?: string,
  tokens?: (Token | undefined)[]
): [{ [tokenAddress: string]: CurrencyAmount<Token> | undefined }, boolean] {
  const validatedTokens: Token[] = useMemo(
    () => tokens?.filter((t?: Token): t is Token => isAddress(t?.address) !== false) ?? [],
    [tokens]
  )

  // Prepare contracts for useReadContracts
  const contracts = useMemo(
    () =>
      validatedTokens.map((token) => ({
        address: token.address as `0x${string}`,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [address as `0x${string}`],
      })),
    [validatedTokens, address]
  )

  // @ts-ignore
  const { data: balances, isLoading } = useReadContracts({
    contracts,
    query: {
      enabled: Boolean(address && validatedTokens.length > 0),
      staleTime: 30_000, // 30 seconds
      gcTime: 5 * 60 * 1000, // 5 minutes
    },
  })

  const tokenBalanceMap = useMemo(() => {
    if (!address || !validatedTokens.length || !balances) return {}

    return validatedTokens.reduce<{ [tokenAddress: string]: CurrencyAmount<Token> | undefined }>((memo, token, i) => {
      const result = balances[i]
      if (result?.status === 'success' && result.result !== undefined) {
        const amount = JSBI.BigInt(result.result.toString())
        memo[token.address] = CurrencyAmount.fromRawAmount(token, amount)
      } else if (result?.status === 'failure') {
        console.warn(`Failed to fetch balance for ${token.symbol} (${token.address}):`, result.error)
      }
      return memo
    }, {})
  }, [address, validatedTokens, balances])

  return [tokenBalanceMap, isLoading]
}

export function useTokenBalances(
  address?: string,
  tokens?: (Token | undefined)[]
): { [tokenAddress: string]: CurrencyAmount<Token> | undefined } {
  return useTokenBalancesWithLoadingIndicator(address, tokens)[0]
}

// get the balance for a single token/account combo

export function useTokenBalancesLegacy(
  address?: string,
  tokens?: (Token | undefined)[]
): { [tokenAddress: string]: CurrencyAmount<Token> | undefined } {
  // Legacy implementation using multicall
  return useTokenBalancesWithLoadingIndicator(address, tokens)[0]
}

// get the balance for a single token/account combo
export function useTokenBalance(account?: string, token?: Token): CurrencyAmount<Token> | undefined {
  const tokenBalances = useTokenBalances(account, [token])
  if (!token) return undefined
  return tokenBalances[token.address]
}

export function useCurrencyBalances(
  account?: string,
  currencies?: (Currency | undefined)[]
): (CurrencyAmount<Currency> | undefined)[] {
  const tokens = useMemo(
    () => currencies?.filter((currency): currency is Token => currency?.isToken ?? false) ?? [],
    [currencies]
  )

  const tokenBalances = useTokenBalances(account, tokens)
  const containsETH: boolean = useMemo(() => currencies?.some((currency) => currency?.isNative) ?? false, [currencies])

  // Use modern ETH balance for single account
  const ethBalance = useETHBalance(containsETH ? account : undefined)
  const ethBalances = useMemo(() => (account && ethBalance ? { [account]: ethBalance } : {}), [account, ethBalance])

  return useMemo(
    () =>
      currencies?.map((currency) => {
        if (!account || !currency) return undefined
        if (currency?.isToken) return tokenBalances[currency.address]
        if (currency.isNative) return ethBalances[account]
        return undefined
      }) ?? [],
    [account, currencies, ethBalances, tokenBalances]
  )
}

export function useCurrencyBalance(account?: string, currency?: Currency): CurrencyAmount<Currency> | undefined {
  // For single currency, use optimized hooks directly
  const isToken = currency?.isToken
  const isNative = currency?.isNative

  const tokenBalance = useTokenBalance(account, isToken ? (currency as Token) : undefined)
  const ethBalance = useETHBalance(isNative ? account : undefined)

  return useMemo(() => {
    if (!account || !currency) return undefined
    if (isToken) return tokenBalance
    if (isNative) return ethBalance
    return undefined
  }, [account, currency, isToken, isNative, tokenBalance, ethBalance])
}

// mimics useAllBalances
export function useAllTokenBalances(): { [tokenAddress: string]: CurrencyAmount<Token> | undefined } {
  const { account } = useActiveWeb3React()
  const allTokens = useAllTokens()
  const allTokensArray = useMemo(() => Object.values(allTokens ?? {}), [allTokens])
  const balances = useTokenBalances(account ?? undefined, allTokensArray)
  return balances ?? {}
}

export const useWalletState = () => {
  const walletState = useSelector((state: AppState) => state.wallet)

  return walletState
}
