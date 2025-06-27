import React, { useState, useMemo, useCallback } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  TableSortLabel,
} from '@mui/material'
import { styled } from '@mui/system'
import { TYPE } from 'theme'
import { EmptyTable } from '../Dashboard/EmptyTable'
import { useSubgraphQueryLegacy } from 'hooks/useSubgraphQuery'
import { useWeb3React } from 'hooks/useWeb3React'
import { unixTimeToFormat } from 'utils/time'
import { ethers } from 'ethers'
import { getTokenOption } from 'pages/LBP/components/Tokenomics'
import { useCurrency } from 'hooks/Tokens'
import { ENV_SUPPORTED_TGE_CHAINS } from 'constants/addresses'
import { getPublicAssetUrl } from 'components/TokenLogo/utils'

interface Trade {
  time: string
  tokenPrice: number
  address: string
  amount: number
  type: string
  changedAmt: number
}

interface TableProps {
  contractAddress?: any
  assetTokenAddress?: string
  shareToken?: any
}

const StyledTableCell = styled(TableCell)({
  fontSize: '14px',
  fontWeight: 500,
  color: '#8F8FB2',
})

const StyledDivBuy = styled('div')({
  border: '1px solid #1FBA6633',
  borderRadius: '4px',
  fontSize: '13px',
  fontWeight: 500,
  color: '#1FBA66',
  width: 'fit-content',
  backgroundColor: '#E9FAF0',
  padding: '6px 12px',
})

const StyledDivSell = styled('div')({
  border: '1px solid #FF616133',
  borderRadius: '4px',
  fontSize: '13px',
  fontWeight: 500,
  backgroundColor: '#FFEFF0',
  color: '#FF6161',
  padding: '6px 12px',
  width: 'fit-content',
})

const VerticalLine = styled('div')({
  width: '1px',
  height: '20px',
  backgroundColor: '#e5e5ff',
  margin: '7px 10px',
})

const StyledImage = styled('img')({
  height: '20px',
  width: '20px',
  borderRadius: '100%',
})

const StyledMUIDataTableHeadCell = styled(TableHead)({
  '& .MuiTableSortLabel-icon': {
    opacity: 1,
  },
})

const composeLatestTradeQuery = (lbpAddress: string) => {
  return `
    {
      trades(where:{ pool_:{ id:"${lbpAddress}"}}, orderBy: blockTimestamp, orderDirection: desc) {
          amountOut
          amountIn
          blockNumber
          blockTimestamp
          swapFee
          transactionHash
          type
          usdPrice
          id
          pool {
            id
            shareAddress
            assetAddress
          }
          caller {
            id
          }
      }
    }
  `
}

export default function TradeHistory({ contractAddress, assetTokenAddress, shareToken }: TableProps) {
  const { chainId, account } = useWeb3React()

  if (!chainId || !account) return null

  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [orderBy, setOrderBy] = useState<string>('')
  const [order, setOrder] = useState<'asc' | 'desc'>('asc')

  const tokenCurrency = useCurrency(assetTokenAddress)
  const tokenOption = getTokenOption(
    assetTokenAddress || '',
    tokenCurrency?.chainId || ENV_SUPPORTED_TGE_CHAINS?.[0] || 1
  )

  const handleSort = (property: string | string[]) => {
    const properties = Array.isArray(property) ? property : [property]
    const isAsc = orderBy === properties[0] && order === 'asc'
    setOrderBy(properties[0])
    setOrder(isAsc ? 'desc' : 'asc')
  }

  const getShareDecimals = (tokenAddress: string) => 18 // hardcoded for now

  const getAssetTokenDecimals = useCallback(
    (tokenAddress: string) => {
      if (!chainId) return 0

      const token = getTokenOption(ethers.utils.getAddress(tokenAddress), chainId)
      const decimals = token?.tokenDecimals
      return decimals
    },
    [chainId]
  )

  const subgraphData = useSubgraphQueryLegacy({
    feature: 'LBP',
    chainId,
    query: contractAddress ? composeLatestTradeQuery(contractAddress.toLowerCase()) : '',
    pollingInterval: 5000,
    autoPolling: true,
  })

  const trades = useMemo(() => {
    return subgraphData?.trades || []
  }, [subgraphData])

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }
  const sortedTrades = useMemo(() => {
    if (orderBy && order) {
      return [...trades].sort((a, b) => {
        let aValue, bValue
        if (orderBy === 'amountIn' || orderBy === 'amountOut') {
          aValue = parseFloat(
            ethers.utils.formatUnits(
              a[orderBy],
              a.type === 'BUY' ? getAssetTokenDecimals(a.pool.assetAddress) : getShareDecimals(a.pool.shareAddress)
            )
          )
          bValue = parseFloat(
            ethers.utils.formatUnits(
              b[orderBy],
              b.type === 'BUY' ? getAssetTokenDecimals(b.pool.assetAddress) : getShareDecimals(b.pool.shareAddress)
            )
          )
        } else {
          aValue = a[orderBy]
          bValue = b[orderBy]
        }

        if (typeof aValue === 'undefined' || aValue === null) return 1
        if (typeof bValue === 'undefined' || bValue === null) return -1

        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return order === 'asc' ? aValue - bValue : bValue - aValue
        }

        return order === 'asc'
          ? aValue.toString().localeCompare(bValue.toString())
          : bValue.toString().localeCompare(aValue.toString())
      })
    }
    return trades
  }, [trades, orderBy, order])

  return (
    <>
      <TYPE.title5 style={{ marginTop: '30px' }}>Trade History</TYPE.title5>
      <Paper style={{ boxShadow: 'none' }}>
        <TableContainer style={{ margin: '10px 0px', boxShadow: 'none' }}>
          <Table>
            <StyledMUIDataTableHeadCell>
              <TableRow>
                <StyledTableCell>
                  <TableSortLabel
                    active={orderBy === 'blockTimestamp'}
                    direction={orderBy === 'blockTimestamp' ? order : 'asc'}
                    onClick={() => handleSort('blockTimestamp')}
                  >
                    Time
                  </TableSortLabel>
                </StyledTableCell>
                <StyledTableCell>
                  <TableSortLabel
                    active={orderBy === 'usdPrice'}
                    direction={orderBy === 'usdPrice' ? order : 'asc'}
                    onClick={() => handleSort('usdPrice')}
                  >
                    Token Price
                  </TableSortLabel>
                </StyledTableCell>
                <StyledTableCell>
                  <TableSortLabel
                    active={orderBy === 'address'}
                    direction={orderBy === 'address' ? order : 'asc'}
                    onClick={() => handleSort('address')}
                  >
                    Address
                  </TableSortLabel>
                </StyledTableCell>
                <StyledTableCell>
                  <TableSortLabel
                    active={orderBy === 'amountIn' || orderBy === 'amountOut'}
                    direction={orderBy === 'amountIn' || orderBy === 'amountOut' ? order : 'asc'}
                    onClick={() => handleSort(['amountIn', 'amountOut'])}
                  >
                    Amount
                  </TableSortLabel>
                </StyledTableCell>
                <StyledTableCell>
                  <TableSortLabel
                    active={orderBy === 'type'}
                    direction={orderBy === 'type' ? order : 'asc'}
                    onClick={() => handleSort('type')}
                  >
                    Type
                  </TableSortLabel>
                </StyledTableCell>
              </TableRow>
            </StyledMUIDataTableHeadCell>
            <TableBody>
              {sortedTrades.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <EmptyTable isSearch={true} />
                  </TableCell>
                </TableRow>
              ) : (
                sortedTrades
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell>
                        <span>{unixTimeToFormat({ time: row.blockTimestamp })}</span>
                      </TableCell>
                      <TableCell>${parseFloat(row.usdPrice || 0).toFixed(4)}</TableCell>
                      <TableCell style={{ color: '#8F8FB2' }}>{row?.caller?.id}</TableCell>
                      <TableCell style={{ display: 'flex', gap: '8px' }}>
                        {parseFloat(
                          ethers.utils.formatUnits(
                            row.amountIn,
                            row.type === 'BUY'
                              ? getAssetTokenDecimals(row.pool.assetAddress)
                              : getShareDecimals(row.pool.shareAddress)
                          )
                        ).toFixed(3)}
                        {row.type == 'BUY' ? (
                          <StyledImage src={tokenOption?.logo} />
                        ) : (
                          <StyledImage src={getPublicAssetUrl(shareToken)} />
                        )}
                        <VerticalLine />
                        {parseFloat(
                          ethers.utils.formatUnits(
                            row.amountOut,
                            row.type === 'SELL'
                              ? getAssetTokenDecimals(row.pool.assetAddress)
                              : getShareDecimals(row.pool.shareAddress)
                          )
                        ).toFixed(3)}
                        {row.type == 'SELL' ? (
                          <StyledImage src={tokenOption?.logo} />
                        ) : (
                          <StyledImage src={getPublicAssetUrl(shareToken)} />
                        )}
                        <span style={{ color: index <= 4 ? '#FF6161' : '#1FBA66' }}>{row.changedAmt} </span>
                      </TableCell>
                      {row.type === 'BUY' ? (
                        <StyledTableCell>
                          <StyledDivBuy>{row.type}</StyledDivBuy>
                        </StyledTableCell>
                      ) : (
                        <StyledTableCell>
                          <StyledDivSell>{row.type}</StyledDivSell>
                        </StyledTableCell>
                      )}
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={sortedTrades.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </>
  )
}
