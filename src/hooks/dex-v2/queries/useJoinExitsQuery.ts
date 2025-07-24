import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import QUERY_KEYS from 'constants/dexV2/queryKeys'
import { SubgraphJoinExit } from 'services/balancer/pools/joinExits/types'
import { balancerSubgraphService } from 'services/balancer/subgraph/balancer-subgraph.service'

/**
 * TYPES
 */
type Args = {
  account: string
}
type QueryResponse = SubgraphJoinExit[]
type QueryOptions = Omit<UseQueryOptions<QueryResponse>, 'queryKey'>

export default function useJoinExitsQuery(options: QueryOptions = {}, args: Args) {
  /**
   * QUERY KEY
   */
  const queryKey = QUERY_KEYS.Pools.JoinExits.Static(args.account)

  /**
   * QUERY FUNCTION
   */
  const queryFn = async () => {
    try {
      return await balancerSubgraphService.joinExits.get({
        where: {
          user: args.account,
          type: 'Join',
        },
      })
    } catch (error) {
      console.error('Failed to fetch JoinExits', error)
      return []
    }
  }

  /**
   * QUERY OPTIONS
   */
  const queryOptions = {
    ...options,
    queryKey,
  }

  return useQuery<QueryResponse>({ queryFn, ...queryOptions })
}
