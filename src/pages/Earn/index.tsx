import React, { useState } from 'react'
import styled from 'styled-components/macro'
import { Trans } from '@lingui/macro'
import { useHistory } from 'react-router-dom'

import { routes } from 'utils/routes'
import { useActiveWeb3React } from 'hooks/web3'
import { ButtonPrimary } from 'components/Button'
import { EarnProductCard } from './components/EarnProductCard'
import { products } from './products' // Import products from products.ts file

// Define product interface to match what EarnProductCard expects
interface EarnProduct {
  id: string
  name: string
  asset: string
  apy: number
  description: string
  iconUrl: string | null
  tvl?: number
  underlyingAsset?: string
  network?: string // blockchain network: 'ethereum', 'polygon', etc.
  address?: string // contract address of the vault
}

export default function Earn() {
  const history = useHistory()
  const { account } = useActiveWeb3React()
  
  // Replace useEarnProducts with local mock data
  const [loading] = useState(false)
  
  // Featured product is the first one
  const featuredProduct = products[0]

  const handleViewProduct = (id: string) => {
    history.push(routes.earnProduct(id))
  }

  return (
    <PageWrapper>
      <EarnHeader>
        <Text fontSize={32} fontWeight={600}>Earn</Text>
      </EarnHeader>

      {/* Featured Product */}
      <FeaturedProductCard onClick={() => handleViewProduct(featuredProduct.id)}>
        <Flex flexDirection={['column', 'row']} width="100%">
          <TreasuryContent>
            <Text fontSize={[32, 42]} fontWeight={600} mb={3} color="#1F1F1F">
              {featuredProduct.name}
            </Text>
            
            <Flex alignItems="center" mb={4}>
              <IconWrapper>
                <img src="/images/tokens/usdc.png" alt="USDC" width="24" height="24" />
              </IconWrapper>
              <Text fontSize={16} fontWeight={500} color="#666666">
                {featuredProduct.description}
              </Text>
              <LearnMoreLink>Learn more</LearnMoreLink>
            </Flex>

            <InfoCardContainer>
              <InfoCard>
                <Text fontSize={14} color="#666666" mb={1}>
                  Underlying Asset
                </Text>
                <Text fontSize={16} fontWeight={600} color="#1F1F1F">
                  {featuredProduct.underlyingAsset}
                </Text>
              </InfoCard>

              <InfoCard>
                <Text fontSize={14} color="#666666" mb={1}>
                  Annual Percentage Rate
                </Text>
                <ApyValue>{featuredProduct.apy.toFixed(2)}%</ApyValue>
              </InfoCard>
            </InfoCardContainer>
          </TreasuryContent>

          <TreasuryImage />
        </Flex>
      </FeaturedProductCard>

      {/* All Products */}
      {products.length > 0 && (
        <>
          <Text fontSize={24} fontWeight={600} mt={5} mb={4}>
            <Trans>All earning opportunities</Trans>
          </Text>
          
          <ProductsGrid>
            {products.map((product) => (
              <EarnProductCard 
                key={product.id} 
                product={product}
                onClick={() => handleViewProduct(product.id)}
              />
            ))}
          </ProductsGrid>
        </>
      )}
      
      {!account && (
        <ConnectWalletBanner>
          <Text fontSize={18} fontWeight={500} mb={3}>
            <Trans>Connect your wallet to start earning</Trans>
          </Text>
          <ButtonPrimary>
            <Trans>Connect Wallet</Trans>
          </ButtonPrimary>
        </ConnectWalletBanner>
      )}
    </PageWrapper>
  )
}

// Styled Components
const EarnHeader = styled.div`
  margin-bottom: 32px;
`

const FeaturedProductCard = styled.div`
  background: ${({ theme }) => theme.bg1};
  border-radius: 20px;
  padding: 32px;
  margin-bottom: 32px;
  box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.05);
  width: 100%;
  cursor: pointer;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: translateY(-4px);
  }
`

const TreasuryContent = styled.div`
  flex: 1;
  padding-right: 40px;
  
  @media (max-width: 768px) {
    padding-right: 0;
    padding-bottom: 24px;
  }
`

const TreasuryImage = styled.div`
  flex: 1;
  background-image: url('/images/treasury-illustration.png');
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  min-height: 240px;
  
  @media (max-width: 768px) {
    min-height: 180px;
  }
`

const IconWrapper = styled.div`
  margin-right: 8px;
`

const LearnMoreLink = styled.div`
  color: ${({ theme }) => theme.primary1};
  font-size: 14px;
  font-weight: 500;
  margin-left: 8px;
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
  }
`

const InfoCardContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 32px;
`

const InfoCard = styled.div`
  background: ${({ theme }) => theme.bg2};
  border-radius: 12px;
  padding: 16px 24px;
  min-width: 200px;
  flex: 1;
`

const ApyValue = styled.div`
  font-size: 40px;
  font-weight: 700;
  color: ${({ theme }) => theme.primary1};
`

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
`

const ConnectWalletBanner = styled.div`
  background: ${({ theme }) => theme.bg2};
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  margin-top: 32px;
` 

// This would typically come from a shared components module
const PageWrapper = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px;
`

const Text = styled.div<{
  fontSize?: number | number[]
  fontWeight?: number
  color?: string
  mb?: number
  mt?: number
}>`
  font-size: ${({ fontSize }) => 
    typeof fontSize === 'number' 
      ? `${fontSize}px` 
      : fontSize 
        ? `${fontSize[0]}px` 
        : '16px'
  };
  font-weight: ${({ fontWeight }) => fontWeight || 400};
  color: ${({ color, theme }) => (color ? color : theme.text1)};
  margin-bottom: ${({ mb }) => mb ? `${mb * 8}px` : 0};
  margin-top: ${({ mt }) => mt ? `${mt * 8}px` : 0};
`

const Flex = styled.div<{
  flexDirection?: string | string[]
  justifyContent?: string
  alignItems?: string
  width?: string
  mb?: number
  mt?: number
  flexWrap?: string
}>`
  display: flex;
  flex-direction: ${({ flexDirection }) => 
    Array.isArray(flexDirection) 
      ? flexDirection[0] 
      : flexDirection || 'row'
  };
  justify-content: ${({ justifyContent }) => justifyContent || 'flex-start'};
  align-items: ${({ alignItems }) => alignItems || 'stretch'};
  width: ${({ width }) => width || 'auto'};
  margin-bottom: ${({ mb }) => mb ? `${mb * 8}px` : 0};
  margin-top: ${({ mt }) => mt ? `${mt * 8}px` : 0};
  flex-wrap: ${({ flexWrap }) => flexWrap || 'nowrap'};
  
  @media (min-width: 768px) {
    flex-direction: ${({ flexDirection }) => 
      Array.isArray(flexDirection) && flexDirection.length > 1 
        ? flexDirection[1] 
        : Array.isArray(flexDirection) 
          ? flexDirection[0] 
          : flexDirection || 'row'
    };
  }
`