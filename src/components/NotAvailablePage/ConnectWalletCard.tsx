import React from 'react'
import { Trans } from '@lingui/macro'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import styled from 'styled-components'

import { useWhitelabelState } from 'state/whitelabel/hooks'

const ConnectWalletCard = () => {
  const { config } = useWhitelabelState()
  const { openConnectModal } = useConnectModal()

  return (
    <Container>
      <ContentWrapper>
        <Subtitle>
          <Trans>Enable full access to all {config?.name || 'IXS'} features</Trans>
        </Subtitle>
        <MainHeading>
          <Trans>To get started, please</Trans>
          <br />
          <Trans>connect your wallet.</Trans>
        </MainHeading>
        {openConnectModal && (
          <ConnectButton onClick={openConnectModal}>
            <Trans>Connect Wallet</Trans>
          </ConnectButton>
        )}
      </ContentWrapper>

      {config?.isIxSwap ? (
        <FooterText>
          <Trans>
            While your wallet is not connected, feel free to explore our{' '}
            <StyledLink href="https://staking.ixs.finance/" target="_blank" rel="noreferrer">
              Staking Program
            </StyledLink>
            ,{' '}
            <StyledLink href="https://ixswap.defiterm.io/" target="_blank" rel="noreferrer">
              Liquidity Mining on Polygon
            </StyledLink>
            , and{' '}
            <StyledLink
              href="https://app.uniswap.org/#/add/v2/ETH/0x73d7c860998CA3c01Ce8c808F5577d94d545d1b4?chain=polygon"
              target="_blank"
              rel="noreferrer"
            >
              Liquidity Mining on Ethereum
            </StyledLink>
            .
          </Trans>
        </FooterText>
      ) : null}
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 80px;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 100vh;
  padding: 0;
`

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
  justify-content: flex-start;
`

const Subtitle = styled.div`
  font-family: 'Inter Display', 'Inter', sans-serif;
  font-weight: 500;
  font-size: 18px;
  color: #ffffff;
  opacity: 0.5;
  text-align: center;
  line-height: 1.4;
`

const MainHeading = styled.div`
  font-family: 'Inter Display', 'Inter', sans-serif;
  font-weight: 700;
  font-size: 48px;
  color: #ffffff;
  text-align: center;
  line-height: 1.2;
  letter-spacing: -0.48px;
  max-width: 500px;
`

const FooterText = styled.div`
  font-family: 'Inter Display', 'Inter', sans-serif;
  font-weight: 500;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
  line-height: 1.5;
  letter-spacing: -0.14px;
  max-width: 352px;
`

const StyledLink = styled.a`
  color: #ffffff;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`

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
