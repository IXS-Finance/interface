// WithdrawTotals.tsx
import React from 'react'
import styled from 'styled-components'
import useNumbers, { FNumFormats } from 'hooks/dex-v2/useNumbers'
import useExitPool from 'state/dexV2/pool/useExitPool'
import { Pool } from 'services/pool/types'
import LoadingBlock from 'pages/DexV2/common/LoadingBlock'
import BalTooltip from 'pages/DexV2/common/BalTooltip'

// Styled components (converted from Tailwind CSS)
const DataTable = styled.div`
  border-radius: 0.5rem;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border: 1px solid #e5e7eb;
  margin-top: 1rem;
`

const DataTableRow = styled.div<{ highPriceImpact: boolean }>`
  display: flex;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
  /* If highPriceImpact, use red background, white text, and no border */
  background-color: ${({ highPriceImpact }) => (highPriceImpact ? '#ef4444' : 'transparent')};
  color: ${({ highPriceImpact }) => (highPriceImpact ? 'white' : 'inherit')};
  /* We omit dark mode styles */
`

const LabelCell = styled.div`
  padding: 0.5rem; /* p-2 */
  font-size: 0.875rem;
`

const NumberCell = styled.div`
  padding: 0.5rem;
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-family: monospace;
`

interface WithdrawTotalsProps extends React.HTMLAttributes<HTMLDivElement> {
  pool: Pool
}

const WithdrawTotals: React.FC<WithdrawTotalsProps> = ({ pool }) => {
  const { fNum } = useNumbers()
  const { priceImpact, priceImpactValid, highPriceImpact, isLoadingQuery } = useExitPool(pool)

  // Compute row styles based on highPriceImpact flag.
  const rowHighImpact = highPriceImpact

  return (
    <DataTable>
      <DataTableRow highPriceImpact={!!rowHighImpact}>
        <LabelCell>Price impact</LabelCell>
        <NumberCell>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {isLoadingQuery ? (
              <LoadingBlock style={{ width: '2.5rem', height: '1.5rem' }} />
            ) : !priceImpactValid ? (
              <span>-</span>
            ) : (
              <span>{fNum(priceImpact, FNumFormats.percent)}</span>
            )}
            <BalTooltip text="Price impact from adding liquidity results when the value of each token added is not proportional to the weights of the pool. Adding non-proportional amounts causes the internal prices of the pool to change, as if you were swapping tokens. The higher the price impact, the worse price you’ll get to enter your position.">
              {/* Tooltip activator */}
              {rowHighImpact ? (
                <svg
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
              )}
            </BalTooltip>
          </div>
        </NumberCell>
      </DataTableRow>
    </DataTable>
  )
}

export default WithdrawTotals
