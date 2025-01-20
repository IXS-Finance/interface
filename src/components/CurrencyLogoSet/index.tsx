import React from 'react'
import styled from 'styled-components/macro'
import CurrencyLogo from '../CurrencyLogo'
import { isMobile } from 'react-device-detect'
import { useCurrency } from 'hooks/Tokens'
import { Address } from 'viem'

const Wrapper = styled.div<{ margin: boolean; sizeraw: number }>`
  position: relative;
  display: flex;
  flex-direction: row;
  margin-left: ${({ sizeraw, margin }) => margin && (sizeraw / 3 + 8).toString() + 'px'};
`

export interface DoubleCurrencyLogoProps {
  margin?: boolean
  size?: number
  tokens?: Address[]
}

const StyledLogo = styled(CurrencyLogo)<{ left: number }>`
  position: absolute;
  left: ${({ left }) => left}px;
`

function LogoWrapper({ token, left, size }: { token: Address; left: number; size: string }) {
  const currency = useCurrency(token)
  return <StyledLogo currency={currency} left={left} size={size} />
}

export default function CurrencyLogoSet({
  tokens,
  size = isMobile ? 16 : 10,
  margin = false,
}: DoubleCurrencyLogoProps) {
  const maxAssetsPerLine = 5

  const assetLength = tokens?.length || 0
  const smallSetSpacer = assetLength < 4 ? 30 : 0
  const spacer = (maxAssetsPerLine / assetLength - 1) * ((size / 2) * 2) + smallSetSpacer
  function leftOffsetFor(i: number) {
    return ((size - (size / 2) * 2 + spacer) / (maxAssetsPerLine - 1)) * i
  }

  return (
    <Wrapper sizeraw={size} margin={margin}>
      {tokens?.map((token, i) => (
        <LogoWrapper key={token} token={token} left={leftOffsetFor(i)} size={size + 'px'} />
      ))}
    </Wrapper>
  )
}
