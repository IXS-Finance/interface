import React, { useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useDispatch } from 'react-redux'

import usePoolFilters from 'state/dexV2/swap/usePoolFilters'
import SwapCard from './components/SwapCard'
import { useTokensState } from 'state/dexV2/tokens/hooks'

const Swap: React.FC = () => {
  const { address: account } = useAccount()
  const { setSelectedTokens } = usePoolFilters()
  const { tokens: results } = useTokensState()
  const dispatch = useDispatch()

  useEffect(() => {
    setSelectedTokens([])
  }, [])

  return (
    <div>
      <SwapCard />
    </div>
  )
}

export default Swap
