export type Address = string
export type QueryArgs = Record<string, any>
export type QueryAttrs = Record<string, any>
export type QueryBuilder = (args?: QueryArgs, attrs?: QueryAttrs, name?: string) => Record<string, any>

export interface SubgraphGauge {
  id: string
  address: string
  totalSupply: string
  isAlive: boolean
  isKilled: boolean
  created: number
  tx: string
  pool: {
    id: string
    address: string
  }
}

export interface OnchainGaugeData {
  rewardTokens: string[]
  claimableTokens: string
  claimableRewards: Record<string, string>
}

export type OnchainGaugeDataMap = Record<string, OnchainGaugeData>

export type Gauge = SubgraphGauge & OnchainGaugeData
