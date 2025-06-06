import { Pool } from '@ixswap1/dex-v2-sdk'

export interface SubgraphJoinExit {
  user: {
    id: string
  }
  type: 'Join' | 'Exit'
  pool: Pool
}
