import { Config, Network } from './types'
import tokenBaseSepolia from 'assets/data/tokenlists/tokens-84532.json'

import baseSepolia from './base-sepolia'

const config: Record<Network | number, Config> = {
  [Network.BASE_SEPOLIA]: baseSepolia,
}

export default config

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const tokenLists: Record<Network | number, any> = {
  [Network.BASE_SEPOLIA]: tokenBaseSepolia,
}
