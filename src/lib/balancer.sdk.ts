import { BalancerSDK } from '@ixswap1/dex-v2-sdk'
import { Network } from 'lib/config/types'
import { configService } from 'services/config/config.service'

// Create a BalancerSDK instance with configuration.
export const balancer = new BalancerSDK({
  network: configService.network.chainId as Network,
  rpcUrl: configService.rpc,
  customSubgraphUrl: configService.network.subgraph,
})

// Use a module-level variable instead of Vue's ref.
export let hasFetchedPoolsForSor = false

export async function fetchPoolsForSor() {
  if (hasFetchedPoolsForSor) return

  console.time('fetchPoolsForSor')
  await balancer.swaps.fetchPools()
  hasFetchedPoolsForSor = true
  console.timeEnd('fetchPoolsForSor')
}
