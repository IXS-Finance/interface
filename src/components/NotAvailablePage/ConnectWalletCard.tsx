import React from 'react'
import { Text } from 'rebass'
import { Trans } from '@lingui/macro'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import styled from 'styled-components'

import { ConnectWalletContainer } from './styled'
import { useWhitelabelState } from 'state/whitelabel/hooks'

const ConnectWalletCard = () => {
  const { config } = useWhitelabelState()
  const { openConnectModal } = useConnectModal()

  return (
    <ConnectWalletContainer>
      <Text className="text-white opacity-50">
        <Trans>Welcome to {config?.name || 'IXS'}</Trans>
      </Text>
      <div>
        To get started, please <br /> connect your wallet.
      </div>
      {openConnectModal && (
        <ConnectButton onClick={openConnectModal}>
          <Trans>Connect Wallet</Trans>
        </ConnectButton>
      )}

      {config?.isIxSwap ? (
        <div className='mt-[80px]'>
          <span className="text-white opacity-50">While your wallet is not connected, you can see our New</span> <br />
          <a className="text-white opacity-100" href="https://staking.ixs.finance/" target="_blank" rel="noreferrer">
            Staking Program
          </a>
          ,&nbsp;
          <a className="text-white" href="https://ixswap.defiterm.io/" target="_blank" rel="noreferrer">
            Liquidity Mining on Polygon
          </a>
          &nbsp;<span className="text-white opacity-50">and</span>&nbsp; <br />
          <a
            className="text-white"
            href="https://app.uniswap.org/#/add/v2/ETH/0x73d7c860998CA3c01Ce8c808F5577d94d545d1b4?chain=polygon"
            target="_blank"
            rel="noreferrer"
          >
            Liquidity Mining on Ethereum
          </a>
          .
        </div>
      ) : null}
    </ConnectWalletContainer>
  )
}

const ConnectButton = styled.button`
  background: #ffffff;
  border: none;
  border-radius: 50px;
  color: #16171c;
  font-family: 'Inter Display', 'Inter', sans-serif;
  font-weight: 500;
  font-size: 16px;
  padding: 12px 32px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0px 16px 16px 0px #6666FF21;
  width: fit-content;

  &:hover {
    background: #f0f0f0;
    transform: translateY(-1px);
    box-shadow: 0px 20px 20px 0px #6666FF25;
  }

  &:active {
    background: #e0e0e0;
    transform: translateY(0);
    box-shadow: 0px 12px 12px 0px #6666FF15;
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`

export default ConnectWalletCard
