import { useCallback, useMemo } from "react"
import { AbstractOrder } from "state/launchpad/types"
import { useSubgraphQueryLegacy } from "hooks/useSubgraphQuery";
import { SUBGRAPH_QUERY } from "constants/subgraph";
import { usePoolFilter } from "./FilterProvider";
import { adminOffset } from "state/admin/constants";

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

  const variables = useMemo(() => ({
    orderBy,
    orderDirection,
    first: adminOffset, // equal to pageSize
    skip: page * adminOffset,
  }), [orderBy, orderDirection, adminOffset, page])

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
          where: { totalLiquidity_gt: "0" },
          orderBy: $orderBy,
          orderDirection: $orderDirection,
          skip: $skip,
          first: $first,
        ) {
          address
          id
          totalSwapVolume
          totalLiquidity
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
