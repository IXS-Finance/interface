import React, { useRef, useState } from 'react'
import styled from 'styled-components'
import { Flex } from 'rebass'
import { MEDIA_WIDTHS } from 'theme'

import { CHAIN_INFO, NETWORK_LABELS } from 'constants/chains'
import { useOnClickOutside } from 'hooks/useOnClickOutside'
import { ChevronElement } from 'components/ChevronElement'
import { ReactComponent as Checked } from 'assets/images/checked-blue.svg'
import { VioletCard } from 'components/Card'
import { CHAINS } from 'components/Web3Provider/constants'

type NetworkCardProps = {
  selectedValue: number,
  onChange: (chainId: number) => void
}

export const NetworkCard = (props: NetworkCardProps) => {
  const { selectedValue: chainId, onChange } = props
  const node = useRef<HTMLDivElement>()
  const [open, setOpen] = useState(false)
  useOnClickOutside(node, open ? () => setOpen(false) : undefined)

  const handleRowClick = (targetChain: number) => {
    setOpen(false)
    if (chainId !== targetChain) {
      onChange(targetChain)
    }
  }

  return (
    <StyledBox ref={node as any}>
      <SelectorControls onClick={() => setOpen(true)}>
        <Flex alignItems="center">
          <Logo src={CHAIN_INFO[chainId].logoUrl} />
          <NetworkCardWrapper style={{ color: '#292933', marginRight: '10px' }}>
            {NETWORK_LABELS[chainId]}
          </NetworkCardWrapper>
        </Flex>

        <ChevronElement showMore={open} />
      </SelectorControls>

      {open && (
        <FlyoutMenu>
          {CHAINS.map((chain: any) => {
            const targetChain = chain.id
            return (
              <FlyoutRow key={targetChain} onClick={() => handleRowClick(targetChain)}>
                <Logo src={CHAIN_INFO[targetChain].logoUrl} />
                <NetworkLabel>{chain.name}</NetworkLabel>
                {chainId === targetChain && <Checked />}
              </FlyoutRow>
            )
          })}
        </FlyoutMenu>
      )}
    </StyledBox>
  )
}

const SelectorControls = styled(VioletCard)`
  cursor: pointer;
  padding: 2px 3px;
  background: transparent;
  width: 180px;
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
  font-size: 14px;

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
     max-width: min-content;
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
  font-size: 14px;
  overflow: auto;
  padding: 6px 24px;
  position: absolute;
  top: 70px;
  width: 210px;
  z-index: 2;
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
const FlyoutRow = styled.div`
  align-items: center;
  cursor: pointer;
  display: flex;
  font-weight: 500;
  justify-content: space-between;
  padding: 18px 0;
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

const StyledBox = styled.div`
  border: 1px solid #e6e6ff;
  padding: 10px;
  border-radius: 6px;
  ${({ theme }) => theme.mediaWidth.upToMedium`
     padding: 10px 20px 10px 20px;
  `};
  :active {
    border: 1px solid #4d8fea;
  }
  position: relative;
`
