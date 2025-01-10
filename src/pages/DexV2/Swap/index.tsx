import React, { useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useDispatch } from 'react-redux'

import usePoolFilters from 'state/dexV2/swap/usePoolFilters'
import SwapCard from './components/SwapCard'
import { useTokensState } from 'state/dexV2/tokens/hooks'
import { fetchTokenPrices, fetchTokensBalances } from 'state/dexV2/tokens'


const Swap: React.FC = () => {
  const {address: account} = useAccount()
  const { setSelectedTokens } = usePoolFilters()
  const { tokens: results } = useTokensState()
  const dispatch = useDispatch();

  useEffect(() => {
    setSelectedTokens([])
  }, [])

  useEffect(() => {
    if (account) {
      dispatch(
        fetchTokensBalances({
          tokens: results,
          account,
        })
      )
      dispatch(fetchTokenPrices(results))
    }
  }, [account])

  return (
    <div>
      <SwapCard />
    </div>
  )
}

export default Swap
