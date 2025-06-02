import { Box, Stack, Tooltip } from '@mui/material'
import { TYPE } from 'theme'
import { ReactComponent as InfoIcon } from 'assets/images/info.svg'

import DepositedStakedLiquidityRow from './DepositedStakedLiquidityRow'
import useLiquidityPool from '../hooks/useLiquidityPool'
import { useEffect } from 'react'
import { useTokens } from 'state/dexV2/tokens/hooks/useTokens'
import EmptyList from './EmptyList'
import useGauges from 'hooks/dex-v2/pools/useGauges'
import LoadingBlock from 'pages/DexV2/common/LoadingBlock'

const DepositedStakedLiquidity = () => {
  const { gauges, gaugeFor } = useGauges()
  const {
    lpSupplyByPool,
    userLpBalanceByPool,
    userGaugeBalanceByGauge,
    pools,
    isPoolsLoading,
    earnedTradingFeesByGauge,
    earnedEmissionsByGauge,
    claim,
  } = useLiquidityPool()
  const userActivePools = pools?.filter((pool) => {
    const gaugeAddress = gaugeFor(pool.address)?.address
    const hasStaked = gaugeAddress && userGaugeBalanceByGauge?.[gaugeAddress] > 0
    const hasLpBalance = userLpBalanceByPool?.[pool.address] > 0
    const hasEarnedTradingFees =
      gaugeAddress && earnedTradingFeesByGauge?.[gaugeAddress]?.some?.((tradingFee: bigint) => tradingFee > 0)
    const hasEmissions = gaugeAddress && earnedEmissionsByGauge?.[gaugeAddress] > 0
    return hasStaked || hasLpBalance || hasEarnedTradingFees || hasEmissions
  })
  const { injectSpenders, injectTokens } = useTokens()
  const gaugeAddresses = gauges?.map((gauge) => gauge.address)

  useEffect(() => {
    injectTokens(userActivePools?.map((data) => data.address))
  }, [userActivePools])

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
        {isPoolsLoading ? (
          <LoadingBlock style={{ height: '132px' }} />
        ) : (
          (!userActivePools || userActivePools?.length === 0) && <EmptyList />
        )}
        {userActivePools?.map((data, index) => {
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
