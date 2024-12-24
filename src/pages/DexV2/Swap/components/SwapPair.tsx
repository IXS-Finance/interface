import React, { useState } from 'react'
import { Box } from 'rebass'
import styled from 'styled-components'

import TokenInput from './TokenInput'

interface SwapPairProps {}

const SwapPair: React.FC<SwapPairProps> = () => {
  return (
    <div>
      <div>
        <TokenInput />
      </div>
      <div>Icon Swap</div>
      <Box mt={24}>
        <TokenInput />
      </Box>
    </div>
  )
}

export default SwapPair

const Container = styled.div`
  position: relative;
`
