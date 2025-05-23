import useGaugesQuery from '../queries/useGaugesQuery'
import { SubgraphGauge } from 'services/dexV2/gauges/types'

export default function useGauges() {
  const { data: gauges, isLoading, isError, isSuccess, error, refetch } = useGaugesQuery()

  const gaugesByPoolAddress = {} as Record<string, SubgraphGauge>
  if (gauges) {
    gauges.forEach((gauge) => {
      const poolAddress = gauge.pool.address
      if (!gaugesByPoolAddress[poolAddress]) {
        gaugesByPoolAddress[poolAddress] = gauge
      }
    })
  }

  const gaugeFor = (poolAddress: string): undefined | SubgraphGauge => {
    return gaugesByPoolAddress[poolAddress]
  }

  return {
    gauges,
    isLoading,
    isError,
    isSuccess,
    error,
    gaugesByPoolAddress,
    gaugeFor,
    refetch,
  }
}
