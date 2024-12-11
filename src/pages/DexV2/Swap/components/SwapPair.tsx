import React, { useState } from 'react'
import { Box } from 'rebass'

import TokenInput from './TokenInput'

interface SwapPairProps {}

const SwapPair: React.FC<SwapPairProps> = () => {
  return (
    <div>
      <div>
        <TokenInput />
      </div>

      <Box mt={24}>
        <TokenInput />
      </Box>
    </div>
  )
}

export default SwapPair
