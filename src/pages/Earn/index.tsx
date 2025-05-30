import React from 'react'
import styled from 'styled-components/macro'
import { useHistory } from 'react-router-dom'

import { routes } from 'utils/routes'
import { EarnProductCard } from './components/EarnProductCard'
import { products } from './products'

export default function Earn() {
  const history = useHistory()

  const handleViewProduct = (id: string) => {
    history.push(routes.earnProduct(id))
  }

  return (
    <PageWrapper>
      <Title>
        Institutional-Grade
        <br /> Yield Solutions Backed <br /> by Real-World Assets
      </Title>

      <SubTitle>
        IXS offers regulated, secure, and scalable stablecoin yield strategies tailored for institutional investors and
        fintech platforms. Our yield products are underpinned by real-world assets and designed to meet the risk,
        return, and compliance expectations of the next generation of financial infrastructure.
      </SubTitle>

      {products.length > 0 && (
        <ProductsGrid>
          {products.map((product) => (
            <EarnProductCard key={product.id} product={product} onClick={() => handleViewProduct(product.id)} />
          ))}
        </ProductsGrid>
      )}
    </PageWrapper>
  )
}

const Title = styled.div`
  color: #292933;
  font-family: Inter;
  font-style: normal;
  font-weight: 700;
  font-size: 32px;
  line-height: 120%;
  letter-spacing: -1.6px;

  @media (min-width: 768px) {
    line-height: 110%;
    letter-spacing: -2.56px;
    margin-top: 16px;
    font-size: 64px;
  }
`

const SubTitle = styled.div`
  max-width: 600px;
  font-family: Inter;
  font-size: 14px;
  color: #8f8fb2;
  font-style: normal;
  font-weight: 400;
  line-height: 140%;
  letter-spacing: -0.28px;
  margin-top: 24px;

  @media (min-width: 768px) {
    font-size: 16px;
    line-height: 160%;
    letter-spacing: -0.32px;
    margin-top: 32px;
  }
`

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  margin-bottom: 40px;
  margin-top: 40px;

  @media (min-width: 768px) {
    margin-top: 48px;
    grid-template-columns: 1fr 1fr;
  }
`

const PageWrapper = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 16px;
`
