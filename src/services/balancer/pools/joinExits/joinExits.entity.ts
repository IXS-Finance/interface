import { SubgraphJoinExit } from './types'
import Service from '../../subgraph/balancer-subgraph.service'
import { joinExitsQueryBuilder } from './query'
import { QueryBuilder } from 'services/dexV2/gauges/types'

export class JoinExitsEntity {
  constructor(private readonly service: Service, private readonly query: QueryBuilder = joinExitsQueryBuilder) {}

  public async get(args = {}, attrs = {}): Promise<SubgraphJoinExit[]> {
    const queryName = 'JoinExits'
    const query = this.query(args, attrs, queryName)
    const data = await this.service.client.get(query)
    return data.joinExits
  }
}
