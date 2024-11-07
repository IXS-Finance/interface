import { Config, Network } from './types'

import baseSepolia from './base-sepolia'

const config: Record<Network | number, Config> = {
  [Network.BASE_SEPOLIA]: baseSepolia,
}

export default config
