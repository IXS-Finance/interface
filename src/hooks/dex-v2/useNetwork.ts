import { getChainId } from '@wagmi/core'
import { wagmiConfig } from 'components/Web3Provider'
import { Network } from 'lib/config/types'
import { configService } from 'services/config/config.service'
import config from 'lib/config'

const chainId = getChainId(wagmiConfig)
export const networkId = chainId as Network

export const isPolygon = networkId === Network.POLYGON
export const isMainnet = networkId === Network.MAINNET
export const isEIP1559SupportedNetwork = configService.network.supportsEIP1559
export const networkConfig = config[networkId]
export const isTestnet = !!config[networkId].testNetwork
export const networkSlug = config[networkId].slug

export const hasBridge = !!config[networkId].bridgeUrl
export const isPoolBoostsEnabled = configService.network.pools.BoostsEnabled

export default function useNetwork() {
  const appNetworkConfig = configService.network

  return {
    // appUrl,
    networkId,
    networkConfig,
    networkSlug,
    // getNetworkSlug,
    // getSubdomain,
    // handleNetworkSlug,
    appNetworkConfig,
    isEIP1559SupportedNetwork,
  }
}
