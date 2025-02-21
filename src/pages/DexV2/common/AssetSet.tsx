import React, { useMemo } from 'react'
import { Flex, Box } from 'rebass'
import styled from 'styled-components'
import { chunk } from 'lodash'
import { isAddress } from '@ethersproject/address'
import Asset from './Asset'

// Types for Asset props (adjust as needed)
export interface IBalAssetProps {
  address?: string
  iconURI?: string
  size?: number
  button?: boolean
  disabled?: boolean
  ringSize?: number
}

// Props for our AssetSet component
export interface AssetSetProps {
  addresses?: string[]
  disabledAddresses?: string[]
  logoURIs?: string[]
  balAssetProps?: IBalAssetProps
  width?: number
  size?: number
  maxAssetsPerLine?: number
  wrap?: boolean
  ringSize?: number
  onClick?: (addressOrURI: string) => void
}

// A styled Flex container for each row.
// It applies relative positioning and a bottom margin unless it’s the last row.
const AddressesRow = styled(Flex)<{ isLastRow: boolean }>`
  position: relative;
  z-index: 0;
  flex-wrap: nowrap;
  margin-bottom: ${(props) => (props.isLastRow ? '0' : '12px')};
  gap: 0.5rem;
`

// (Optional) A styled component for the asset container.
// Here we mimic the token-icon styling.
const TokenIconWrapper = styled(Box)`
  margin-left: -2px;
  border-radius: 9999px;
  overflow: hidden;
  background-color: white;
`

const AssetSet: React.FC<AssetSetProps> = ({
  addresses = [],
  disabledAddresses = [],
  logoURIs = [],
  balAssetProps = {},
  width = 200,
  size = 26,
  maxAssetsPerLine = 8,
  wrap = false,
  ringSize = 2,
  onClick,
}) => {
  // Determine if we’re using addresses or logoURIs
  const hasAddresses = addresses && addresses.length > 0
  const hasURIs = logoURIs && logoURIs.length > 0

  // Compute the number of assets
  const assetLength = useMemo(() => {
    if (hasAddresses) return addresses.length
    if (hasURIs) return logoURIs.length
    return 0
  }, [addresses, logoURIs, hasAddresses, hasURIs])

  // Chunk the assets into rows using lodash’s chunk
  const assetChunks = useMemo(() => {
    if (hasAddresses) return chunk(addresses, maxAssetsPerLine)
    if (hasURIs) return chunk(logoURIs, maxAssetsPerLine)
    return []
  }, [addresses, logoURIs, maxAssetsPerLine, hasAddresses, hasURIs])

  // For positioning calculations
  const radius = size / 2
  const smallSetSpacer = addresses.length < 4 ? 30 : 0
  const spacer = assetLength > 0 ? (maxAssetsPerLine / assetLength - 1) * (radius * 2) + smallSetSpacer : 0

  // Compute a ring class name based on ringSize (adjust if you have corresponding CSS)
  const computedRingClass = ringSize === 1 ? 'ring-1' : 'ring-2'

  // Returns the left offset for each asset if wrap is false.
  const leftOffsetFor = (i: number) => {
    if (wrap) return 0
    return ((width - radius * 2 + spacer) / (maxAssetsPerLine - 1)) * i
  }

  // Returns the props for the Asset component based on the value
  const assetAttrsFor = (addressOrURI: string): IBalAssetProps => {
    const addressOrURIProp = isAddress(addressOrURI) ? { address: addressOrURI } : { iconURI: addressOrURI }
    return {
      ...addressOrURIProp,
      disabled: disabledAddresses.includes(addressOrURI),
    }
  }

  // Computes inline styles for each Asset (adjusting width/height on later rows)
  const getBalAssetStyle = (assetRowIndex: number, assetIndex: number) => {
    const assetDimension = assetRowIndex > 2 ? 24 : size
    return {
      position: wrap ? 'relative' : 'absolute',
      left: leftOffsetFor(assetIndex),
      zIndex: 20 - assetIndex,
      width: assetDimension,
      height: assetDimension,
    }
  }

  console.log('assetChunks', assetChunks)
  return (
    <>
      {assetChunks.map((assetChunk, assetChunkIndex) => (
        <AddressesRow
          key={assetChunkIndex}
          isLastRow={assetChunkIndex === assetChunks.length - 1}
          sx={{ width, height: size, position: 'relative' }}
        >
          {assetChunk.map((addressOrURI, i) => (
            <Box
              key={i}
              // Using Rebass's sx prop to apply inline styles from our function
              sx={getBalAssetStyle(assetChunkIndex, i)}
              onClick={() => onClick && onClick(addressOrURI)}
              // Combine any class names (if you use CSS for rings, dark mode, etc.)
              className={`token-icon ${computedRingClass} ring-white dark:ring-gray-800 group-hover:ring-gray-50 dark:group-hover:ring-gray-800`}
            >
              <Asset {...assetAttrsFor(addressOrURI)} {...balAssetProps} size={size} />
            </Box>
          ))}
        </AddressesRow>
      ))}
    </>
  )
}

export default AssetSet
