import { getChainId, getAccount } from '@wagmi/core'
import { useMemo, useState } from 'react'

import { wagmiConfig } from 'components/Web3Provider'
import { configService } from 'services/config/config.service'
import { rpcProviderService } from 'services/rpc-provider/rpc-provider.service'
import { getEthersProvider, getEthersSigner } from 'hooks/useEthersProvider'

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
  const getProvider = () => getEthersProvider(wagmiConfig)

  const userNetworkConfig = configService.getNetworkConfig(chainId)
  const isMismatchedNetwork = account && userNetworkConfig?.key !== appNetworkConfig.key
  const isWalletReady = account !== null

  return {
    account,
    chainId,
    blockNumber,
    isWalletReady,
    appNetworkConfig,
    isMismatchedNetwork,
    explorerLinks,
    getSigner,
    getProvider,
  }
}
