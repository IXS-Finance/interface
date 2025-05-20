import { PoolDayDatasSubgraphService } from '../../poolDayDatas.service'
import { QueryBuilder, SubgraphPoolDayData } from '../../types'
import { poolDayDatasQueryBuilder } from './query'

export class PoolDayDatasEntity {
  constructor(
    private readonly service: PoolDayDatasSubgraphService,
    private readonly query: QueryBuilder = poolDayDatasQueryBuilder
  ) {}

  public async get(args = {}, attrs = {}): Promise<SubgraphPoolDayData[]> {
    const queryName = 'PoolDayDatas'
    const query = this.query(args, attrs, queryName)
    const data = await this.service.client.get(query)
    return data.poolDayDatas
  }
}
