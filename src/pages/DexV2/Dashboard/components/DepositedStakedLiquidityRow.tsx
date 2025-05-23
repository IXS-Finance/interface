import React, { useState } from 'react'
import { TransactionResponse } from '@ethersproject/providers'
import { Box, Stack, Tooltip } from '@mui/material'
import { BigNumber } from 'ethers'
import { useHistory } from 'react-router-dom'
import styled, { css } from 'styled-components'
import { TYPE } from 'theme'
import { Address } from 'viem'

import CurrencyLogoSet from 'components/CurrencyLogoSet'

import { formatAmount } from 'utils/formatCurrencyAmount'
import { routes } from 'utils/routes'
import { Pool } from 'services/pool/types'
import { Card } from './Card'

import { ReactComponent as ChevronDownIcon } from 'assets/images/chevron-down.svg'
import { ReactComponent as InfoIcon } from 'assets/images/info.svg'
import CardBody from './DepositedStakedLiquidityCard'
import useEmissionApr from 'hooks/dex-v2/useEmissionApr'
import useTradingFeeApr from 'hooks/dex-v2/useTradingFeeApr'

const MAX_TOKEN_WEIGHT_DIGITS = 2

type DepositedStakedLiquidityRowProps = {
  data: Pool
  gaugeAddress?: string
  userLpBalance?: bigint
  userGaugeBalance?: bigint
  lpSupply?: BigNumber
  rowIndex?: number
  earnedTradingFees?: bigint[]
  earnedEmissions?: bigint
  claim?: (gaugeAddress: string) => Promise<TransactionResponse>
}

const DepositedStakedLiquidityRow = ({
  data,
  gaugeAddress,
  userLpBalance,
  userGaugeBalance,
  lpSupply,
  rowIndex,
  earnedTradingFees,
  earnedEmissions,
  claim,
}: DepositedStakedLiquidityRowProps) => {
  const tokens = data.tokens
  const emissionAprValue = useEmissionApr(data)
  const tradingFeeAprValue = useTradingFeeApr(data)

  const tokenAddresses = tokens.map((token) => token.address as Address)
  const poolName = tokens.map((token) => token.symbol).join('/')
  const poolWeight = tokens.map((token) => formatAmount(+(token.weight || 0) * 100, MAX_TOKEN_WEIGHT_DIGITS)).join('/')
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
        gaugeAddress={gaugeAddress}
        userLpBalance={userLpBalance}
        userGaugeBalance={userGaugeBalance}
        lpSupply={lpSupply}
        showMore={showMore}
        rowIndex={rowIndex}
        earnedTradingFees={earnedTradingFees}
        earnedEmissions={earnedEmissions}
        claim={claim}
        emissionApr={emissionAprValue}
        tradingFeeApr={tradingFeeAprValue}
      />
    </Card>
  )
}

export default DepositedStakedLiquidityRow

const Dot = styled.div`
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: ${({ theme }) => theme.text6};
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
