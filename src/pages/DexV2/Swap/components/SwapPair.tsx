import React, { useState } from 'react'
import TokenInput from './TokenInput'

interface SwapPairProps {}

const SwapPair: React.FC<SwapPairProps> = () => {
  return (
    <div>
      <TokenInput />
      <TokenInput />
    </div>
  )
}

export default SwapPair
