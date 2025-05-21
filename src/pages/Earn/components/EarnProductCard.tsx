import React from 'react'
import styled from 'styled-components/macro'
import { Trans } from '@lingui/macro'
import { ButtonPrimary } from 'components/Button'

// Using a local interface to avoid Redux dependency issues
interface EarnProduct {
  id: string
  name: string
  asset: string
  apy: number
  description: string
  iconUrl: string | null
  tvl?: number
  underlyingAsset?: string
}

interface EarnProductCardProps {
  product: EarnProduct
  onClick: () => void
}

export function EarnProductCard({ product, onClick }: EarnProductCardProps) {
  return (
    <CardContainer onClick={onClick}>
      <CardContent>
        <ProductNameRow>
          <ProductIcon>
            {product.iconUrl ? (
              <img src={product.iconUrl} alt={product.asset} />
            ) : (
              <AssetCircle>{product.asset[0]}</AssetCircle>
            )}
          </ProductIcon>
          <div>
            <ProductName>{product.name}</ProductName>
            <ProductDescription>{product.description}</ProductDescription>
          </div>
        </ProductNameRow>
        
        <InfoRow>
          <InfoCard>
            <InfoLabel>Underlying Asset</InfoLabel>
            <InfoValue>{product.underlyingAsset || product.asset}</InfoValue>
          </InfoCard>
          
          <InfoCard>
            <InfoLabel>Annual Percentage Rate</InfoLabel>
            <APYValue>{product.apy.toFixed(2)}%</APYValue>
          </InfoCard>
        </InfoRow>
        
        <ButtonContainer>
          <ViewDetailsButton onClick={(e) => { e.stopPropagation(); onClick(); }}>
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
  
  &:hover {
    transform: translateY(-4px);
  }
`

const CardContent = styled.div`
  padding: 24px;
`

const ProductNameRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
`

const ProductIcon = styled.div`
  margin-right: 16px;
  
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
`

const ProductName = styled.div`
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 4px;
  color: ${({ theme }) => theme.text1};
`

const ProductDescription = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.text2};
`

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  margin-bottom: 24px;
  gap: 16px;
`

const InfoCard = styled.div`
  background: ${({ theme }) => theme.bg2};
  border-radius: 12px;
  padding: 16px;
  min-width: calc(50% - 8px);
  flex: 1;
`

const InfoLabel = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.text2};
  margin-bottom: 8px;
`

const InfoValue = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.text1};
`

const APYValue = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: ${({ theme }) => theme.primary1};
`

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
`

const ViewDetailsButton = styled(ButtonPrimary)`
  min-width: 120px;
` 