import { useMemo } from 'react'

import usePoolQuery from './usePoolQuery'
import { Pool } from 'services/pool/types'
import usePoolDecorationQuery from 'hooks/dex-v2/queries/usePoolDecorationQuery'
import { isQueryLoading } from 'hooks/dex-v2/queries/useQueryHelpers'

export function usePool(poolId: string) {
  const poolQuery = usePoolQuery(poolId)

  const initialPool = useMemo((): Pool | undefined => {
    return poolQuery.data
  }, [JSON.stringify(poolQuery.data)])

  // Updates onchain data and returns new pool object.
  const { data: decoratedPool, refetch: refetchOnchainPoolData } = usePoolDecorationQuery(initialPool)

  // Is the initial pool query loading?
  const isLoadingPool = useMemo(
    (): boolean => isQueryLoading(poolQuery) || !initialPool,
    [JSON.stringify(poolQuery), JSON.stringify(initialPool)]
  )

  const pool = useMemo((): Pool | undefined => {
    const _pool = decoratedPool || initialPool
    if (!_pool) return undefined

    return {
      ..._pool,
    }
  }, [JSON.stringify(decoratedPool), JSON.stringify(initialPool)])

  console.log(poolQuery)
  return {
    pool,
    isLoadingPool,
    refetchOnchainPoolData,
  }
}
