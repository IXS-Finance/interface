import React from 'react'
import useNumbers, { FNumFormats } from 'hooks/dex-v2/useNumbers'

import useUserSettings from 'state/dexV2/userSettings/useUserSettings'
import BalDataList from '../../AddLiquidity/AddLiquidityForm/components/AddLiquidityPreview/components/BalDataList'
import BalDataListRow from '../../AddLiquidity/AddLiquidityForm/components/AddLiquidityPreview/components/BalDataListRow'
import BalTooltip from 'pages/DexV2/common/BalTooltip'

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
        <span>{fNum(fiatTotal, FNumFormats.fiat)}</span>
        <BalTooltip
          text={`The total value in ${currency.toUpperCase()} you’ll be withdrawing from this pool.`}
          iconSize="sm"
          className="ml-2"
        />
      </BalDataListRow>
      <BalDataListRow label="Price impact">
        <span>{fNum(priceImpact, FNumFormats.percent)}</span>
        <BalTooltip
          text="Price impact from removing liquidity results when the value of each token removed is not proportional to the weights of the pool. Removing non-proportional amounts causes the internal prices of the pool to change, as if you were swapping tokens. The higher the price impact, the worse price you’ll get for exiting your position."
          iconSize="sm"
          width="72"
          className="ml-2"
        />
      </BalDataListRow>
    </BalDataList>
  )
}

export default WithdrawSummary
