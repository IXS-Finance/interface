import React, { useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useDispatch } from 'react-redux'
import { Box } from 'rebass'

import usePoolFilters from 'state/dexV2/swap/usePoolFilters'
import SwapCard from './components/SwapCard'
import { useTokensState } from 'state/dexV2/tokens/hooks'
import Col3Layout from '../common/Col3Layout'
import MyWallet from './components/MyWallet'
import BridgeLink from './components/BridgeLink'
import { hasBridge } from 'hooks/dex-v2/useNetwork'

const Swap: React.FC = () => {
  const { address: account } = useAccount()
  const { setSelectedTokens } = usePoolFilters()
  const { tokens: results } = useTokensState()
  const dispatch = useDispatch()

  useEffect(() => {
    setSelectedTokens([])
  }, [])

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
