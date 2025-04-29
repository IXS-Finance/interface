import React from 'react'
import { Box, Flex } from 'rebass'
import styled from 'styled-components'
import get from 'lodash/get'
import { formatUnits } from '@ethersproject/units'
import dayjs from 'dayjs'

import { PoolsHasGauge } from 'hooks/dex-v2/queries/usePoolsHasGaugeQuery'
import AssetSet from 'pages/DexV2/common/AssetSet'

interface Props {
  pools: PoolsHasGauge[]
  data: any
}

export const VoteHistoryRecords: React.FC<Props> = ({ pools, data }) => {
  const voteHistories = get(data, 'voteHistories', [])

  return (
    <Container>
      <Title>Vote History Records</Title>
      <ContentWrapper>
        <Table>
          <TableHead>
            <tr>
              <TableHeader>Date</TableHeader>
              <TableHeader>Pool</TableHeader>
              <TableHeader>Weight</TableHeader>
              <TableHeader>Lock</TableHeader>
            </tr>
          </TableHead>
          <tbody>
            {voteHistories.map((item: any) => {
              const weight = formatUnits(item.weight, 18)
              const totalWeight = formatUnits(item.totalWeight, 18)

              const weightPercentage = (Number(weight) / Number(totalWeight)) * 100

              const pool = pools.find((pool) => pool.address === item.pool)
              const date = dayjs.unix(Number(item.timestamp)).format('YYYY-MM-DD HH:mm')

              return (
                <TableRow key={item.pool}>
                  <TableCell>{date || '---'}</TableCell>
                  <TableCell>
                    <Flex alignItems="center" css={{ gap: '8px', height: '32px' }}>
                      {pool?.tokensList ? <AssetSet width={50} addresses={pool?.tokensList} /> : null}
                      <Box fontSize="16px" fontWeight={600}>
                        {pool?.name || '---'}
                      </Box>
                    </Flex>
                  </TableCell>
                  <TableCell>{weightPercentage.toFixed(2)}%</TableCell>
                  <TableCell>
                    <Flex alignItems="center" css={{ gap: '8px', height: '32px' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="11" height="14" viewBox="0 0 11 14" fill="none">
                        <path
                          d="M8.5 7H9.55C9.79855 7 10 7.20145 10 7.45V12.55C10 12.7985 9.79855 13 9.55 13H1.45C1.20147 13 1 12.7985 1 12.55V7.45C1 7.20145 1.20147 7 1.45 7H2.5M8.5 7V4C8.5 3 7.9 1 5.5 1C3.1 1 2.5 3 2.5 4V7M8.5 7H2.5"
                          stroke="#B8B8D2"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      Lock #{item.tokenId}
                    </Flex>
                  </TableCell>
                </TableRow>
              )
            })}

            {/* Add more rows as necessary */}
          </tbody>
        </Table>
      </ContentWrapper>
    </Container>
  )
}

const Container = styled.section`
  border-radius: 16px;
  background: #fff;
  box-shadow: 0px 30px 48px 0px rgba(63, 63, 132, 0.05);
  width: 1180px;
  margin: 0 auto;
  display: flex;
  padding: 48px;
  flex-direction: column;
  align-items: stretch;

  @media (max-width: 1440px) {
    padding: 80px 32px;
  }
`

const Title = styled(Box)`
  color: #292933;
  font-family: 'Inter';
  font-size: 32px;
  font-style: normal;
  font-weight: 600;
  line-height: 120%;
  letter-spacing: -0.96px;
`

const ContentWrapper = styled.div`
  align-self: center;
  width: 100%;
  max-width: 1180px;

  @media (max-width: 991px) {
    max-width: 100%;
  }
`

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
`

// Table header section styling
const TableHead = styled.thead`
  background-color: #fff;
`

// Styling for each header cell
const TableHeader = styled.th`
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid rgba(230, 230, 255, 0.6);
  color: #8f8fb2;
  font-size: 14px;
  font-weight: 500;
`

// Styling for table rows with a bottom border for each row (except the last one)
const TableRow = styled.tr`
  background-color: #fff;
  border-bottom: 1px solid rgba(230, 230, 255, 0.6);
`

// Table cells – remove the border property.
const TableCell = styled.td`
  padding: 12px;
  color: #292933;
  font-size: 14px;
  font-weight: 500;
`
