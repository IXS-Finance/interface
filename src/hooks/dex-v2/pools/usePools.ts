// usePools.ts
import { useEffect, useMemo } from 'react'
import { flatten } from 'lodash'

import { isQueryLoading } from 'hooks/dex-v2/queries/useQueryHelpers'
import { tokenTreeLeafs } from '../usePoolHelpers'
import { Pool, PoolType } from 'services/pool/types'
import { PoolAttributeFilter, PoolFilterOptions } from 'types/pools'
import usePoolsQuery from '../queries/usePoolsQuery'
import { useTokens } from 'state/dexV2/tokens/hooks/useTokens'

export type UsePoolsProps = {
  filterTokens?: string[]
  sortField?: string
  poolIds?: string[]
  poolTypes?: PoolType[]
  poolAttributes?: PoolAttributeFilter[]
}

export default function usePools({
  filterTokens = [],
  sortField = 'totalLiquidity',
  poolIds = [],
  poolTypes = [],
  poolAttributes = [],
}: UsePoolsProps = {}) {
  // Create filter options object – similar to Vue's computed property.
  // @ts-ignore
  const filterOptions: PoolFilterOptions = useMemo(
    () => ({
      tokens: filterTokens,
      sortField,
      poolIds,
      poolTypes,
      poolAttributes,
    }),
    [filterTokens, sortField, poolIds, poolTypes, poolAttributes]
  )

  // Get pools query result from the custom hook.
  const poolsQuery = usePoolsQuery(
    filterOptions,
    // @ts-ignore
    { enabled: true, refetchOnWindowFocus: false, placeholderData: true },
    false
  )

  // Access token-related methods.
  const { injectTokens } = useTokens()

  // Compute the flattened list of pools.
  const pools: Pool[] = useMemo(() => {
    const paginatedPools = poolsQuery.data as any

    if (paginatedPools !== true) {
      return paginatedPools ? flatten(paginatedPools.pages.map((page: any) => page.pools)) : []
    }

    return []
  }, [poolsQuery.data])

  // Loading status.
  const isLoading = useMemo(() => isQueryLoading(poolsQuery), [poolsQuery])

  // These are assumed to be provided by your query hook.
  const hasNextPage = poolsQuery.hasNextPage
  const isFetchingNextPage = poolsQuery.isFetchingNextPage

  // Method to load more pools.
  const loadMorePools = () => {
    poolsQuery.fetchNextPage()
  }

  // Mimic a Vue watcher: whenever `pools` changes, extract tokens and inject them.
  useEffect(() => {
    const tokens = flatten(pools.map((pool) => [...pool.tokensList, ...tokenTreeLeafs(pool.tokens), pool.address]))
    injectTokens(tokens)
  }, [pools, injectTokens])

  return {
    pools,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    loadMorePools,
  }
}
