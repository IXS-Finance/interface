import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'

import QUERY_KEYS from 'constants/dexV2/queryKeys'
import { subgraphRequest } from 'lib/utils/subgraph'
import { configService } from 'services/config/config.service'
import useWeb3 from '../useWeb3'

/**
 * TYPES
 */
export type Pool = {
  name: string
  id: string
  address: string
  createTime: number
  gauge: {
    id: string
    address: string
  }
}

/**
 * useAllPoolsQuery
 *
 * Fetches all pools with gauges from the subgraph.
 *
 * @returns An object from react-query containing the pools data
 */
export default function useAllPoolsQuery() {
  const { isWalletReady, chainId } = useWeb3()

  const queryKey = QUERY_KEYS.Pools.AllPoolsNoFilter(chainId)

  const enabled = !!configService.network.subgraph && isWalletReady

  // useMemo to build the subgraph query to fetch all pools
  const subgraphQuery = useMemo(
    () => ({
      __name: 'pools',
      pools: {
        id: true,
        address: true,
        createTime: true,
        name: true,
        gauge: {
          id: true,
          address: true,
        },
      },
    }),
    []
  )

  const queryFn = async () => {
    try {
      const pools = await subgraphRequest<any>({
        url: configService.network.subgraph,
        query: subgraphQuery,
      })

      return pools
    } catch (error) {
      console.error('Failed to fetch all pools', { cause: error })
      throw error
    }
  }

  const queryOptions = {
    enabled,
    refetchOnWindowFocus: false,
  }

  return useQuery({ queryKey, queryFn, ...queryOptions })
}
