import React from 'react'
import styled from 'styled-components/macro'
import { isMobile } from 'react-device-detect'
import { Address } from 'viem'
import Asset from 'pages/DexV2/common/Asset'

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

const StyledAsset = styled(Asset)<{ left: number }>`
  position: absolute;
  left: ${({ left }) => left}px;
`

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
      {tokens?.map((tokenAddress, i) => (
        <StyledAsset address={tokenAddress} key={`asset-${tokenAddress}`} left={leftOffsetFor(i)} />
      ))}
    </Wrapper>
  )
}
