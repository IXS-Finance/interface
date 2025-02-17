import { useMemo } from 'react'

import { configService } from 'services/config/config.service'
import { useTokens } from 'state/dexV2/tokens/hooks/useTokens'
import useWeb3 from './useWeb3'

export default function useNativeBalance() {
  const { hasBalance, nativeAsset, balanceFor } = useTokens()
  const nativeCurrency = configService.network.nativeAsset.symbol

  const { appNetworkConfig, isWalletReady } = useWeb3()

  const nativeBalance = useMemo(() => {
    if (!isWalletReady) return '-'
    return Number(balanceFor(appNetworkConfig.nativeAsset.address)).toFixed(4)
  }, [isWalletReady, appNetworkConfig.nativeAsset.address])

  const hasNativeBalance = useMemo(() => hasBalance(nativeAsset.address), [nativeAsset.address])

  return {
    hasNativeBalance,
    nativeBalance,
    nativeCurrency,
  }
}
