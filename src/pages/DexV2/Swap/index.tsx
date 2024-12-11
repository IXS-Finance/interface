import React, { useState } from 'react'
import { Flex } from 'rebass'
import styled from 'styled-components'
import { useAccount } from 'wagmi'

import settingIcon from 'assets/images/dex-v2/setting.svg'
import chainIcon from 'assets/images/dex-v2/chain.svg'
import NetworkSelect from './components/NetworkSelect'
import SwapPair from './components/SwapPair'
import { ButtonPrimary } from '../common'

const Swap: React.FC = () => {
  const { address: account } = useAccount()

  return (
    <Container>
      <Flex justifyContent="space-between" alignItems="center">
        <Title>Swap</Title>

        <Flex alignItems="center">
          <Flex alignItems="center">
            <img src={chainIcon} alt="Settings" />
          </Flex>
          <HorizontalLine />
          <PercentText>0.05%</PercentText>
          <Flex alignItems="center">
            <img src={settingIcon} alt="Settings" />
          </Flex>
        </Flex>
      </Flex>

      <div>
        <NetworkSelect />
      </div>

      <SwapPair />

      <div>{account ? <ButtonPrimary>Next</ButtonPrimary> : <ButtonPrimary>Connect Wallet</ButtonPrimary>}</div>
    </Container>
  )
}

export default Swap

const Container = styled.div`
  width: 480px;
  margin: 0 auto;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0px 30px 48px 0px rgba(63, 63, 132, 0.05);
  padding: 48px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 200px;
  margin-bottom: 200px;
`

const Title = styled.div`
  color: rgba(41, 41, 51, 0.9);
  font-size: 20px;
  font-style: normal;
  font-weight: 600;
  letter-spacing: -0.6px;
`

const PercentText = styled.div`
  color: #b8b8cc;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  letter-spacing: -0.42px;
  margin-right: 4px;
`

const HorizontalLine = styled.div`
  border: 1px solid #e6e6ff;
  height: 18px;
  margin-right: 16px;
  margin-left: 16px;
`
