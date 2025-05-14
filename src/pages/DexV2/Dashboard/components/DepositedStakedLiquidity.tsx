import { Box, Stack, Tooltip } from '@mui/material'
import { TYPE } from 'theme'
import { ReactComponent as InfoIcon } from 'assets/images/info.svg'

import DepositedStakedLiquidityRow from './DepositedStakedLiquidityRow'
import useLiquidityPool from '../hooks/useLiquidityPool'
import useAllowancesQuery from 'hooks/dex-v2/queries/useAllowancesQuery'
import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setAllowances } from 'state/dexV2/tokens'
import { useTokens } from 'state/dexV2/tokens/hooks/useTokens'
import EmptyList from './EmptyList'

const DepositedStakedLiquidity = () => {
  const dispatch = useDispatch()
  const {
    lpSupplyByPool,
    userLpBalanceByPool,
    userGaugeBalanceByGauge,
    gaugesByPool,
    pools,
    earnedTradingFeesByGauge,
    earnedEmissionsByGauge,
    claim,
  } = useLiquidityPool()
  const { injectSpenders, injectTokens, refetchAllowances } = useTokens()
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

  useEffect(() => {
    injectTokens(pools?.map((data) => data.address))
    injectSpenders(pools?.filter((pool) => pool.gauge).map((data) => data.gauge?.address))
    refetchAllowances()
  }, [JSON.stringify(pools)])

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
        {(!pools || pools?.length === 0) && <EmptyList />}
        {pools
          ?.filter((pool) => {
            const hasStaked = pool.gauge?.address && userGaugeBalanceByGauge?.[pool.gauge.address] > 0
            const hasLpBalance = userLpBalanceByPool?.[pool.address] > 0
            const hasEarnedTradingFees =
              pool.gauge?.address &&
              earnedTradingFeesByGauge?.[pool.gauge.address]?.some?.((tradingFee: bigint) => tradingFee > 0)
            const hasEmissions = pool.gauge?.address && earnedEmissionsByGauge?.[pool.gauge.address] > 0
            return hasStaked || hasLpBalance || hasEarnedTradingFees || hasEmissions
          })
          .map((data, index) => (
            <DepositedStakedLiquidityRow
              data={data}
              userLpBalance={userLpBalanceByPool?.[data.address]}
              userGaugeBalance={userGaugeBalanceByGauge?.[data.gauge?.address]}
              lpSupply={lpSupplyByPool?.[data.address]}
              key={data.id}
              rowIndex={index}
              earnedTradingFees={earnedTradingFeesByGauge?.[data.gauge?.address]}
              earnedEmissions={earnedEmissionsByGauge?.[data.gauge?.address]}
              claim={claim}
            />
          ))}
      </Stack>
    </Box>
  )
}

export default DepositedStakedLiquidity
