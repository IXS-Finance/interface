import { Box, Stack, Tooltip } from '@mui/material'
import { TYPE } from 'theme'
import { ReactComponent as InfoIcon } from 'assets/images/info.svg'

import DepositedStakedLiquidityRow from './DepositedStakedLiquidityRow'
import useLiquidityPool from '../hooks/useLiquidityPool'
import useAllowancesQuery from 'hooks/dex-v2/queries/useAllowancesQuery'
import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setAllowances } from 'state/dexV2/tokens'

const DepositedStakedLiquidity = () => {
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
      </Stack>
      <Stack direction="column" gap={2}>
        {pools?.map((data, index) => (
          <DepositedStakedLiquidityRow
            data={data}
            userLpBalance={userLpBalanceByPool?.[data.address]}
            userGaugeBalance={userGaugeBalanceByPool?.[data.address]}
            lpSupply={lpSupplyByPool?.[data.address]}
            key={data.id}
            gaugesByPool={gaugesByPool}
            rowIndex={index}
          />
        ))}
      </Stack>
    </Box>
  )
}

export default DepositedStakedLiquidity

