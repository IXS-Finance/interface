import usePoolQuery from './usePoolQuery'
import { Pool } from 'services/pool/types'
import usePoolDecorationQuery from 'hooks/dex-v2/queries/usePoolDecorationQuery'

export function usePool(poolId: string) {
  const poolQuery = usePoolQuery(poolId)
  const initialPool: Pool | undefined = poolQuery.data
  // Updates onchain data and returns new pool object.
  const { data: decoratedPool, refetch: refetchOnchainPoolData } = usePoolDecorationQuery(initialPool)
  // Is the initial pool query loading?
  const isLoadingPool: boolean = poolQuery.isLoading || !initialPool
  const pool: Pool | undefined =
    decoratedPool || initialPool ? { ...((decoratedPool || initialPool) as Pool) } : undefined

  return {
    pool,
    isLoadingPool,
    refetchOnchainPoolData,
  }
}
