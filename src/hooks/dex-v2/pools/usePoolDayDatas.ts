import { useMemo } from 'react'
import usePoolDayDatasQuery from '../queries/usePoolDayDatasQuery'
import { SubgraphPoolDayData } from 'services/balancer/poolDayDatas/types'
import usePools from './usePools'

export default function usePoolDayDatas() {
  const { pools } = usePools()
  const poolAddresses = pools.map((pool) => pool.address)

  const { data, isLoading } = usePoolDayDatasQuery(
    {
      enabled: poolAddresses.length > 0,
    },
    { poolAddresses }
  )

  const poolDayDatas = useMemo(() => {
    return data?.reduce((acc: any, poolDayData: SubgraphPoolDayData) => {
      const poolAddress = poolDayData.pool.address
      if (!acc[poolAddress]) {
        acc[poolAddress] = []
      }
      acc[poolAddress].push(poolDayData)
      return acc
    }, {})
  }, [data?.map((poolDay) => poolDay.id).join(',')])

  function poolDayDatasFor(poolAddress: string): undefined | SubgraphPoolDayData[] {
    return poolDayDatas?.[poolAddress]
  }

  return {
    poolDayDatas: data,
    poolDayDatasFor,
    isLoading,
  }
}
