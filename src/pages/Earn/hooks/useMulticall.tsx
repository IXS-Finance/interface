import { multicall } from '@wagmi/core'
import { useQuery } from '@tanstack/react-query'

import { wagmiConfig } from 'components/Web3Provider'

const getMulticallData = async (calls: any[]) => {
  const results = await multicall(wagmiConfig, { contracts: calls })
  return results
}

export const useMulticall = (chainId: any, calls: any[], options?: any) => {
  return useQuery({
    queryKey: ['multicall', calls, chainId],
    queryFn: () => getMulticallData(calls),
    ...options,
  })
}
