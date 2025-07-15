import { merge } from 'lodash'

const POOL_DATA_DAYS_LOOKBACK = 8
const today = new Date()

const defaultArgs = {
  where: { dateStartTime_gte: Math.floor(today.setDate(today.getDate() - POOL_DATA_DAYS_LOOKBACK) / 1000) },
  orderDirection: 'desc',
  orderBy: 'dateStartTime',
}

const defaultAttrs = {
  id: true,
  dailyLiquidity: true,
  dailySwapFeesUSD: true,
  dailySwapVolumeUSD: true,
  dateStartTime: true,
  pool: {
    address: true,
  },
}

export const poolDayDatasQueryBuilder = (args = {}, attrs = {}, name: string | undefined = undefined) => ({
  __name: name,
  poolDayDatas: {
    __args: merge({}, defaultArgs, args),
    ...merge({}, defaultAttrs, attrs),
  },
})
