import { merge } from 'lodash'

const defaultArgs = {
  first: 999,
}

const defaultAttrs = {
  id: true,
  totalSupply: true,
  isAlive: true,
  isKilled: true,
  address: true,
  tx: true,
  created: true,
  pool: {
    address: true,
    id: true,
  },
}

export const gaugeQueryBuilder = (args = {}, attrs = {}, name: string | undefined = undefined) => ({
  __name: name,
  gauges: {
    __args: merge({}, defaultArgs, args),
    ...merge({}, defaultAttrs, attrs),
  },
})
