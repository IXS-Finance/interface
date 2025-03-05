import React, { FC, useEffect } from 'react'
import { useDispatch } from 'react-redux'

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

  return <div className="dexv2-layout">{children}</div>
}

export default DexV2Layout
