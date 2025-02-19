import { useQuery } from '@tanstack/react-query'
import QUERY_KEYS from 'constants/dexV2/queryKeys'
import useNetwork from '../useNetwork'
import { getApi } from 'dependencies/balancer-api'
import { GqlTokenPrice } from 'services/api/graphql/generated/api-types'
import { oneMinInMs } from '../useTime'
import { getAddress } from '@ethersproject/address'

/**
 * TYPES
 */
export type TokenPrices = { [address: string]: number }
type QueryResponse = TokenPrices

/**
 * Fetches token prices for all provided addresses.
 */
export default function useTokenPricesQuery(pricesToInject: TokenPrices = {}, options: any = {}) {
  const { networkId } = useNetwork()
  const queryKey = QUERY_KEYS.Tokens.Prices(networkId, pricesToInject)

  function priceArrayToMap(prices: GqlTokenPrice[]): TokenPrices {
    return prices.reduce((obj: any, item: any) => ((obj[getAddress(item.address)] = item.price), obj), {})
  }

  function injectCustomTokens(prices: TokenPrices, pricesToInject: TokenPrices): TokenPrices {
    for (const address of Object.keys(pricesToInject)) {
      prices[address] = pricesToInject[address]
    }
    return prices
  }

  const api = getApi()
  const queryFn = async () => {
    // const { prices } = await api.GetCurrentTokenPrices()
    const prices: any = []
    let pricesMap = priceArrayToMap(prices as GqlTokenPrice[])
    pricesMap = injectCustomTokens(pricesMap, pricesToInject)
    console.log('Fetching', Object.values(prices).length, 'prices')
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
