import React from 'react'
import styled from 'styled-components/macro'
import { Trans } from '@lingui/macro'
import { ButtonPrimary } from 'components/Button'
import { EarnProduct } from '../products'

interface EarnProductCardProps {
  product: EarnProduct
  onClick: () => void
}

// Add these constants at the top of the file after imports
const NETWORK_ICONS = {
  ethereum: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png',
  avalanche: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/avalanchec/info/logo.png',
}

export function EarnProductCard({ product, onClick }: EarnProductCardProps) {
  return (
    <CardContainer onClick={onClick}>
      <CardImage>
        <ImagePlaceholder>
          <PlaceholderIcon>🖼️</PlaceholderIcon>
          <PlaceholderText>Product Image</PlaceholderText>
        </ImagePlaceholder>
        {/* Updated to use hardcoded icons for now */}
        <NetworkIcons>
          <NetworkIcon>
            <img src={NETWORK_ICONS.ethereum} alt="Ethereum" />
          </NetworkIcon>
          <NetworkIcon>
            <img src={NETWORK_ICONS.avalanche} alt="Avalanche" />
          </NetworkIcon>
        </NetworkIcons>
      </CardImage>
      <CardContent>
        <ProductNameRow>
          <ProductIcon>
            {product.iconUrl ? (
              <img src={product.iconUrl} alt={product.investingTokenSymbol} />
            ) : (
              <AssetCircle>{product.investingTokenSymbol}</AssetCircle>
            )}
          </ProductIcon>
          <ProductInfo>
            <ProductName>{product.name}</ProductName>
            <ProductDescription>{product.description}</ProductDescription>
          </ProductInfo>
        </ProductNameRow>

        <InfoRow>
          <InfoCard>
            <InfoLabel>Underlying Asset</InfoLabel>
            <InfoValue>{product.underlyingAsset || product.investingTokenSymbol}</InfoValue>
          </InfoCard>

          <InfoCard>
            <InfoLabel>Annual Percentage Rate</InfoLabel>
            <APYValue>{product.apy.toFixed(2)}%</APYValue>
          </InfoCard>
        </InfoRow>

        <ButtonContainer>
          <ViewDetailsButton
            onClick={(e) => {
              e.stopPropagation()
              onClick()
            }}
          >
            <Trans>View Details</Trans>
          </ViewDetailsButton>
        </ButtonContainer>
      </CardContent>
    </CardContainer>
  )
}

const CardContainer = styled.div`
  background: ${({ theme }) => theme.bg1};
  border-radius: 16px;
  box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  height: 100%;

  &:hover {
    transform: translateY(-4px);
  }
`

const CardImage = styled.div`
  width: 100%;
  height: 160px;
  border-radius: 16px 16px 0 0;
  overflow: hidden;
  background: ${({ theme }) => theme.bg2};
  position: relative;
  flex-shrink: 0;
`

const ImagePlaceholder = styled.div`
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, ${({ theme }) => theme.bg2} 0%, ${({ theme }) => theme.bg3} 100%);
  border: 2px dashed ${({ theme }) => theme.text4};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
`

const PlaceholderIcon = styled.div`
  font-size: 32px;
  opacity: 0.5;
`

const PlaceholderText = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.text3};
  font-weight: 500;
`

const CardContent = styled.div`
  padding: 24px;
  display: flex;
  flex-direction: column;
  flex: 1;
`

const ProductNameRow = styled.div`
  display: flex;
  align-items: flex-start;
  margin-bottom: 20px;
  min-height: 60px;
`

const ProductIcon = styled.div`
  margin-right: 16px;
  flex-shrink: 0;

  img {
    width: 40px;
    height: 40px;
    border-radius: 50%;
  }
`

const AssetCircle = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${({ theme }) => theme.primary1};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 16px;
  flex-shrink: 0;
`

const ProductInfo = styled.div`
  flex: 1;
  min-width: 0;
`

const ProductName = styled.div`
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 4px;
  color: ${({ theme }) => theme.text1};
  line-height: 1.2;
`

const ProductDescription = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.text2};
  line-height: 1.4;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`

const InfoRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
  flex: 1;
`

const InfoCard = styled.div`
  background: ${({ theme }) => theme.bg2};
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  height: 100%;
`

const InfoLabel = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.text2};
  margin-bottom: 8px;
  flex-shrink: 0;
`

const InfoValue = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.text1};
  flex: 1;
  display: flex;
  align-items: center;
`

const APYValue = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: ${({ theme }) => theme.primary1};
  flex: 1;
  display: flex;
  align-items: center;
`

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: auto;
`

const ViewDetailsButton = styled(ButtonPrimary)`
  min-width: 120px;
`

const NetworkIcons = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  flex-direction: row-reverse;
  gap: -8px;
`

const NetworkIcon = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: white;
  border: 1px solid white;
  overflow: hidden;
  box-shadow: 0px 1px 4px rgba(0, 0, 0, 0.15);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &:not(:last-child) {
    margin-left: -6px;
  }
`

