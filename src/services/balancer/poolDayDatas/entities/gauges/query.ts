import { merge } from 'lodash'

const defaultArgs = {
  first: 7,
  orderDirection: 'desc',
  orderBy: 'dateStartTime',
}

const defaultAttrs = {
  id: true,
  dailyLiquidity: true,
  dailySwapFeesUSD: true,
  dailySwapVolumeUSD: true,
  dateStartTime: true,
}

export const poolDayDatasQueryBuilder = (args = {}, attrs = {}, name: string | undefined = undefined) => ({
  __name: name,
  poolDayDatas: {
    __args: merge({}, defaultArgs, args),
    ...merge({}, defaultAttrs, attrs),
  },
})
