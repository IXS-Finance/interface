import React, { useCallback, useMemo, useState } from 'react'
import { TransactionResponse } from '@ethersproject/providers'
import { Box, Button, Grid, Stack, Tooltip } from '@mui/material'
import Big from 'big.js'
import { BigNumber } from 'ethers'
import { useHistory } from 'react-router-dom'
import { toast } from 'react-toastify'
import styled, { css } from 'styled-components'
import { TYPE } from 'theme'
import { Address, formatUnits } from 'viem'

import CurrencyLogoSet from 'components/CurrencyLogoSet'
import { Line } from 'components/Line'
import { LP_DECIMALS } from 'pages/DexV2/Pool/Staking/constants'
import { StakeAction } from 'pages/DexV2/Pool/Staking/hooks/useStakePreview'
import StakePreviewModal from 'pages/DexV2/Pool/Staking/StakePreviewModal'
import { formatAmount } from 'utils/formatCurrencyAmount'
import { routes } from 'utils/routes'
import { PoolType, TokenType } from '../graphql/dashboard'
import { Card } from './Card'

import { ReactComponent as ChevronDownIcon } from 'assets/images/chevron-down.svg'
import { ReactComponent as InfoIcon } from 'assets/images/info.svg'
import { IXS } from 'constants/tokens'
import { useActiveWeb3React } from 'hooks/web3'

const MAX_FRACTION_DIGITS = 5

type DepositedStakedLiquidityRowProps = {
  data: PoolType
  userLpBalance?: bigint
  userGaugeBalance?: bigint
  lpSupply?: BigNumber
  rowIndex?: number
  earnedTradingFees?: bigint[]
  earnedEmissions?: bigint
  claim?: (gaugeAddress: Address) => Promise<TransactionResponse>
}

type CardBodyProps = {
  data: PoolType
  userLpBalance?: bigint
  userGaugeBalance?: bigint
  lpSupply?: BigNumber
  showMore: boolean
  rowIndex?: number
  earnedTradingFees?: bigint[]
  earnedEmissions?: bigint
  claim?: (gaugeAddress: Address) => Promise<TransactionResponse>
}

const DepositedStakedLiquidityRow = ({
  data,
  userLpBalance,
  userGaugeBalance,
  lpSupply,
  rowIndex,
  earnedTradingFees,
  earnedEmissions,
  claim,
}: DepositedStakedLiquidityRowProps) => {
  const tokens = data.tokens

  const tokenAddresses = tokens.map((token) => token.address as Address)
  const poolName = tokens.map((token) => token.symbol).join('/')
  const poolWeight = tokens.map((token) => +(token.weight || 0) * 100).join('/')
  const history = useHistory()
  const [showMore, setShowMore] = useState(rowIndex === 0)

  const handleToggleShowMore = (value: boolean) => {
    setShowMore(value)
  }

  const handleShowPoolDetail = () => {
    const path = routes.dexV2PoolDetail.replace(':id', data.id)
    history.push(path)
  }

  return (
    <Card>
      <Stack direction="row" justifyContent="space-between">
        <Stack direction="row" alignItems="center" style={{ width: 'max-content', userSelect: 'none' }} gap={1}>
          <Stack height={40} direction="row" alignItems="center">
            {tokenAddresses ? <CurrencyLogoSet tokens={tokenAddresses} size={32} /> : null}
          </Stack>
          <Box my={1}>
            <StyledLabel fontSize={16} onClick={handleShowPoolDetail}>
              {poolName}
            </StyledLabel>
          </Box>
          <Stack direction="row" alignItems="center" gap={1}>
            <TYPE.subHeader1 color="yellow69">Weighted</TYPE.subHeader1>
            <Dot />
            <TYPE.subHeader1 color="text6">{poolWeight}</TYPE.subHeader1>
            <Tooltip title="Info">
              <InfoIcon width={12} />
            </Tooltip>
          </Stack>
        </Stack>

        <Stack
          direction="row"
          alignItems="center"
          style={{ userSelect: 'none' }}
          gap={1}
          onClick={() => handleToggleShowMore(!showMore)}
        >
          <TYPE.subHeader1 color="text6">{showMore ? 'Show Less' : 'Show More'}</TYPE.subHeader1>
          <StyledChevronIcon isOpen={!showMore} />
        </Stack>
      </Stack>
      <CardBody
        data={data}
        userLpBalance={userLpBalance}
        userGaugeBalance={userGaugeBalance}
        lpSupply={lpSupply}
        showMore={showMore}
        rowIndex={rowIndex}
        earnedTradingFees={earnedTradingFees}
        earnedEmissions={earnedEmissions}
        claim={claim}
      />
    </Card>
  )
}

const CardBody = ({
  data,
  userLpBalance,
  userGaugeBalance,
  lpSupply,
  showMore,
  rowIndex,
  earnedTradingFees,
  earnedEmissions,
  claim,
}: CardBodyProps) => {
  const { chainId } = useActiveWeb3React()
  const [stakeAction, setStakeAction] = useState<StakeAction | null>(null)
  const tokens = data.tokens
  const history = useHistory()
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

  const apr: string = useMemo(() => {
    return rowIndex === 0 ? '35.75%' : '-'
  }, [rowIndex])

  const handlePreviewClose = () => setStakeAction(null)

  const handleGotoWithdrawFromPoolPage = () => {
    const path = routes.dexV2PoolWithdraw.replace(':id', data.id)
    history.push(path)
  }

  const handleClaimEmissions = async () => {
    if (!claim || !data?.gauge?.address) return
    try {
      await claim(data?.gauge?.address)
      toast.success('Claimed successfully')
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Box>
      {showMore && (
        <Box my={2}>
          <Grid container spacing={2} alignItems="center">
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
                handleUnstakeAction={() => {
                  setStakeAction('unstake')
                }}
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
                showStakeBtn={!!data?.gauge?.address}
                showWithdrawBtn
                userGaugeBalance={userGaugeBalance}
                userLpBalance={userLpBalance}
                handleStakeAction={() => {
                  setStakeAction('stake')
                }}
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
                apr={apr}
                showClaimEmissionsBtn={!!data?.gauge?.address}
                handleClaimEmissionsAction={handleClaimEmissions}
              />
            </Grid>
            <Grid item xs={2.4}>
              <CardItem
                title="Trading Fees"
                secondTitle=""
                tokens={tokens?.map((token, index) => ({
                  balance: formatAmount(
                    +formatUnits(earnedTradingFees?.[index] || BigInt(0), token.decimals),
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
      {stakeAction ? (
        <StakePreviewModal
          isVisible
          pool={data}
          gaugeAddress={data?.gauge?.address}
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
    symbol: string
  }[]
  apr?: string
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
  apr,
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
      <Stack style={{ height: '75px' }} justifyContent="space-between">
        <Stack direction="row" justifyContent="space-between">
          <Box>
            {apr && (
              <Stack direction="row" alignItems="center" gap={0.5}>
                <TYPE.subHeader1 color="text1">{apr || '-'}</TYPE.subHeader1>
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
              disabled={userLpBalance && new Big(userLpBalance?.toString() || '0').gt(0) ? false : true}
              onClick={() => {
                if (userLpBalance && new Big(userLpBalance?.toString() || '0').gt(0)) {
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
              disabled={userLpBalance && new Big(userLpBalance?.toString() || '0').gt(0) ? false : true}
              onClick={() => {
                if (userLpBalance && new Big(userLpBalance?.toString() || '0').gt(0)) {
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
              disabled={userGaugeBalance && new Big(userGaugeBalance?.toString() || '0').gt(0) ? false : true}
              onClick={() => {
                if (userGaugeBalance && new Big(userGaugeBalance?.toString() || '0').gt(0)) {
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

export default DepositedStakedLiquidityRow

const Dot = styled.div`
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: ${({ theme }) => theme.text6};
`

const CardOutline = styled(Box)`
  border: 1px solid ${({ theme }) => theme.bg24};
  padding: 12px 16px;
  border-radius: 8px;
  gap: 12px;
  min-height: 150px;
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

const StyledChevronIcon = styled(ChevronDownIcon)<{ isOpen: boolean }>`
  transform: rotate(180deg);
  transition: transform 250ms ease-in-out;
  color: ${({ theme }) => theme.text6};
  ${({ isOpen }) =>
    isOpen &&
    css`
      transform: rotate(0deg);
    `}
`

const StyledLabel = styled(TYPE.label)`
  &:hover {
    color: ${({ theme }) => theme.primary1};
  }
`
