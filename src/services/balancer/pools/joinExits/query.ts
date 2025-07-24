import { merge } from 'lodash'

const defaultArgs = {}

const defaultAttrs = {
  user: {
    id: true,
  },
  type: true,
  pool: {
    address: true,
    id: true,
  },
}

export const joinExitsQueryBuilder = (args = {}, attrs = {}, name: string | undefined = undefined) => ({
  __name: name,
  joinExits: {
    __args: merge({}, defaultArgs, args),
    ...merge({}, defaultAttrs, attrs),
  },
})
