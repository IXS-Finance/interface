import { Box, Button, Stack, Tooltip } from '@mui/material'
import { TYPE } from 'theme'
import styled from 'styled-components'
import { ReactComponent as AddIcon } from 'assets/images/plus-blue.svg'
import { ReactComponent as InfoIcon } from 'assets/images/info.svg'

import LiquidityRow from './LiquidityRow'
import useLiquidityPool from '../hooks/useLiquidityPool'
import useAllowancesQuery from 'hooks/dex-v2/queries/useAllowancesQuery'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setAllowances } from 'state/dexV2/tokens'

const LiquidityRewards = () => {
  const dispatch = useDispatch()
  const { lpSupplyByPool, userLpBalanceByPool, userGaugeBalanceByPool, gaugesByPool, pools } = useLiquidityPool()

  const lpTokenAddresses = pools?.map((data) => data.address)
  const gaugeAddresses = lpTokenAddresses?.map((address) => gaugesByPool[address])
  const { data: allowanceData } = useAllowancesQuery({
    tokenAddresses: lpTokenAddresses,
    contractAddresses: gaugeAddresses,
    isEnabled: !!(lpTokenAddresses?.length && gaugeAddresses?.length),
  })
  useEffect(() => {
    if (Object.keys(allowanceData).length > 0) {
      dispatch(setAllowances(allowanceData))
    }
  }, [allowanceData])

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
        {pools?.map((data) => (
          <LiquidityRow
            data={data}
            userLpBalance={userLpBalanceByPool?.[data.address]}
            userGaugeBalance={userGaugeBalanceByPool?.[data.address]}
            lpSupply={lpSupplyByPool?.[data.address]}
            key={data.id}
            gaugesByPool={gaugesByPool}
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
