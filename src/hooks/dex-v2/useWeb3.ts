import { getChainId, getAccount } from '@wagmi/core'
import { useMemo, useState } from 'react'

import { wagmiConfig } from 'components/Web3Provider'
import { configService } from 'services/config/config.service'
import { rpcProviderService } from 'services/rpc-provider/rpc-provider.service'
import { getEthersSigner } from 'hooks/useEthersProvider'

export default function useWeb3() {
  const appNetworkConfig = configService.network
  const chainId = getChainId(wagmiConfig)
  const { address } = getAccount(wagmiConfig)
  const account = address ? address : ''
  const explorerLinks = {
    txLink: (txHash: string) => `${configService.network.explorer}/tx/${txHash}`,
    addressLink: (address: string) => `${configService.network.explorer}/address/${address}`,
    tokenLink: (address: string) => `${configService.network.explorer}/token/${address}`,
  }

  const [blockNumber, setBlockNumber] = useState<number>(0)

  /** INIT STATE */
  rpcProviderService.initBlockListener(setBlockNumber)

  // METHODS
  const getSigner = () => getEthersSigner(wagmiConfig)

  const userNetworkConfig = useMemo(() => {
    try {
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

  return {
    account,
    chainId,
    blockNumber,
    isWalletReady,
    appNetworkConfig,
    isMismatchedNetwork,
    explorerLinks,
    getSigner,
  }
}
