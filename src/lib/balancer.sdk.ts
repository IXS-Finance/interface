import { BalancerSDK } from '@ixswap1/dex-v2-sdk'
import { getAlchemyUrlFor } from 'components/Web3Provider/constants'
import { Network } from 'lib/config/types'
import { configService } from 'services/config/config.service'

export const balancer = new BalancerSDK({
  network: configService.network.chainId as Network,
  rpcUrl: getAlchemyUrlFor('base-sepolia'),
  customSubgraphUrl: configService.network.subgraph,
})

export async function fetchPoolsForSor() {
  console.time('fetchPoolsForSor')
  const result = await balancer.swaps.fetchPools()
  console.timeEnd('fetchPoolsForSor')
  console.log('fetchPoolsForSor', result)
}
