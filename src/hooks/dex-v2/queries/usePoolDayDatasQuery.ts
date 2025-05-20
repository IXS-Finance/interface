import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import QUERY_KEYS from 'constants/dexV2/queryKeys'
import { poolDayDatasSubgraphService } from 'services/balancer/poolDayDatas/poolDayDatas.service'
import { SubgraphPoolDayData } from 'services/balancer/poolDayDatas/types'

/**
 * TYPES
 */
type Args = {
  poolId: string
}
type QueryResponse = SubgraphPoolDayData[]
type QueryOptions = Omit<UseQueryOptions<QueryResponse>, 'queryKey'>

/**s
 * @summary Fetches last 7 days records of daily swap fee from subgraph for a pool Id
 */
export default function usePoolDayDatasQuery(options: QueryOptions = {}, args: Args) {
  /**
   * QUERY KEY
   */
  const queryKey = QUERY_KEYS.PoolDayDatas.All.Static()

  /**
   * QUERY FUNCTION
   */
  const queryFn = async () => {
    try {
      return await poolDayDatasSubgraphService.poolDayDatas.get({
        where: {
          pool_: {
            id: args.poolId,
          },
        },
      })
    } catch (error) {
      console.error('Failed to fetch poolDayDatas', error)
      return []
    }
  }

  /**
   * QUERY OPTIONS
   */
  const queryOptions = {
    enabled: true,
    ...options,
    queryKey,
  }

  return useQuery<QueryResponse>({ queryFn, ...queryOptions })
}
