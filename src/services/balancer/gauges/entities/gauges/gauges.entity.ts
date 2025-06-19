import { SubgraphGauge } from 'services/dexV2/gauges/types'
import { QueryBuilder } from '../../types'
import { gaugeQueryBuilder } from './query'
import Service from '../../../subgraph/balancer-subgraph.service'

export class GaugesEntity {
  constructor(private readonly service: Service, private readonly query: QueryBuilder = gaugeQueryBuilder) {}

  public async get(args = {}, attrs = {}): Promise<SubgraphGauge[]> {
    const queryName = 'Gauges'
    const query = this.query(args, attrs, queryName)
    const data = await this.service.client.get(query)
    return data.gauges
  }
}
