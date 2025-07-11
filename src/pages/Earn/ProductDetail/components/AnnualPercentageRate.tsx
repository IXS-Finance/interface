import React, { useEffect, useState } from 'react'
import styled from 'styled-components/macro'
import { getPublicClient, readContract } from '@wagmi/core'

import LoadingBlock from '../../components/LoadingBlock'
import OpenTradeABI from '../../abis/OpenTrade.json'
import { wagmiConfig } from 'components/Web3Provider'

interface AnnualPercentageRateProps {
  chainId: number
  opentradeVaultAddress: string | undefined
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

export const AnnualPercentageRate: React.FC<AnnualPercentageRateProps> = ({ opentradeVaultAddress, chainId }) => {
  const [indicativeInterestRatePercentage, setIndicativeInterestRatePercentage] = useState('')
  const [loading, setLoading] = useState(true)

  const openTradeContract = {
    address: opentradeVaultAddress as `0x${string}` | undefined,
    abi: OpenTradeABI,
  } as const

  useEffect(() => {
    async function fetchData() {
      if (!openTradeContract.address) return
      try {
        setLoading(true)
        const client = getPublicClient(wagmiConfig, {
          chainId,
        })
        const poolDynamicOverviewStateResult: any = await getPoolDynamicOverviewStateForClient(
          client,
          openTradeContract,
          chainId
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
    <InfoCard>
      <InfoCardLabel>Annual Percentage Rate</InfoCardLabel>

      {loading ? (
        <LoadingBlock className="rate-number" />
      ) : (
        <ApyBigText>{indicativeInterestRatePercentage}%</ApyBigText>
      )}
    </InfoCard>
  )
}

const InfoCard = styled.div`
  border-radius: 16px;
  background: #fff;
  box-shadow: 0px 30px 48px 0px rgba(63, 63, 132, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex: 1 0 0;
  align-self: stretch;
  padding: 24px;

  @media (min-width: 768px) {
    padding: 40px;
  }

  .rate-number {
    width: 187px;
    height: 60px;
  }
`

const InfoCardLabel = styled.div`
  color: #8f8fb2;
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  letter-spacing: -0.28px;

  @media (min-width: 768px) {
    font-size: 16px;
  }
`

const ApyBigText = styled.div`
  color: #66f;
  text-align: right;
  font-family: Inter;
  font-size: 40px;
  font-style: normal;
  font-weight: 700;
  line-height: 60px; /* 150% */
  letter-spacing: -1.6px;

  @media (min-width: 768px) {
    color: #66f;
    font-size: 64px;
    line-height: 60px; /* 93.75% */
    letter-spacing: -2.56px;
  }
`
