import { getChainId, getAccount } from '@wagmi/core'
import { useMemo } from 'react'

import { wagmiConfig } from 'components/Web3Provider'
import { configService } from 'services/config/config.service'

export default function useWeb3() {
  const appNetworkConfig = configService.network
  const chainId = getChainId(wagmiConfig)
  const account = getAccount(wagmiConfig)

  const userNetworkConfig = useMemo(() => {
    try {
      console.log('chainId', chainId)
      if (chainId) return configService.getNetworkConfig(chainId)
      return null
    } catch (error) {
      console.error(error)
      return null
    }
  }, [chainId])

  const isMismatchedNetwork = useMemo(() => {
    return account && userNetworkConfig?.key !== appNetworkConfig.key
  }, [chainId, account])

  const isWalletReady = useMemo(() => account !== null, [account])

  return { account, chainId, isWalletReady, appNetworkConfig, isMismatchedNetwork }
}
