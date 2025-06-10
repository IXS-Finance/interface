import { multicall } from '@wagmi/core'
import { useQuery } from '@tanstack/react-query'

import { wagmiConfig } from 'components/Web3Provider'

const getMulticallData = async (calls: any[]) => {
  const results = await multicall(wagmiConfig, { contracts: calls })
  return results
}

export const useMulticall = (calls: any[], options?: any) => {
  return useQuery({
    queryKey: ['multicall', calls],
    queryFn: () => getMulticallData(calls),
    ...options,
  })
}
