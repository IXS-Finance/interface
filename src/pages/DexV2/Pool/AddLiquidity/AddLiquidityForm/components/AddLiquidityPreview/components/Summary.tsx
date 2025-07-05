// Summary.tsx
import React from 'react'
import styled from 'styled-components'
import useNumbers, { FNumFormats } from 'hooks/dex-v2/useNumbers'
import useUserSettings from 'state/dexV2/userSettings/useUserSettings'

import { Pool } from 'services/pool/types'
import BalDataList from './BalDataList'
import BalDataListRow from './BalDataListRow'
import Tooltip from 'pages/DexV2/common/Tooltip'
import LoadingBlock from 'pages/DexV2/common/LoadingBlock'
import { Flex } from 'rebass'

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  pool: Pool
  fiatTotal: string
  priceImpact: number
  isLoadingPriceImpact?: boolean
  highPriceImpact?: boolean
  summaryTitle?: string
}

const Summary: React.FC<Props> = ({
  pool,
  fiatTotal,
  priceImpact,
  isLoadingPriceImpact = false,
  highPriceImpact = false,
  summaryTitle,
}) => {
  const { fNum } = useNumbers()
  const { currency } = useUserSettings()

  return (
    <Container>
      <BalDataList title={summaryTitle}>
        <BalDataListRow label="Total">
          <Flex alignItems="center">
            {fNum(fiatTotal, FNumFormats.fiat)}
            <Tooltip
              text={`The total value in ${currency.toUpperCase()} you’ll be adding into this pool.`}
              iconSize="sm"
              className="ml-2"
            />
          </Flex>
        </BalDataListRow>
        <BalDataListRow label="Price impact" className={highPriceImpact ? 'bg-red-50 text-red-500' : ''}>
          <div>
            {isLoadingPriceImpact ? (
              <LoadingBlock className="w-10 h-6" />
            ) : (
              <Flex alignItems="center">
                {fNum(priceImpact, FNumFormats.percent)}
                <Tooltip
                  text="Price impact from adding liquidity results when the value of each token added is not proportional to the weights of the pool. Adding non-proportional amounts causes the internal prices of the pool to change, as if you were swapping tokens. The higher the price impact, the worse price you’ll get to enter your position."
                  iconSize="sm"
                  iconName={highPriceImpact ? 'alert-triangle' : 'info'}
                  iconClass={highPriceImpact ? 'text-red-500' : 'text-gray-300'}
                  width="72"
                  className="ml-2"
                />
              </Flex>
            )}
          </div>
        </BalDataListRow>
      </BalDataList>
    </Container>
  )
}

export default Summary

const Container = styled.div`
  width: 100%;
  .w-10 {
    width: 2.5rem;
  }
  .h-6 {
    height: 1.5rem;
  }
  .ml-2 {
    margin-left: 0.5rem;
  }
  .bg-red-50 {
    background-color: #fef2f2;
  }
  .text-red-500 {
    color: #f87171;
  }
  .text-gray-300 {
    color: #d1d5db;
  }
`
