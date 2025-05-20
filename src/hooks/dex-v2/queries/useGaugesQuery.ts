import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import QUERY_KEYS from 'constants/dexV2/queryKeys'
import { gaugesSubgraphService } from 'services/balancer/gauges/gauges-subgraph.service'
import { SubgraphGauge } from 'services/dexV2/gauges/types'

/**
 * TYPES
 */
type QueryResponse = SubgraphGauge[]
type QueryOptions = Omit<UseQueryOptions<QueryResponse>, 'queryKey'>

/**s
 * @summary Fetches guages list from subgraph
 */
export default function useGaugesQuery(options: QueryOptions = {}) {
  /**
   * QUERY KEY
   */
  const queryKey = QUERY_KEYS.Gauges.All.Static()

  /**
   * QUERY FUNCTION
   */
  const queryFn = async () => {
    try {
      return await gaugesSubgraphService.gauges.get()
    } catch (error) {
      console.error('Failed to fetch gauges', error)
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
