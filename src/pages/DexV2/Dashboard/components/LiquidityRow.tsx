import { Box, Grid, Stack, Tooltip } from '@mui/material'
import styled, { useTheme } from 'styled-components'
import { TYPE } from 'theme'
import { Line } from 'components/Line'
import Big from 'big.js'
import { ReactComponent as InfoIcon } from 'assets/images/info.svg'
import { useCurrency } from 'hooks/Tokens'
import CurrencyLogo from 'components/CurrencyLogo'
import { NewApproveButton, PinnedContentButton } from 'components/Button'
import { Card } from './Card'
import { JoinExitsType, TokenType } from '../graphql/dashboard'
import CurrencyLogoSet from 'components/CurrencyLogoSet'
import { Address } from 'viem'
import { formatAmount } from 'utils/formatCurrencyAmount'
import { BigNumber } from 'ethers'
import { useCallback } from 'react'

type LiquidityRowProps = {
  data: JoinExitsType
  stakedBalance?: BigNumber
  lpSupply?: BigNumber
  unstakedBalance?: BigNumber
}

const LiquidityRow = ({ data, stakedBalance, lpSupply, unstakedBalance }: LiquidityRowProps) => {
  return (
    <Card>
      <TableHeader />
      <Box my={3}>
        <Line />
      </Box>
      <TableBody data={data} stakedBalance={stakedBalance} lpSupply={lpSupply} unstakedBalance={unstakedBalance} />
    </Card>
  )
}

const TableHeader = () => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={3}>
        <TYPE.subHeader1>Deposit #123</TYPE.subHeader1>
      </Grid>
      <Grid item xs={2}>
        <TYPE.subHeader1>Pool Total</TYPE.subHeader1>
      </Grid>
      <Grid item xs={2}>
        <TYPE.subHeader1>Staked</TYPE.subHeader1>
      </Grid>
      <Grid item xs={2}>
        <TYPE.subHeader1>Unstaked</TYPE.subHeader1>
      </Grid>
    </Grid>
  )
}

const TableBody = ({ data, stakedBalance, lpSupply, unstakedBalance }: LiquidityRowProps) => {
  const theme = useTheme()
  const tokens = data.pool.tokens
  const tokenAddresses = tokens.map((token) => token.address as Address)
  const poolName = data.pool.tokens.map((token) => token.symbol).join('/')
  const poolWeight = data.pool.tokens.map((token) => +token.weight * 100).join('/')

  const tokenShare = useCallback(
    (token: TokenType) => {
      if (!lpSupply) {
        return new Big(0)
      }

      return new Big(token.balance).div(lpSupply.toString())
    },
    [lpSupply]
  )

  const getStakedAmount = useCallback(
    (token: TokenType) => {
      if (!stakedBalance) {
        return 0
      }

      const result = new Big(stakedBalance.toString()).mul(tokenShare(token))
      return +result.toString()
    },
    [stakedBalance]
  )

  const getUnstakedAmount = useCallback(
    (token: TokenType) => {
      if (!unstakedBalance) {
        return 0
      }

      const result = new Big(unstakedBalance?.toString()).mul(tokenShare(token))
      return +result.toString()
    },
    [unstakedBalance]
  )

  return (
    <Grid container spacing={2} alignItems="center">
      <Grid item xs={3}>
        <Box height={40}>{tokenAddresses ? <CurrencyLogoSet tokens={tokenAddresses} size={32} /> : null}</Box>
        <Box my={1}>
          <TYPE.label fontSize={16}>{poolName}</TYPE.label>
        </Box>
        <Stack direction="row" alignItems="center" gap={1}>
          <TYPE.subHeader1 color="yellow69">Weighted</TYPE.subHeader1>
          <Dot />
          <TYPE.subHeader1 color="text6">{poolWeight}</TYPE.subHeader1>
          <Tooltip title="Info">
            <InfoIcon width={12} />
          </Tooltip>
        </Stack>
      </Grid>
      <Grid item xs={2}>
        <Stack gap={1}>
          {tokens
            ? tokens.map((token) => (
                <StyledLiquidItem token={token.address} amount={+token.balance} key={`pool-total-${token.address}`} />
              ))
            : null}
        </Stack>
      </Grid>
      <Grid item xs={2}>
        <Stack gap={1}>
          {tokens
            ? tokens.map((token) => (
                <StyledLiquidItem
                  token={token.address}
                  amount={getStakedAmount(token)}
                  key={`staked-${token.address}`}
                />
              ))
            : null}
        </Stack>
      </Grid>
      <Grid item xs={2}>
        <Stack gap={1}>
          {tokens
            ? tokens.map((token) => (
                <StyledLiquidItem
                  token={token.address}
                  amount={getUnstakedAmount(token)}
                  key={`unstaked-${token.address}`}
                />
              ))
            : null}
        </Stack>
      </Grid>
      <Grid item xs={3}>
        <Stack direction="row" gap={2}>
          <NewApproveButton
            style={{
              color: theme.primary1,
              border: `1px solid ${theme.bg24}`,
              width: 'auto',
              paddingTop: 12,
              paddingBottom: 12,
            }}
          >
            Withdraw
          </NewApproveButton>
          <PinnedContentButton
            style={{
              width: 'auto',
              paddingTop: 12,
              paddingBottom: 12,
            }}
          >
            Stake
          </PinnedContentButton>
        </Stack>
      </Grid>
    </Grid>
  )
}

const StyledLiquidItem = ({ token, amount = 0 }: { token: Address; amount?: number }) => {
  const currency = useCurrency(token)

  return (
    <Stack direction="row" alignItems="center" gap={1}>
      <CurrencyLogo currency={currency} size="20px" />
      <TYPE.subHeader1 color="text6">{currency?.symbol}</TYPE.subHeader1>
      <TYPE.subHeader1>{formatAmount(amount, 4)}</TYPE.subHeader1>
    </Stack>
  )
}

const Dot = styled.div`
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: ${({ theme }) => theme.text6};
`

export default LiquidityRow
