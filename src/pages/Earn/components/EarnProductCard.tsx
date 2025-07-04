import React, { useEffect, useState } from 'react'
import { getPublicClient, readContract } from '@wagmi/core'
import styled from 'styled-components/macro'
import { EarnProduct } from '../products'
import { Box, Flex } from 'rebass'
import { wagmiConfig } from 'components/Web3Provider'
import OpenTradeABI from '../abis/OpenTrade.json'
import LoadingBlock from './LoadingBlock'

interface EarnProductCardProps {
  product: EarnProduct
  onClick: () => void
}

async function getPoolDynamicOverviewStateForClient(client: any, contract: any, chainId: number) {
  if (!contract.address) return null
  return await readContract(wagmiConfig, {
    ...contract,
    functionName: 'getPoolDynamicOverviewState',
    chainId,
    client,
  })
}

export function EarnProductCard({ product, onClick }: EarnProductCardProps) {
  const [indicativeInterestRatePercentage, setIndicativeInterestRatePercentage] = useState('')
  const [loading, setLoading] = useState(true)

  const openTradeContract = {
    address: product?.opentradeVaultAddress as `0x${string}` | undefined,
    abi: OpenTradeABI,
  } as const

  useEffect(() => {
    async function fetchData() {
      if (!openTradeContract.address) return
      try {
        setLoading(true)
        const client = getPublicClient(wagmiConfig, {
          chainId: product.chainId,
        })
        const poolDynamicOverviewStateResult: any = await getPoolDynamicOverviewStateForClient(
          client,
          openTradeContract,
          product.chainId
        )
        const indicativeInterestRate = (poolDynamicOverviewStateResult?.indicativeInterestRate || 0).toString()
        const finalRate = (parseFloat(indicativeInterestRate) / 100).toFixed(2)

        setIndicativeInterestRatePercentage(finalRate)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching pool dynamic overview state:', error)
        setIndicativeInterestRatePercentage('N/A')
        setLoading(false)
      }
    }
    fetchData()
  }, [openTradeContract.address])

  return (
    <CardContainer cornerImageUrl={product.bgUrl}>
      <Flex flexDirection="column" height="100%" justifyContent="space-between">
        <Flex justifyContent="space-between">
          <div>
            {loading ? (
              <LoadingBlock className="rate-number" />
            ) : (
              <Box
                sx={{
                  color: '#66F',
                  fontFamily: 'Inter',
                  fontSize: ['28px', '36px', '48px'],
                  fontStyle: 'normal',
                  fontWeight: 700,
                  lineHeight: 'normal',
                  letterSpacing: ['-1.1px', '-1.5px', '-1.92px'],
                }}
              >
                {indicativeInterestRatePercentage}%
              </Box>
            )}

            <Box
              sx={{
                color: '#8F8FB2',
                fontFamily: 'Inter',
                fontSize: ['12px', '13px', '14px'],
                fontStyle: 'normal',
                fontWeight: 500,
                lineHeight: 'normal',
                letterSpacing: ['-0.15px', '-0.22px', '-0.28px'],
              }}
            >
              Annual Percentage Rate
            </Box>
          </div>
          <div>
            <Box
              sx={{
                color: 'rgba(41, 41, 51, 0.90)',
                textAlign: 'right',
                fontFamily: 'Inter',
                fontSize: ['12px', '13px', '14px'],
                fontStyle: 'normal',
                fontWeight: 600,
                lineHeight: 'normal',
                letterSpacing: ['-0.25px', '-0.32px', '-0.42px'],
                paddingBottom: ['4px', '5px', '6px'],
              }}
            >
              {product.underlyingAsset || product.investingTokenSymbol}
            </Box>
            <Box
              sx={{
                color: '#8F8FB2',
                fontFamily: 'Inter',
                fontSize: ['12px', '13px', '14px'],
                fontStyle: 'normal',
                fontWeight: 500,
                lineHeight: 'normal',
                letterSpacing: ['-0.15px', '-0.22px', '-0.28px'],
                textAlign: 'right',
              }}
            >
              Underlying Asset
            </Box>
          </div>
        </Flex>
        <div>
          <Box
            sx={{
              color: 'rgba(41, 41, 51, 0.90)',
              fontFamily: 'Inter',
              fontSize: ['20px', '24px', '32px'],
              fontStyle: 'normal',
              fontWeight: 600,
              lineHeight: 'normal',
              letterSpacing: ['-0.5px', '-0.7px', '-0.96px'],
              maxWidth: ['180px', '200px', '239px'],
              marginBottom: ['6px', '7px', '8px'],
            }}
          >
            {product.name}
          </Box>
          <Box
            sx={{
              color: '#8F8FB2',
              fontFamily: 'Inter',
              fontSize: ['12px', '13px', '14px'],
              fontStyle: 'normal',
              fontWeight: 500,
              lineHeight: 'normal',
              letterSpacing: ['-0.24px', '-0.33px', '-0.42px'],
              marginBottom: ['16px', '20px', '24px'],
              width: ['60%', '100%', '100%'],
            }}
          >
            {product.description}
          </Box>
          <InvestButton onClick={onClick}>Invest</InvestButton>
        </div>
      </Flex>
    </CardContainer>
  )
}

const CardContainer = styled.div<{ cornerImageUrl: string }>`
  border-radius: 16px;
  background: #fff;
  box-shadow: 0px 30px 48px 0px rgba(63, 63, 132, 0.05);
  transition: transform 0.2s ease;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 300px;
  position: relative;
  padding: 24px;
  ${({ cornerImageUrl }) =>
    `
      background-image: url(${cornerImageUrl});
      background-repeat: no-repeat;
      background-size: 150px 200px;
      background-position: bottom right;
    `}

  @media (min-width: 768px) {
    min-height: 476px;
    padding: 51px 54px;
    background-size: 200px 300px;
  }

  &:hover {
    transform: translateY(-4px);
  }

  .rate-number {
    width: 154px;
    height: 59px;
  }
`

const InvestButton = styled.button`
  border-radius: 6px;
  background: #66f;
  display: flex;
  height: 50px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1px;
  color: #fff;
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  letter-spacing: -0.28px;
  border: none;
  padding: 16px 42px;
  cursor: pointer;

  &:hover {
    background: #55e;
  }

  &:active {
    background: #44d;
  }

  @media (max-width: 600px) {
    font-size: 12px;
    height: 40px;
    padding: 12px 20px;
    letter-spacing: -0.18px;
  }
`
