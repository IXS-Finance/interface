import React from 'react'
import useNumbers, { FNumFormats } from 'hooks/dex-v2/useNumbers'

import useUserSettings from 'state/dexV2/userSettings/useUserSettings'
import BalDataList from '../../AddLiquidity/AddLiquidityForm/components/AddLiquidityPreview/components/BalDataList'
import BalDataListRow from '../../AddLiquidity/AddLiquidityForm/components/AddLiquidityPreview/components/BalDataListRow'
import Tooltip from 'pages/DexV2/common/Tooltip'
import { Box } from 'rebass'

interface WithdrawSummaryProps extends React.HTMLAttributes<HTMLDivElement> {
  fiatTotal: string
  priceImpact: number
}

const WithdrawSummary: React.FC<WithdrawSummaryProps> = ({ fiatTotal, priceImpact }) => {
  const { fNum } = useNumbers()
  const { currency } = useUserSettings()

  return (
    <BalDataList title="Summary">
      <BalDataListRow label="Total">
        <div>{fNum(fiatTotal, FNumFormats.fiat)}</div>
        <Box ml="4px">
          <Tooltip
            text={`The total value in ${currency.toUpperCase()} you’ll be withdrawing from this pool.`}
            iconSize="sm"
          />
        </Box>
      </BalDataListRow>
      <BalDataListRow label="Price impact">
        <div>{fNum(priceImpact, FNumFormats.percent)}</div>

        <Box ml="4px">
          <Tooltip
            text="Price impact from removing liquidity results when the value of each token removed is not proportional to the weights of the pool. Removing non-proportional amounts causes the internal prices of the pool to change, as if you were swapping tokens. The higher the price impact, the worse price you’ll get for exiting your position."
            iconSize="sm"
            width="300px"
          />
        </Box>
      </BalDataListRow>
    </BalDataList>
  )
}

export default WithdrawSummary
