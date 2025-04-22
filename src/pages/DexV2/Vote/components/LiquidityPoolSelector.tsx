import { PoolsHasGauge } from 'hooks/dex-v2/queries/usePoolsHasGaugeQuery'
import AssetSet from 'pages/DexV2/common/AssetSet'
import React from 'react'
import { Box, Flex } from 'rebass'
import styled from 'styled-components'

interface Props {
  pools: PoolsHasGauge[]
}

export const LiquidityPoolSelector: React.FC<Props> = ({ pools }) => {
  return (
    <Container>
      <ContentWrapper>
        <Table>
          <TableHead>
            <tr>
              <TableHeader>Pools</TableHeader>
              <TableHeader>Fees</TableHeader>
              <TableHeader>Incentives</TableHeader>
              <TableHeader>Total Rewards</TableHeader>
              <TableHeader>vAPR</TableHeader>
            </tr>
          </TableHead>
          <tbody>
            {pools.map((pool) => (
              <TableRow key={pool.id}>
                <TableCell>
                  <Flex alignItems="center" css={{ gap: '8px', height: '32px' }}>
                    <AssetSet width={50} addresses={pool.tokensList} />
                    <Box fontSize="16px" fontWeight={600}>
                      {pool.name}
                    </Box>
                  </Flex>
                </TableCell>
                <TableCell>0.02%</TableCell>
                <TableCell>$3,084.04</TableCell>
                <TableCell>123,81%</TableCell>
                <TableCell>487,6%</TableCell>
              </TableRow>
            ))}

            {/* Add more rows as necessary */}
          </tbody>
        </Table>
      </ContentWrapper>
    </Container>
  )
}

// Styled Components
const Container = styled.section`
  background-color: #fff;
  display: flex;
  padding: 80px 210px;
  flex-direction: column;
  align-items: stretch;

  @media (max-width: 1440px) {
    padding: 80px 32px;
  }
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
