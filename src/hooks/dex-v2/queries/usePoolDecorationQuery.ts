import { cloneDeep } from 'lodash'

import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { Pool } from 'services/pool/types'
import QUERY_KEYS from 'constants/dexV2/queryKeys'
import { PoolDecorator } from 'services/pool/decorators/pool.decorator'
import { useTokens } from 'state/dexV2/tokens/hooks/useTokens'
import { useMemo } from 'react'

/**
 * TYPES
 */
type QueryResponse = Pool | undefined

/**
 * Given a pool, uses PoolDecorator to fetch onchain attributes such as token
 * balances and totalSupply to make sure they're as up to date as possible and
 * returns a decorated pool object with those live values.
 */
export default function usePoolDecorationQuery(pool: Pool | undefined, options: any = {}) {
  /**
   * COMPOSABLES
   */
  const { tokens } = useTokens()

  /**
   * COMPUTED
   */
  const poolId = useMemo((): string | undefined => pool?.id, [JSON.stringify(pool)])

  const queryKey = QUERY_KEYS.Pool.Decorated(poolId)

  const enabled = useMemo((): boolean => !!pool, [JSON.stringify(pool)])

  /**
   * QUERY FUNCTION
   */
  const queryFn = async () => {
    if (!pool) return undefined
    const _pool = cloneDeep(pool)
    const poolDecorator = new PoolDecorator([_pool])
    // Decorate pool updating only the onchain attributes.
    const [decoratedPool] = await poolDecorator.decorate(tokens, false)
    return decoratedPool
  }

  /**
   * QUERY OPTIONS
   */
  const queryOptions = {
    enabled,
    ...options,
  }

  return useQuery<QueryResponse>({ queryKey, queryFn, ...queryOptions })
}
