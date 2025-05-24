import { useQuery } from '@tanstack/react-query'
import QUERY_KEYS from 'constants/dexV2/queryKeys'
import useNetwork from '../useNetwork'
import { oneMinInMs } from '../useTime'
import { getAddress } from '@ethersproject/address'
import apiService from 'services/apiService'
import { tokenPrice } from 'services/apiUrls'
import { TokenInfoMap, TokenPrice } from 'types/TokenList'

/**
 * TYPES
 */
export type TokenPrices = { [address: string]: number }
type QueryResponse = TokenPrices

/**
 * Fetches token prices for all provided addresses.
 */
export default function useTokenPricesQuery(pricesToInject: TokenPrices = {}, tokens: TokenInfoMap, options: any = {}) {
  const { networkId } = useNetwork()
  const queryKey = QUERY_KEYS.Tokens.Prices(networkId, pricesToInject)

  function priceArrayToMap(prices: TokenPrice[]): TokenPrices {
    return prices.reduce((obj: any, item: any) => ((obj[getAddress(item.address)] = item.price), obj), {})
  }

  function injectCustomTokens(prices: TokenPrices, pricesToInject: TokenPrices): TokenPrices {
    for (const address of Object.keys(pricesToInject)) {
      prices[address] = pricesToInject[address]
    }
    return prices
  }

  const queryFn = async () => {
    const { data: prices } = await apiService.post(tokenPrice.get, {
      addresses: Object.values(tokens).map((token) => ({
        networkId: token.chainId,
        address: token.address,
      })),
    })
    let pricesMap = priceArrayToMap(prices as TokenPrice[])
    pricesMap = injectCustomTokens(pricesMap, pricesToInject)
    return pricesMap
  }

  const queryOptions = {
    enabled: true,
    refetchInterval: oneMinInMs * 5,
    refetchOnWindowFocus: false,
    keepPreviousData: true,
    ...options,
  }
  return useQuery<QueryResponse>({ queryKey, queryFn, ...queryOptions })
}
