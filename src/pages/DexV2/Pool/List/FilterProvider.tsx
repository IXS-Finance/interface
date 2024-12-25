import { createContext, PropsWithChildren, useContext, useState } from "react"
import { PoolTypes } from "./constants"
import { CHAINS } from "components/Web3Provider/constants"

export type UsePoolFilterResult = ReturnType<typeof _usePoolFilter>
export const PoolFilterContext = createContext<UsePoolFilterResult | null>(null)

export const typeFilters = [
  { title: 'All', value: PoolTypes.all },
  { title: 'RWA', value: PoolTypes.rwa },
  { title: 'Crypto', value: PoolTypes.crypto },
]

export interface OrderConfig {
  totalLiquidity?: string | null
  totalSwapVolume?: string | null
  type?: string | null
  apr?: string | null
}

export function _usePoolFilter() {
  const [filters, setFilters] = useState({
    type: typeFilters[0].value,
    network: CHAINS[0].id,
  })

  const [order, setOrder] = useState<OrderConfig>({})

  const [page, setPage] = useState(0)

  return {
    filters,
    setFilters,
    order,
    setOrder,
    page,
    setPage,
  }
}

export function FilterProvider({
  children,
}: PropsWithChildren) {
  const value = _usePoolFilter()
  return <PoolFilterContext.Provider value={value}>{children}</PoolFilterContext.Provider>
}

export const usePoolFilter = (): UsePoolFilterResult => useContext(PoolFilterContext) as UsePoolFilterResult
