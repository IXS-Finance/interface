import React, { useMemo, useRef } from 'react'
import styled from 'styled-components'
import { Flex } from 'rebass'
import { useAccount, useSwitchChain } from 'wagmi'

import { CHAIN_INFO, NETWORK_LABELS } from 'constants/chains'
import { useOnClickOutside } from 'hooks/useOnClickOutside'
import { ApplicationModal } from 'state/application/actions'
import { useModalOpen, useToggleModal } from 'state/application/hooks'
import { ChevronElement } from 'components/ChevronElement'
import { MEDIA_WIDTHS } from 'theme'
import { ReactComponent as Checked } from 'assets/images/checked-blue.svg'
import { VioletCard } from '../Card'
import { CHAINS } from 'components/Web3Provider/constants'
import wrongNetworkImg from 'assets/images/warningRedRec.png'

interface StyledBoxProps {
  isCorrectNetwork: boolean
}

export const NetworkCard = () => {
  const { chainId, address: account } = useAccount()
  const { isPending, switchChain } = useSwitchChain()

  const node = useRef<HTMLDivElement>()
  const open = useModalOpen(ApplicationModal.NETWORK_SELECTOR)
  const toggle = useToggleModal(ApplicationModal.NETWORK_SELECTOR)
  const info = chainId ? CHAIN_INFO[chainId] : undefined
  useOnClickOutside(node, open ? toggle : undefined)
  const supportedChains = CHAINS ? CHAINS.map((chain) => chain.id) : []
  const isCorrectNetwork = supportedChains.includes(chainId as number)

  const activeChainName = useMemo(() => chainId && NETWORK_LABELS[chainId], [chainId])

  const handleRowClick = (targetChain: number) => {
    toggle()
    if (chainId !== targetChain) {
      switchChain({ chainId: targetChain })
    }
  }

  return (
    <StyledBox isCorrectNetwork={isCorrectNetwork}>
      {account && (
        <Selector ref={node as any}>
          <SelectorControls onClick={() => toggle()}>
            {isPending ? (
              <PendingText>Switching...</PendingText>
            ) : (
              <Flex alignItems="center">
                {isCorrectNetwork ? (
                  <>
                    {info ? <Logo src={info.logoUrl} /> : null}
                    <NetworkCardWrapper style={{ color: '#292933', marginRight: '10px' }}>
                      {activeChainName}
                    </NetworkCardWrapper>
                  </>
                ) : (
                  <>
                    <Logo src={wrongNetworkImg} />
                    <NetworkCardWrapper style={{ color: '#292933', marginRight: '10px' }}>
                      Wrong Network
                    </NetworkCardWrapper>
                  </>
                )}
              </Flex>
            )}

            <ChevronElement showMore={open} setShowMore={toggle} />
          </SelectorControls>

          {open && (
            <FlyoutMenu>
              {CHAINS.map((chain: any) => {
                const active = chainId === chain.id
                const targetChain = chain.id
                return (
                  <FlyoutRow key={targetChain} onClick={() => handleRowClick(targetChain)} active={active}>
                    <Logo src={CHAIN_INFO[targetChain].logoUrl} />
                    <NetworkLabel>{chain.name}</NetworkLabel>
                    {chainId === targetChain && <Checked />}
                  </FlyoutRow>
                )
              })}
            </FlyoutMenu>
          )}
        </Selector>
      )}
    </StyledBox>
  )
}

const SelectorControls = styled(VioletCard)`
  cursor: pointer;
  padding: 2px 3px;
  background: transparent;
  width: max-content;
  display: flex;
  justify-content: space-between;
  button {
    ${({ theme }) => theme.mediaWidth.upToSmall`
     padding: 0 3px 0 1px;
  `};
  }
  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin: 0;
    text-overflow: ellipsis;
    flex-shrink: 1;
    padding: 0;
  `};
`

const NetworkCardWrapper = styled.div`
  font-size: 13px;

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    display: none;
  `};

  ${({ theme }) => theme.mediaWidth.upToLarge`
     font-size: 12px;
  `};
`

const FlyoutMenu = styled.div`
  align-items: flex-start;
  background-color: ${({ theme }) => theme.bg0};
  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
    0px 24px 32px rgba(0, 0, 0, 0.01);
  border-radius: 8px;
  border: 1px solid #e6e6ff;
  display: flex;
  flex-direction: column;
  font-size: 13px;
  overflow: auto;
  padding: 6px 24px;
  position: absolute;
  top: 70px;
  width: 210px;
  z-index: 99;
  @media screen and (min-width: ${MEDIA_WIDTHS.upToSmall}px) {
    top: 54px;
    left: 0;
  }
  @media screen and (max-width: ${MEDIA_WIDTHS.upToExtraSmall}px) {
    right: 70px;
    left: 0;
  }
  @media screen and (max-width: 400px) {
    right: 30px;
    left: 0;
  }
`
const FlyoutRow = styled.div<{ active: boolean }>`
  align-items: center;
  background-color: transparent;
  cursor: pointer;
  display: flex;
  font-weight: 500;
  justify-content: space-between;
  padding: 18px 0;
  text-align: left;
  width: 100%;

  &:not(:last-child) {
    border-bottom: 1px solid #e6e6ff;
  }
`
const Logo = styled.img`
  height: 20px;
  width: 20px;
  margin-right: 8px;
`
const NetworkLabel = styled.div`
  flex: 1 1 auto;
`

const Selector = styled.div`
  margin-right: 5px;
`
const StyledBox = styled.div<StyledBoxProps>`
  font-size: 12px;
  border: 1px solid ${({ isCorrectNetwork }) => (isCorrectNetwork ? '#e6e6ff' : 'red')};
  padding: 10px 5px 10px 10px;
  border-radius: 4px;
  background-color: #fff;
  ${({ theme }) => theme.mediaWidth.upToMedium`
     padding: 12px;
  `};
  :active {
    border: 1px solid ${({ isCorrectNetwork }) => (isCorrectNetwork ? '#4d8fea' : 'red')};
  }
  :hover {
    transform: scale(0.99);
    transition: 0.2s;
    border: 1px solid ${({ isCorrectNetwork }) => (isCorrectNetwork ? '#4d8fea' : 'red')};
  }
  position: relative;
`

const PendingText = styled.div`
  font-size: 13px;
  color: #292933;
  font-weight: 500;
  margin-right: 10px;
`
