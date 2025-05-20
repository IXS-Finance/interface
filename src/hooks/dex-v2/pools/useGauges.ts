import { useMemo } from 'react'
import useGaugesQuery from '../queries/useGaugesQuery'
import _flatten from 'lodash/flatten'
import { SubgraphGauge } from 'services/dexV2/gauges/types'

export default function useGauges() {
  const gaugesQuery = useGaugesQuery()

  const gauges = gaugesQuery.data

  const gaugesByPoolAddress = useMemo(() => {
    const result = {} as Record<string, SubgraphGauge>
    if (gauges) {
      gauges.forEach((gauge) => {
        const poolAddress = gauge.pool.address
        if (!result[poolAddress]) {
          result[poolAddress] = gauge
        }
      })
    }
    return result
  }, [gauges?.map((gauge) => gauge.id)?.join('')])

  function gaugeFor(poolAddress: string): undefined | SubgraphGauge {
    return gaugesByPoolAddress[poolAddress]
  }

  return {
    gauges,
    isLoading: gaugesQuery.isLoading,
    isError: gaugesQuery.isError,
    isSuccess: gaugesQuery.isSuccess,
    error: gaugesQuery.error,
    gaugesByPoolAddress,
    gaugeFor,
  }
}
