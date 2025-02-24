import React, { useEffect } from 'react'
import { Box } from 'rebass'

import usePoolFilters from 'state/dexV2/swap/usePoolFilters'
import SwapCard from './components/SwapCard'
import Col3Layout from '../common/Col3Layout'
import MyWallet from './components/MyWallet'
import BridgeLink from './components/BridgeLink'
import { hasBridge } from 'hooks/dex-v2/useNetwork'
import useWeb3 from 'hooks/dex-v2/useWeb3'
import { useTokens } from 'state/dexV2/tokens/hooks/useTokens'
import { walletService } from 'services/web3/wallet.service'

const Swap: React.FC = () => {
  const { setSelectedTokens } = usePoolFilters()
  const { appNetworkConfig, isWalletReady, getProvider } = useWeb3()
  const { injectSpenders } = useTokens()

  useEffect(() => {
    setSelectedTokens([])
  }, [])

  useEffect(() => {
    injectSpenders([appNetworkConfig.addresses.vault])
  }, [isWalletReady])

  useEffect(() => {
    async function setProvider() {
      const provider = await getProvider()
      if (provider) {
        walletService.setUserProvider(provider)
      }
    }
    if (isWalletReady) {
      setProvider()
    }
  }, [isWalletReady])

  return (
    <Box mt="32px">
      <Col3Layout mobileGuttersFirst={true} mobileGuttersLast={false} mobileHideGutters={false} offsetGutters={true}>
        {{
          gutterLeft: (
            <div style={{ background: '#f0f0f0' }}>
              <MyWallet />
            </div>
          ),
          center: (
            <div>
              <SwapCard />
            </div>
          ),
          gutterRight: <div style={{ background: '#f0f0f0' }}>{hasBridge ? <BridgeLink /> : null}</div>,
        }}
      </Col3Layout>
    </Box>
  )
}

export default Swap
