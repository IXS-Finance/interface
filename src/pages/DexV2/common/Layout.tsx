import React, { FC, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import styled from 'styled-components'

import useWeb3 from 'hooks/dex-v2/useWeb3'
import { fetchTokenLists } from 'state/dexV2/tokenLists'
import { useTokens } from 'state/dexV2/tokens/hooks/useTokens'

interface DexV2LayoutProps {
  children: React.ReactNode
}

const DexV2Layout: FC<DexV2LayoutProps> = ({ children }) => {
  const { isWalletReady, appNetworkConfig } = useWeb3()
  const dispatch = useDispatch()
  const { injectSpenders } = useTokens()

  useEffect(() => {
    injectSpenders([appNetworkConfig.addresses.vault])
    dispatch(fetchTokenLists())
  }, [isWalletReady])

  return <Container className="dexv2-layout">{children}</Container>
}

export default DexV2Layout

const Container = styled.div`
  margin-top: 120px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin-top: 48px;
  `}
`
