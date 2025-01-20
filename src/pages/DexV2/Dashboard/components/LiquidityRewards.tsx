import { Box, Button, Stack, Tooltip } from '@mui/material'
import { TYPE } from 'theme'
import styled from 'styled-components'
import { ReactComponent as AddIcon } from 'assets/images/plus-blue.svg'
import { ReactComponent as InfoIcon } from 'assets/images/info.svg'

import { useDashboard } from '../DashProvider'
import LiquidityRow from './LiquidityRow'
import { JoinExitsType } from '../graphql/dashboard'

const LiquidityRewards = () => {
  const { positionsData, stakedBalanceByPool, lpSupplyByPool, unstakedBalanceByPool } = useDashboard()
  const liquidityData = (positionsData?.data as { data: { joinExits: JoinExitsType[] } })?.data?.joinExits

  return (
    <Box mb={8}>
      <Stack mb={3} direction="row" alignItems="center" justifyContent="space-between">
        <Stack direction="row" alignItems="center" gap={1}>
          <TYPE.label>Deposited and Staked Liquidity</TYPE.label>
          <Tooltip title="Info">
            <InfoIcon />
          </Tooltip>
        </Stack>
        <StyledButton startIcon={<AddIcon />}>New Deposit</StyledButton>
      </Stack>
      <Stack direction="column" gap={2}>
        {liquidityData?.map((data) => (
          <LiquidityRow
            data={data}
            stakedBalance={stakedBalanceByPool?.[data.pool.address]}
            lpSupply={lpSupplyByPool?.[data.pool.address]}
            unstakedBalance={unstakedBalanceByPool?.[data.pool.address]}
            key={data.pool.id}
          />
        ))}
      </Stack>
    </Box>
  )
}

export default LiquidityRewards

const StyledButton = styled(Button)`
  &.MuiButton-root {
    background: ${({ theme }) => theme.white};
    text-transform: unset;
    padding: 12px 32px;
  }

  &.MuiButton-root:hover {
    background: ${({ theme }) => theme.white};
  }
`
