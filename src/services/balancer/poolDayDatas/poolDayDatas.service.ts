import { PoolDayDatasEntity } from './entities/gauges/poolDayDatas.entity'
import { poolDayDatasSubgraphClient } from './poolDayDatas.client'

export class PoolDayDatasSubgraphService {
  poolDayDatas: PoolDayDatasEntity

  constructor(readonly client = poolDayDatasSubgraphClient) {
    this.poolDayDatas = new PoolDayDatasEntity(this)
  }
}

export const poolDayDatasSubgraphService = new PoolDayDatasSubgraphService()
