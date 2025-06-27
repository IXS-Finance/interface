import { Pool } from '@ixswap1/dex-v2-sdk'

export type QueryArgs = Record<string, any>
export type QueryAttrs = Record<string, any>
export type QueryBuilder = (args?: QueryArgs, attrs?: QueryAttrs, name?: string) => Record<string, any>

export type QueryFilter = Record<string, any>

export interface SubgraphPoolDayData {
  id: string
  dailyLiquidity: string
  dailySwapFeesUSD: string
  dailySwapVolumeUSD: string
  dateStartTime: number
  pool: Pool
}
