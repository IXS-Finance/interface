import { getChainId } from '@wagmi/core'
import { wagmiConfig } from 'components/Web3Provider'
import { Network } from 'lib/config/types'
import { useMemo } from 'react'
import { configService } from 'services/config/config.service'

const chainId = getChainId(wagmiConfig)
export const networkId = chainId as Network

export const isPolygon = networkId === Network.POLYGON
export const isMainnet = networkId === Network.MAINNET
export const isEIP1559SupportedNetwork = configService.network.supportsEIP1559

export default function useNetwork() {
  const appNetworkConfig = configService.network

  return {
    // appUrl,
    networkId,
    // networkConfig,
    // networkSlug,
    // getNetworkSlug,
    // getSubdomain,
    // handleNetworkSlug,
    appNetworkConfig,
  }
}
