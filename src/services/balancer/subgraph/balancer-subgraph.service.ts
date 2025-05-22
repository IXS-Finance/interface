import { rpcProviderService as _rpcProviderService } from 'services/rpc-provider/rpc-provider.service'

import { balancerSubgraphClient } from './balancer-subgraph.client'
import PoolActivities from './entities/poolActivities'
import Pools from './entities/pools'
import PoolShares from './entities/poolShares'
import PoolSnapshots from './entities/poolSnapshots'
import PoolSwaps from './entities/poolSwaps'
import TradePairSnapshots from './entities/swapPairs'
import { PoolDayDatasEntity } from '../poolDayDatas/entities/gauges/poolDayDatas.entity'
import { GaugesEntity } from '../gauges/entities/gauges/gauges.entity'

export default class BalancerSubgraphService {
  pools: Pools
  poolShares: PoolShares
  poolActivities: PoolActivities
  poolSwaps: PoolSwaps
  poolSnapshots: PoolSnapshots
  tradePairSnapshots: TradePairSnapshots
  poolDayDatas: PoolDayDatasEntity
  gauges: GaugesEntity

  constructor(readonly client = balancerSubgraphClient, readonly rpcProviderService = _rpcProviderService) {
    // Init entities
    this.pools = new Pools(this)
    this.poolShares = new PoolShares(this)
    this.poolActivities = new PoolActivities(this)
    this.poolSwaps = new PoolSwaps(this)
    this.poolSnapshots = new PoolSnapshots(this)
    this.tradePairSnapshots = new TradePairSnapshots(this)
    this.poolDayDatas = new PoolDayDatasEntity(this)
    this.gauges = new GaugesEntity(this)
  }
}

export const balancerSubgraphService = new BalancerSubgraphService()
