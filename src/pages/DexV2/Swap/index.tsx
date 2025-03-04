import React, { useEffect } from 'react'
import styled from 'styled-components'

import usePoolFilters from 'state/dexV2/swap/usePoolFilters'
import SwapCard from './components/SwapCard'
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
    <Container>
      <SwapCard />
    </Container>
  )
}

export default Swap

const Container = styled.div`
  padding: 0 1rem;
  margin: 0 auto;
  width: 100%;
  max-width: 462px;
`
