import { useCallback, useMemo } from 'react'
import { AbstractOrder } from 'state/launchpad/types'
import { useSubgraphQuery, useSubgraphQueryLegacy } from 'hooks/useSubgraphQuery'
import { SUBGRAPH_QUERY } from 'constants/subgraph'
import { usePoolFilter } from './FilterProvider'
import { adminOffset } from 'state/admin/constants'

export const useOnChangeOrder = (
  order: AbstractOrder,
  setOrder: (foo: AbstractOrder) => void,
  setPage?: (foo: number) => void
) => {
  const onChangeOrder = useCallback(
    (key: string) => {
      const current = Object.keys(order)[0]
      if (!current || current !== key) {
        setOrder({ [key]: 'ASC' })
      }
      if (current === key) {
        const value = Object.values(order)[0]
        const manner = !value ? 'ASC' : value === 'ASC' ? 'DESC' : null

        setOrder({ [current]: manner })
      }
      if (setPage) setPage(1)
    },
    [order, setOrder, setPage]
  )

  return onChangeOrder
}

export enum PageModal {
  NETWORK_SELECTOR,
}

export const usePoolList = () => {
  const { order, filters, page } = usePoolFilter()

  const orderBy = Object.keys(order)[0]
  const orderDirection = Object.values(order)[0]?.toLowerCase()

  const variables = useMemo(
    () => ({
      orderBy,
      orderDirection,
      first: adminOffset, // equal to pageSize
      skip: page * adminOffset,
    }),
    [orderBy, orderDirection, adminOffset, page]
  )

  const subgraphData = useSubgraphQueryLegacy({
    feature: SUBGRAPH_QUERY.POOLS,
    chainId: filters.network,
    query: `
      query GetPools(
        $orderBy: String,
        $orderDirection: String,
        $skip: Int,
        $first: Int,
      ) {
        pools(
          orderBy: $orderBy,
          orderDirection: $orderDirection,
          skip: $skip,
          first: $first,
        ) {
          address
          id
          totalSwapVolume
          totalLiquidity
          tokensList
          tokens {
            address
            symbol
            weight
          }
        }
      }
    `,
    variables,
    autoPolling: true,
    pollingInterval: 20_000, // 20 seconds
  })

  return {
    pools: subgraphData?.pools,
  }
}

export type PoolToken = {
  poolId: {
    id: string
    address: string
  }
  token: {
    latestUSDPrice: string
  }
  balance: string
}

export const usePoolTokenList = (poolIds: string[]) => {
  const { filters } = usePoolFilter()
  const variables = useMemo(
    () => ({
      poolId_in: poolIds,
      first: adminOffset, // equal to pageSize
    }),
    [adminOffset]
  )

  const subgraphData = useSubgraphQuery({
    feature: SUBGRAPH_QUERY.POOLS,
    chainId: filters.network,
    queryKey: ['poolTokens', poolIds],
    query: `
      query GetPoolTokens($poolId_in: [String]) {
        poolTokens(
          where: {
            poolId_in: $poolId_in
          }
        ) {
          poolId {
            id
            address
          }
          token {
            latestUSDPrice
          }
          balance
        }
      }
    `,
    variables,
    refetchInterval: 20_000, // 20 seconds
    enabled: !!poolIds && poolIds.length > 0,
  })

  return {
    poolTokens: (subgraphData?.data as { data: { poolTokens: PoolToken[] } })?.data?.poolTokens || [],
  }
}
