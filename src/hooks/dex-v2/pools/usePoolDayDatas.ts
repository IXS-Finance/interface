import { useMemo } from 'react'
import usePoolDayDatasQuery from '../queries/usePoolDayDatasQuery'
import { SubgraphPoolDayData } from 'services/balancer/poolDayDatas/types'

export default function usePoolDayDatas(poolAddresses: string[]) {
  const { data, isLoading } = usePoolDayDatasQuery({}, { poolAddresses })

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
