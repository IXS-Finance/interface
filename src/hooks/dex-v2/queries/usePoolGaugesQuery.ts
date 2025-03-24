import { useMemo } from 'react'
import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import QUERY_KEYS from 'constants/dexV2/queryKeys'
import { subgraphRequest } from 'lib/utils/subgraph'
import { configService } from 'services/config/config.service'

export type PoolGauges = {
  __name: 'PoolGauges'
  pool: {
    preferentialGauge: {
      id: string | null
    }
    gauges: {
      id: string
      relativeWeightCap: string
    }[]
  }
  liquidityGauges: { id: string }[]
}

export default function usePoolGaugesQuery(poolAddress?: string, options: any = {}) {
  // Create the query key using useMemo to recalc only when poolAddress changes.
  const queryKey = QUERY_KEYS.Pool.Gauges(poolAddress)

  // Enabled flag: only enable if a valid poolAddress is provided.
  const enabled = Boolean(poolAddress)

  // Build the subgraph query. In Vue, this was a computed property.
  const subgraphQuery = useMemo(
    () => ({
      __name: 'PoolGauges',
      pool: {
        __args: {
          id: poolAddress?.toLowerCase(),
        },
        preferentialGauge: {
          id: true,
        },
        gauges: {
          id: true,
          relativeWeightCap: true,
        },
      },
      liquidityGauges: {
        __args: {
          where: {
            poolAddress: poolAddress?.toLowerCase(),
          },
        },
        id: true,
      },
    }),
    [poolAddress]
  )

  // Query function that makes the subgraph request.
  const queryFn = async () => {
    try {
      return await subgraphRequest<PoolGauges>({
        url: configService.network.subgraphs.gauge,
        query: subgraphQuery,
      })
    } catch (error) {
      console.error(`Failed to fetch pool gauge for pool: ${poolAddress}`, { cause: error })
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
