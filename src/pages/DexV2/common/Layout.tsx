import React, { FC, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import styled from 'styled-components'

import useWeb3 from 'hooks/dex-v2/useWeb3'
import { fetchTokenLists } from 'state/dexV2/tokenLists'

interface DexV2LayoutProps {
  children: React.ReactNode
}

const DexV2Layout: FC<DexV2LayoutProps> = ({ children }) => {
  const { chainId } = useWeb3()
  const dispatch = useDispatch()

  useEffect(() => {
    if (chainId) {
      dispatch(fetchTokenLists())
    }
  }, [chainId])

  return <Container className="dexv2-layout">{children}</Container>
}

export default DexV2Layout

const Container = styled.div`
  margin-top: 120px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin-top: 48px;
  `}
`
