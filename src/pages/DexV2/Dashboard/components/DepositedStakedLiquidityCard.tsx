import { toast } from 'react-toastify'
import { formatUnits } from 'viem'
import { BigNumber } from 'ethers'
import { TransactionResponse } from '@ethersproject/providers'
import Big from 'bignumber.js'
import { useHistory } from 'react-router-dom'
import { Box, Button, Grid, Stack } from '@mui/material'

import { formatAmount } from 'utils/formatCurrencyAmount'
import { IXS } from 'constants/tokens'
import { useActiveWeb3React } from 'hooks/web3'
import { useTokens } from 'state/dexV2/tokens/hooks/useTokens'
import { useCallback, useState } from 'react'
import { routes } from 'utils/routes'
import { StakeAction } from 'pages/DexV2/Pool/Staking/hooks/useStakePreview'
import StakePreviewModal from 'pages/DexV2/Pool/Staking/StakePreviewModal'
import styled from 'styled-components'
import { LP_DECIMALS } from 'pages/DexV2/Pool/Staking/constants'
import { TYPE } from 'theme'
import { Line } from 'components/Line'
import { fNum } from 'lib/balancer/utils/numbers'
import { Pool, PoolToken } from 'services/pool/types'
import { bnum } from 'lib/utils'

const MAX_FRACTION_DIGITS = 5

type CardBodyProps = {
  data: Pool
  gaugeAddress?: string
  userLpBalance?: bigint
  userGaugeBalance?: bigint
  emissionApr: string
  tradingFeeApr: string
  lpSupply?: BigNumber
  showMore: boolean
  rowIndex?: number
  earnedTradingFees?: bigint[]
  earnedEmissions?: bigint
  claim?: (gaugeAddress: string) => Promise<TransactionResponse>
}

const CardBody = ({
  data,
  gaugeAddress,
  userLpBalance,
  userGaugeBalance,
  lpSupply,
  showMore,
  earnedTradingFees,
  earnedEmissions,
  claim,
  emissionApr,
  tradingFeeApr,
}: CardBodyProps) => {
  const { chainId } = useActiveWeb3React()
  const { allowanceFor } = useTokens()
  const allowanceIsFetched = gaugeAddress && allowanceFor(data.address, gaugeAddress)?.gte(0)
  const [stakeAction, setStakeAction] = useState<StakeAction | null>(null)
  const tokens = data.tokens
  const history = useHistory()
  const getStakedAmount = useCallback(
    (token: PoolToken): Big => {
      if (!userGaugeBalance || !lpSupply || lpSupply.toString() === '0') {
        return bnum(0)
      }

      return bnum(userGaugeBalance).div(lpSupply.toString()).times(token.balance.toString())
    },
    [userGaugeBalance, lpSupply]
  )

  const getUnstakedAmount = useCallback(
    (token: PoolToken): Big => {
      if (!userLpBalance || !lpSupply || lpSupply.toString() === '0') {
        return bnum(0)
      }

      return bnum(userLpBalance).div(lpSupply.toString()).times(token.balance)
    },
    [userLpBalance]
  )

  const handlePreviewClose = () => setStakeAction(null)

  const handleGotoWithdrawFromPoolPage = () => {
    const path = routes.dexV2PoolWithdraw.replace(':id', data.id)
    history.push(path)
  }

  const handleClaimEmissions = async () => {
    if (!claim || !gaugeAddress) return
    try {
      await claim(gaugeAddress)
      toast.success('Claimed successfully')
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Box>
      {showMore && (
        <Box my={2}>
          <Grid container spacing={2}>
            <Grid item xs={2.4}>
              <CardItem
                title="Pool Total"
                secondTitle=""
                tokens={tokens?.map((token) => ({
                  balance: formatAmount(parseFloat(token.balance), MAX_FRACTION_DIGITS),
                  symbol: token.symbol,
                  address: token.address,
                }))}
              />
            </Grid>
            <Grid item xs={2.4}>
              <CardItem
                title="Staked"
                secondTitle=""
                tokens={tokens?.map((token) => ({
                  balance: formatAmount(getStakedAmount(token).toNumber(), MAX_FRACTION_DIGITS),
                  symbol: token.symbol,
                  address: token.address,
                }))}
                showUnstakeBtn
                userGaugeBalance={userGaugeBalance}
                userLpBalance={userLpBalance}
                handleUnstakeAction={() => setStakeAction('unstake')}
              />
            </Grid>
            <Grid item xs={2.4}>
              <CardItem
                title="Unstaked"
                secondTitle=""
                tokens={tokens?.map((token) => ({
                  balance: formatAmount(getUnstakedAmount(token).toNumber(), MAX_FRACTION_DIGITS),
                  symbol: token.symbol,
                  address: token.address,
                }))}
                showStakeBtn={!!allowanceIsFetched}
                showWithdrawBtn
                userGaugeBalance={userGaugeBalance}
                userLpBalance={userLpBalance}
                handleStakeAction={() => setStakeAction('stake')}
                handleWithdrawAction={handleGotoWithdrawFromPoolPage}
              />
            </Grid>
            <Grid item xs={2.4}>
              <CardItem
                title="Emissions"
                secondTitle="APR"
                emissionsAmount={formatAmount(
                  +formatUnits(earnedEmissions || BigInt(0), IXS[chainId]?.decimals),
                  MAX_FRACTION_DIGITS
                )}
                emissionsSymbol="IXS"
                emissionApr={emissionApr}
                showClaimEmissionsBtn={!!gaugeAddress}
                handleClaimEmissionsAction={handleClaimEmissions}
              />
            </Grid>
            <Grid item xs={2.4}>
              <CardItem
                title="Trading Fees"
                secondTitle="APR"
                tradingFeeApr={tradingFeeApr}
                tokens={tokens?.map((token, index) => ({
                  balance: formatAmount(
                    +formatUnits(earnedTradingFees?.[index] || BigInt(0), token.decimals || 18),
                    MAX_FRACTION_DIGITS
                  ),
                  symbol: token.symbol,
                  address: token.address,
                }))}
              />
            </Grid>
          </Grid>
        </Box>
      )}
      {stakeAction && allowanceIsFetched ? (
        <StakePreviewModal
          isVisible
          pool={data}
          gaugeAddress={gaugeAddress}
          currentShares={formatUnits(userLpBalance ?? BigInt(0), LP_DECIMALS)}
          stakedBalance={userGaugeBalance ?? BigInt(0)}
          unstakeBalance={userLpBalance ?? BigInt(0)}
          action={stakeAction}
          onClose={handlePreviewClose}
          onSuccess={handlePreviewClose}
        />
      ) : null}
    </Box>
  )
}

interface CardItemProps {
  title: string
  secondTitle?: string
  tokens?: {
    address: string
    balance: string
    symbol?: string
  }[]
  emissionApr?: string
  tradingFeeApr?: string
  userGaugeBalance?: bigint
  userLpBalance?: bigint
  emissionsAmount?: string
  emissionsSymbol?: string
  showStakeBtn?: boolean
  showWithdrawBtn?: boolean
  showUnstakeBtn?: boolean
  showClaimEmissionsBtn?: boolean
  handleStakeAction?: () => void
  handleUnstakeAction?: () => void
  handleWithdrawAction?: () => void
  handleClaimEmissionsAction?: () => void
}

const CardItem = ({
  title,
  secondTitle,
  tokens,
  emissionApr,
  tradingFeeApr,
  userGaugeBalance,
  userLpBalance,
  emissionsAmount,
  emissionsSymbol,
  showStakeBtn,
  showWithdrawBtn,
  showUnstakeBtn,
  showClaimEmissionsBtn,
  handleStakeAction,
  handleUnstakeAction,
  handleWithdrawAction,
  handleClaimEmissionsAction,
}: CardItemProps) => {
  return (
    <CardOutline>
      <Stack direction="row" justifyContent="space-between" height="22px">
        <TYPE.subHeader1 color="text6">{secondTitle ? secondTitle : ''}</TYPE.subHeader1>
        <TYPE.subHeader1 color="text6">{title}</TYPE.subHeader1>
      </Stack>
      <Box my={'12px'}>
        <Line color="bg24" />
      </Box>
      <Stack style={{ minHeight: '75px' }} justifyContent="space-between">
        <Stack direction="row" justifyContent="space-between">
          <Box>
            {emissionApr !== undefined && (
              <Stack direction="row" alignItems="center" gap={0.5}>
                <TYPE.subHeader1 color="text1">{fNum('apr', emissionApr)}</TYPE.subHeader1>
              </Stack>
            )}
            {tradingFeeApr !== undefined && (
              <Stack direction="row" alignItems="center" gap={0.5}>
                <TYPE.subHeader1 color="text1">{fNum('apr', tradingFeeApr)}</TYPE.subHeader1>
              </Stack>
            )}
          </Box>
          <Stack direction="column" alignItems="flex-end">
            {tokens?.map((token) => (
              <Stack direction="row" alignItems="center" gap={0.5} key={`${token.address}-${token.symbol}`}>
                <TYPE.subHeader1 color="text1">{token.balance}</TYPE.subHeader1>
                <TYPE.subHeader1 color="text6">{token.symbol}</TYPE.subHeader1>
              </Stack>
            ))}
            {!!emissionsSymbol && (
              <Stack direction="row" alignItems="center" gap={0.5}>
                <TYPE.subHeader1 color="text1">{emissionsAmount}</TYPE.subHeader1>
                <TYPE.subHeader1 color="text6">{emissionsSymbol}</TYPE.subHeader1>
              </Stack>
            )}
          </Stack>
        </Stack>
        <Stack mt={1} direction="row" alignItems="center" justifyContent="flex-end" gap={1}>
          {showStakeBtn && (
            <CardButton
              size="small"
              disabled={userLpBalance && bnum(userLpBalance || '0').gt(0) ? false : true}
              onClick={() => {
                if (userLpBalance && bnum(userLpBalance || '0').gt(0)) {
                  handleStakeAction?.()
                }
              }}
            >
              Stake
            </CardButton>
          )}
          {showStakeBtn && showWithdrawBtn && <Dot />}
          {showWithdrawBtn && (
            <CardButton
              size="small"
              disabled={userLpBalance && bnum(userLpBalance || '0').gt(0) ? false : true}
              onClick={() => {
                if (userLpBalance && bnum(userLpBalance || '0').gt(0)) {
                  handleWithdrawAction?.()
                }
              }}
            >
              Withdraw
            </CardButton>
          )}
          {showUnstakeBtn && (
            <CardButton
              size="small"
              disabled={userGaugeBalance && bnum(userGaugeBalance || '0').gt(0) ? false : true}
              onClick={() => {
                if (userGaugeBalance && bnum(userGaugeBalance || '0').gt(0)) {
                  handleUnstakeAction?.()
                }
              }}
            >
              Unstake
            </CardButton>
          )}
          {showClaimEmissionsBtn && (
            <CardButton
              size="small"
              // disabled={emissionsAmount && new Big(emissionsAmount?.toString() || '0').gt(0) ? false : true}
              onClick={() => {
                handleClaimEmissionsAction?.()
              }}
            >
              Claim
            </CardButton>
          )}
        </Stack>
      </Stack>
    </CardOutline>
  )
}

const CardOutline = styled(Box)`
  border: 1px solid ${({ theme }) => theme.bg24};
  padding: 12px 16px;
  border-radius: 8px;
  gap: 12px;
  min-height: 150px;
  height: 100%;
`

const CardButton = styled(Button)`
  &.MuiButton-root {
    padding: 0;
    background-color: transparent;
    text-transform: none;
    font-size: 14px;
    color: ${({ theme }) => theme.primary1};
    min-width: auto;
  }

  &.MuiButton-root:hover {
    background-color: transparent;
    opacity: 0.8;
  }
`

const Dot = styled.div`
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: ${({ theme }) => theme.text6};
`

export default CardBody
