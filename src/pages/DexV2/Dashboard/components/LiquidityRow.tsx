import { Box, Grid, Stack, Tooltip } from '@mui/material'
import styled, { useTheme } from 'styled-components'
import { TYPE } from 'theme'
import { Line } from 'components/Line'
import Big from 'big.js'
import { ReactComponent as InfoIcon } from 'assets/images/info.svg'
import { useCurrency } from 'hooks/Tokens'
import { NewApproveButton, PinnedContentButton } from 'components/Button'
import { Card } from './Card'
import { JoinExitsType, TokenType } from '../graphql/dashboard'
import CurrencyLogoSet from 'components/CurrencyLogoSet'
import { Address, formatUnits, parseUnits, zeroAddress } from 'viem'
import { formatAmount } from 'utils/formatCurrencyAmount'
import { BigNumber } from 'ethers'
import { useCallback, useState } from 'react'
import Asset from 'pages/DexV2/common/Asset'
import { StakeAction } from 'pages/DexV2/Pool/Staking/hooks/useStakePreview'
import StakePreviewModal from 'pages/DexV2/Pool/Staking/StakePreviewModal'
import { LP_DECIMALS } from 'pages/DexV2/Pool/Staking/constants'

type LiquidityRowProps = {
  data: JoinExitsType
  userLpBalance?: bigint
  userGaugeBalance?: bigint
  lpSupply?: BigNumber
  gaugesByPool: Record<Address, Address>
}

const LiquidityRow = ({ data, userLpBalance, userGaugeBalance, lpSupply, gaugesByPool }: LiquidityRowProps) => {
  return (
    <Card>
      <TableHeader />
      <Box my={3}>
        <Line />
      </Box>
      <TableBody
        data={data}
        userLpBalance={userLpBalance}
        userGaugeBalance={userGaugeBalance}
        lpSupply={lpSupply}
        gaugesByPool={gaugesByPool}
      />
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

const TableBody = ({ data, userLpBalance, userGaugeBalance, lpSupply, gaugesByPool }: LiquidityRowProps) => {
  const theme = useTheme()
  const [stakeAction, setStakeAction] = useState<StakeAction | null>(null)

  const tokens = data.pool.tokens
  const tokenAddresses = tokens.map((token) => token.address as Address)
  const poolName = tokens.map((token) => token.symbol).join('/')
  const poolWeight = tokens.map((token) => +(token.weight || 0) * 100).join('/')
  const isHasGauge = gaugesByPool[data.pool.address as Address] !== zeroAddress

  const getStakedAmount = useCallback(
    (token: TokenType): Big => {
      if (!userGaugeBalance || !lpSupply || lpSupply.toString() === '0') {
        return new Big(0)
      }

      return new Big(userGaugeBalance.toString()).div(lpSupply.toString()).mul(token.balance)
    },
    [userGaugeBalance]
  )

  const getUnstakedAmount = useCallback(
    (token: TokenType): Big => {
      if (!userLpBalance || !lpSupply || lpSupply.toString() === '0') {
        return new Big(0)
      }

      return new Big(userLpBalance.toString()).div(lpSupply.toString()).mul(token.balance)
    },
    [userLpBalance]
  )

  const handlePreviewClose = () => setStakeAction(null)

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
                  amount={getStakedAmount(token).toNumber()}
                  key={`staked-${token.address}`}
                />
              ))
            : null}
        </Stack>
      </Grid>
      <Grid item xs={2}>
        <Stack gap={1}>
          {tokens?.map((token) => (
            <StyledLiquidItem
              token={token.address}
              amount={getUnstakedAmount(token).toNumber()}
              key={`unstaked-${token.address}`}
            />
          )) || null}
        </Stack>
      </Grid>
      <Grid item xs={3}>
        {isHasGauge ? (
          <Stack direction="row" gap={2}>
            <NewApproveButton
              style={{
                color: theme.primary1,
                border: `1px solid ${theme.bg24}`,
                width: 'auto',
                paddingTop: 12,
                paddingBottom: 12,
              }}
              onClick={() => setStakeAction('unstake')}
            >
              Withdraw
            </NewApproveButton>
            <PinnedContentButton
              style={{
                width: 'auto',
                paddingTop: 12,
                paddingBottom: 12,
              }}
              onClick={() => setStakeAction('stake')}
            >
              Stake
            </PinnedContentButton>
          </Stack>
        ) : null}
      </Grid>
      {stakeAction ? (
        <StakePreviewModal
          isVisible
          pool={data.pool}
          gaugeAddress={data.pool?.gauge.address}
          currentShares={formatUnits(userLpBalance ?? BigInt(0), LP_DECIMALS)}
          stakedBalance={userGaugeBalance ?? BigInt(0)}
          unstakeBalance={userLpBalance ?? BigInt(0)}
          action={stakeAction}
          onClose={handlePreviewClose}
          onSuccess={handlePreviewClose}
        />
      ) : null}
    </Grid>
  )
}

const StyledLiquidItem = ({ token, amount = 0 }: { token: Address; amount?: number }) => {
  const currency = useCurrency(token)

  return (
    <Stack direction="row" alignItems="center" gap={1}>
      <Asset address={token} />
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
