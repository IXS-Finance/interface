import { useQuery, QueryObserverOptions } from '@tanstack/react-query'
import { AprBreakdown } from '@ixswap1/dex-v2-sdk'

import QUERY_KEYS from 'constants/dexV2/queryKeys'
import { poolsStoreService } from 'services/pool/pools-store.service'
import { Pool } from 'services/pool/types'

import useNetwork from '../useNetwork'
import usePoolQuery from './usePoolQuery'
import { getBalancerSDK } from 'dependencies/balancer-sdk'
import { useMemo } from 'react'

export default function usePoolAprQuery(id: string, options: any = {}) {
  /**
   * @description
   * If pool is already downloaded, we can use it instantly
   * it may be if user came to pool page from home page
   */
  const storedPool = poolsStoreService.findPool(id)

  /**
   * COMPOSABLES
   */
  const poolQuery = usePoolQuery(id)

  /**
   * QUERY DEPENDENCIES
   */
  const { networkId } = useNetwork()

  /**
   * COMPUTED
   */
  const pool = useMemo(() => poolQuery.data, [JSON.stringify(poolQuery.data)])
  const enabled = useMemo(() => !!pool?.id || !!storedPool, [JSON.stringify(pool?.id), JSON.stringify(storedPool)])

  /**
   * QUERY INPUTS
   */
  const queryKey = QUERY_KEYS.Pools.APR(networkId, id)

  const queryFn = async (): Promise<AprBreakdown> => {
    let _pool: Pool
    if (storedPool) {
      _pool = storedPool
    } else if (pool) {
      // copy computed pool to avoid mutation warnings
      _pool = { ...pool, tokens: [...pool.tokens] }
    } else {
      throw new Error('No pool')
    }

    if (_pool?.apr) {
      return _pool.apr
    }

    _pool.chainId = networkId

    const apr = await getBalancerSDK().pools.apr(_pool)

    return apr
  }
  const queryOptions = {
    enabled,
    ...options,
  }
  return useQuery<AprBreakdown>({ queryKey, queryFn, ...queryOptions })
}
