import { QueryBuilder, SubgraphPoolDayData } from '../../types'
import { poolDayDatasQueryBuilder } from './query'
import Service from '../../../subgraph/balancer-subgraph.service'

export class PoolDayDatasEntity {
  constructor(private readonly service: Service, private readonly query: QueryBuilder = poolDayDatasQueryBuilder) {}

  public async get(args = {}, attrs = {}): Promise<SubgraphPoolDayData[]> {
    const queryName = 'PoolDayDatas'
    const query = this.query(args, attrs, queryName)
    const data = await this.service.client.get(query)
    return data.poolDayDatas
  }
}
