// WithdrawTotals.tsx
import React from 'react'
import styled from 'styled-components'
import useNumbers, { FNumFormats } from 'hooks/dex-v2/useNumbers'
import useExitPool from 'state/dexV2/pool/useExitPool'
import { Pool } from 'services/pool/types'
import LoadingBlock from 'pages/DexV2/common/LoadingBlock'
import Tooltip from 'pages/DexV2/common/Tooltip'

interface WithdrawTotalsProps extends React.HTMLAttributes<HTMLDivElement> {
  pool: Pool
}

const WithdrawTotals: React.FC<WithdrawTotalsProps> = ({ pool }) => {
  const { fNum } = useNumbers()
  const { priceImpact, priceImpactValid, highPriceImpact, isLoadingQuery } = useExitPool(pool)

  const rowHighImpact = highPriceImpact

  return (
    <DataTable>
      <DataTableRow highPriceImpact={!!rowHighImpact}>
        <LabelCell>Price impact:</LabelCell>
        <NumberCell>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {isLoadingQuery ? (
              <LoadingBlock style={{ width: '2.5rem', height: '14px' }} />
            ) : !priceImpactValid ? (
              <span>-</span>
            ) : (
              <span>{fNum(priceImpact, FNumFormats.percent)}</span>
            )}
            <Tooltip text="Price impact from adding liquidity results when the value of each token added is not proportional to the weights of the pool. Adding non-proportional amounts causes the internal prices of the pool to change, as if you were swapping tokens. The higher the price impact, the worse price you’ll get to enter your position." />
          </div>
        </NumberCell>
      </DataTableRow>
    </DataTable>
  )
}

export default WithdrawTotals

const DataTable = styled.div`
  border-radius: 0.5rem;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border-top: 1px solid #e5e7eb;
  margin-top: 1rem;
  padding-top: 1rem;
`

const DataTableRow = styled.div<{ highPriceImpact: boolean }>`
  display: flex;
  align-items: center;
  border-radius: 0.5rem;
  color: ${({ highPriceImpact }) => (highPriceImpact ? '#ef4444' : 'inherit')};
`

const LabelCell = styled.div`
  color: #b8b8d2;
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  letter-spacing: -0.42px;
`

const NumberCell = styled.div`
  padding: 0.5rem;
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-family: monospace;
`
