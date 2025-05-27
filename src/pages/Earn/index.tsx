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

      {/* Banner Placeholder */}
      <BannerPlaceholder>
        <Flex justifyContent="center" alignItems="center" width="100%">
          <Text fontSize={24} fontWeight={500} color="#666666">
            Featured instituional-grade yield opportunities
          </Text>
        </Flex>
      </BannerPlaceholder>

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
    </PageWrapper>
  )
}

// Styled Components
const EarnHeader = styled.div`
  margin-bottom: 32px;
`

const BannerPlaceholder = styled.div`
  background: ${({ theme }) => theme.bg2};
  border: 2px dashed ${({ theme }) => theme.text3};
  border-radius: 20px;
  padding: 80px 32px;
  margin-bottom: 32px;
  width: 100%;
  min-height: 240px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  @media (max-width: 768px) {
    padding: 60px 24px;
    min-height: 180px;
  }
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