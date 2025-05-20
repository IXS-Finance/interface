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
import useGauges from 'hooks/dex-v2/pools/useGauges'

const DepositedStakedLiquidity = () => {
  const dispatch = useDispatch()
  const { gauges, gaugeFor } = useGauges()
  const {
    lpSupplyByPool,
    userLpBalanceByPool,
    userGaugeBalanceByGauge,
    pools,
    earnedTradingFeesByGauge,
    earnedEmissionsByGauge,
    claim,
  } = useLiquidityPool()
  const { injectSpenders, injectTokens, refetchAllowances } = useTokens()
  const lpTokenAddresses = pools?.map((data) => data.address)
  const gaugeAddresses = gauges?.map((gauge) => gauge.address)
  const { data: allowanceData } = useAllowancesQuery({
    tokenAddresses: lpTokenAddresses,
    contractAddresses: gaugeAddresses!,
    isEnabled: !!(lpTokenAddresses?.length && gaugeAddresses?.length),
  })
  useEffect(() => {
    if (Object.keys(allowanceData).length > 0) {
      dispatch(setAllowances(allowanceData))
    }
  }, [allowanceData])

  useEffect(() => {
    injectTokens(pools?.map((data) => data.address))
    refetchAllowances()
  }, [JSON.stringify(pools)])

  useEffect(() => {
    if (!gaugeAddresses) return

    injectSpenders(gaugeAddresses)
  }, [JSON.stringify(gaugeAddresses)])

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
            const gaugeAddress = gaugeFor(pool.address)?.address
            const hasStaked = gaugeAddress && userGaugeBalanceByGauge?.[gaugeAddress] > 0
            const hasLpBalance = userLpBalanceByPool?.[pool.address] > 0
            const hasEarnedTradingFees =
              gaugeAddress && earnedTradingFeesByGauge?.[gaugeAddress]?.some?.((tradingFee: bigint) => tradingFee > 0)
            const hasEmissions = gaugeAddress && earnedEmissionsByGauge?.[gaugeAddress] > 0
            return hasStaked || hasLpBalance || hasEarnedTradingFees || hasEmissions
          })
          .map((data, index) => {
            const gaugeAddress = gaugeFor(data.address)?.address
            return (
              <DepositedStakedLiquidityRow
                data={data}
                gaugeAddress={gaugeAddress}
                userLpBalance={userLpBalanceByPool?.[data.address]}
                userGaugeBalance={gaugeAddress && userGaugeBalanceByGauge?.[gaugeAddress]}
                lpSupply={lpSupplyByPool?.[data.address]}
                key={data.id}
                rowIndex={index}
                earnedTradingFees={gaugeAddress && earnedTradingFeesByGauge?.[gaugeAddress]}
                earnedEmissions={gaugeAddress && earnedEmissionsByGauge?.[gaugeAddress]}
                claim={claim}
              />
            )
          })}
      </Stack>
    </Box>
  )
}

export default DepositedStakedLiquidity
