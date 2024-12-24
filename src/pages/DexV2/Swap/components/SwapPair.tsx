import React, { useState } from 'react'
import { Box } from 'rebass'
import styled from 'styled-components'

import TokenInput from './TokenInput'
import SwapIcon from 'assets/images/dex-v2/swap.svg'

interface SwapPairProps {}

const SwapPair: React.FC<SwapPairProps> = () => {
  return (
    <Container>
      <div>
        <TokenInput />
      </div>
      <SwapIconWrapper>
        <img src={SwapIcon} alt="Swap" />
      </SwapIconWrapper>
      <Box mt={24}>
        <TokenInput />
      </Box>
    </Container>
  )
}

export default SwapPair

const Container = styled.div`
  position: relative;
`

const SwapIconWrapper = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: #FFFFFF;
  display: flex;
  justify-content: center;
  align-items: center;
`
