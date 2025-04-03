import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'

import QUERY_KEYS from 'constants/dexV2/queryKeys'
import { subgraphRequest } from 'lib/utils/subgraph'
import { configService } from 'services/config/config.service'
import useWeb3 from '../useWeb3'

/**
 * TYPES
 */
export type PoolsHasGauge = {
  name: string
  id: string
  address: string
  totalLiquidity: string
  tokensList: string[]
  gauge: {
    id: string
    address: string
  }
}

/**
 * usePoolsHasGaugeQuery
 *
 * Fetches all pools has gauge
 *
 * @returns An object from react-query with the gauge shares data.
 */
export default function usePoolsHasGaugeQuery() {
  const { isWalletReady, chainId } = useWeb3()

  const queryKey = QUERY_KEYS.Pools.PoolsHasGauge(chainId)

  // "Computed" enabled flag; note that in React we assume isWalletReady is a boolean value.
  const enabled = !!configService.network.subgraphs.gauge && isWalletReady

  // useMemo to compute query arguments
  const queryArgs = {
    where: {
      totalLiquidity_gt: '1',
      gauge_not: null,
    },
  }

  // useMemo to build the subgraph query
  const subgraphQuery = useMemo(
    () => ({
      __name: 'pools',
      pools: {
        __args: queryArgs,
        id: true,
        address: true,
        totalLiquidity: true,
        name: true,
        tokensList: true,
        gauge: {
          id: true,
          address: true,
        },
      },
    }),
    [queryArgs]
  )

  // QUERY FUNCTION
  const queryFn = async () => {
    try {
      const poolsHasGauge = await subgraphRequest<any>({
        url: configService.network.subgraphs.gauge,
        query: subgraphQuery,
      })

      return poolsHasGauge
    } catch (error) {
      console.error('Failed to fetch pools has gauge', { cause: error })
      throw error
    }
  }

  // QUERY OPTIONS: using a plain object instead of reactive()
  const queryOptions = {
    enabled,
    refetchOnWindowFocus: false,
  }

  return useQuery({ queryKey, queryFn, ...queryOptions })
}
