import { useMemo } from 'react'
import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import QUERY_KEYS from 'constants/dexV2/queryKeys'
import { subgraphRequest } from 'lib/utils/subgraph'
import { configService } from 'services/config/config.service'
import { PoolType } from 'pages/DexV2/Dashboard/graphql/dashboard'

export type PoolGauge = {
  __name: 'PoolGauge'
  pool: {
    id: string
    address: string
    poolType: PoolType
    poolTypeVersion: number
    gauge: {
      id: string
      address: string
    }
  }
}

export default function usePoolGaugeQuery(poolId?: string, options: any = {}) {
  // Create the query key using useMemo to recalc only when poolAddress changes.
  const queryKey = QUERY_KEYS.Pool.Gauge(poolId)

  // Enabled flag: only enable if a valid poolAddress is provided.
  const enabled = Boolean(poolId)

  // Build the subgraph query. In Vue, this was a computed property.
  const subgraphQuery = {
    __name: 'PoolGauge',
    pool: {
      __args: {
        id: poolId?.toLowerCase(),
      },
      id: true,
      address: true,
      poolType: true,
      poolTypeVersion: true,
      gauge: {
        id: true,
        address: true,
      },
    },
  }

  // Query function that makes the subgraph request.
  const queryFn = async () => {
    try {
      const res = await subgraphRequest<PoolGauge>({
        url: configService.network.subgraphs.gauge,
        query: subgraphQuery,
      })

      return res
    } catch (error) {
      console.error(`Failed to fetch pool gauge for pool: ${poolId}`, { cause: error })
      throw error
    }
  }

  const queryOptionsFinal = {
    enabled,
    refetchOnWindowFocus: false,
    ...options,
  }

  return useQuery({ queryKey, queryFn, ...queryOptionsFinal })
}
