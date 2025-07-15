import { bnum } from '.'
import { SubgraphPoolDayData } from 'services/balancer/poolDayDatas/types'
import { Pool } from 'services/pool/types'
import useEmissionApr from 'hooks/dex-v2/useEmissionApr'

export function getPoolAprValue(pool: Pool, poolDayDatas?: SubgraphPoolDayData[]): string {
  const emissionAprValue = useEmissionApr(pool)

  /**
   * Calculate the average daily swap fees in USD for the pool
   */
  const averageDailySwaps = !poolDayDatas
    ? '0'
    : poolDayDatas.reduce((acc, day) => acc.plus(day.dailySwapFeesUSD || '0'), bnum(0)).div(poolDayDatas.length)
  const daysPerYear = 365
  const aprValue =
    pool.totalLiquidity && pool.totalLiquidity !== '0'
      ? bnum(averageDailySwaps).times(daysPerYear).div(pool.totalLiquidity).plus(emissionAprValue).toString()
      : '0'

  return aprValue
}
