import React, { FC, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import styled from 'styled-components'

import useWeb3 from 'hooks/dex-v2/useWeb3'
import { fetchTokenLists } from 'state/dexV2/tokenLists'
import { useTokens } from 'state/dexV2/tokens/hooks/useTokens'
import { NetworkNotAvailable } from 'components/Launchpad/NetworkNotAvailable'
import Portal from '@reach/portal'
import { CenteredFixed } from 'components/LaunchpadMisc/styled'
import { ChainId } from 'types/chains'

interface DexV2LayoutProps {
  children: React.ReactNode
}

const DexV2Layout: FC<DexV2LayoutProps> = ({ children }) => {
  const { isWalletReady, appNetworkConfig, isMismatchedNetwork } = useWeb3()
  const dispatch = useDispatch()
  const { injectSpenders } = useTokens()

  useEffect(() => {
    injectSpenders([appNetworkConfig.addresses.vault])
    dispatch(fetchTokenLists())
  }, [isWalletReady])

  if (isMismatchedNetwork) {
    return (
      <Portal>
        <CenteredFixed width="100vw" height="100vh">
          <NetworkNotAvailable expectChainId={ChainId.BaseSepolia} />
        </CenteredFixed>
      </Portal>
    )
  }

  return <Container className="dexv2-layout">{children}</Container>
}

export default DexV2Layout

const Container = styled.div`
  margin-top: 50px;
  width: 100%;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin-top: 48px;
  `}

  .h-120 {
    height: 30rem;
  }

  .h-24 {
    height: 6rem;
  }

  .h-30 {
    height: 7.5rem;
  }

  .px-5 {
    padding-left: 1.25rem;
    padding-right: 1.25rem;
  }

  .py-4 {
    padding-top: 1rem;
    padding-bottom: 1rem;
  }
`
