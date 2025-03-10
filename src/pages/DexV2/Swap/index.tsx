import React, { useEffect } from 'react'
import styled from 'styled-components'

import usePoolFilters from 'state/dexV2/swap/usePoolFilters'
import SwapCard from './components/SwapCard'
import DexV2Layout from '../common/Layout'

const Swap: React.FC = () => {
  const { setSelectedTokens } = usePoolFilters()

  useEffect(() => {
    setSelectedTokens([])
  }, [])

  return (
    <DexV2Layout>
      <Container>
        <SwapCard />
      </Container>
    </DexV2Layout>
  )
}

export default Swap

const Container = styled.div`
  margin: 0 auto;
  width: 100%;
`
