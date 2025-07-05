import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import QUERY_KEYS from 'constants/dexV2/queryKeys'
import { balancerSubgraphService } from 'services/balancer/subgraph/balancer-subgraph.service'
import { poolsStoreService } from 'services/pool/pools-store.service'
import { PoolSnapshots } from 'services/pool/types'

import useNetwork from '../useNetwork'
import usePoolQuery from './usePoolQuery'
import { oneDayInMs } from '../useTime'

/**
 * HELPERS
 */
export default function usePoolSnapshotsQuery(id: string, days?: number, options: any = {}) {
  /**
   * @description
   * If pool is already downloaded, we can use it instantly
   * it may be if user came to pool page from home page
   */
  const storedPool = poolsStoreService.findPool(id)

  /**
   * QUERY DEPENDENCIES
   */
  const { networkId } = useNetwork()
  const poolQuery = usePoolQuery(id)

  /**
   * COMPUTED
   */
  const pool = useMemo(() => poolQuery.data, [JSON.stringify(poolQuery.data)])
  const enabled = useMemo(() => !!pool?.id || !!storedPool, [JSON.stringify(pool), storedPool])

  /**
   * QUERY INPUTS
   */
  const queryKey = QUERY_KEYS.Pools.Snapshot(networkId, id)

  const queryFn = async () => {
    if (!pool && !storedPool) throw new Error('No pool')

    const createTime = storedPool?.createTime || pool?.createTime || 0

    const nowTimestap = new Date().getTime()
    const daysInMs = days ? days * oneDayInMs : oneDayInMs
    const thousandDaysInMs = 1000 * oneDayInMs

    let timestamp = Math.floor((nowTimestap - (days ? daysInMs : thousandDaysInMs)) / 1000)

    if (timestamp < createTime) {
      timestamp = createTime
    }

    return await balancerSubgraphService.poolSnapshots.get({
      where: {
        pool: id.toLowerCase(),
        timestamp_gt: timestamp,
      },
    })
  }

  const queryOptions = {
    enabled,
    ...options,
  }

  return useQuery<PoolSnapshots>({
    queryKey,
    queryFn,
    ...queryOptions,
  })
}
