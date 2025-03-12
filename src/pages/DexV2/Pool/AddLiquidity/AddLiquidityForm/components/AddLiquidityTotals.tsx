import React from 'react'
import styled from 'styled-components'
import clsx from 'clsx'
import useNumbers, { FNumFormats } from 'hooks/dex-v2/useNumbers'
import { Pool } from 'services/pool/types'
import { useJoinPool } from 'state/dexV2/pool/useJoinPool'
import useWeb3 from 'hooks/dex-v2/useWeb3'
import useUserSettings from 'state/dexV2/userSettings/useUserSettings'
import { useAddLiquidityTotals } from '../useAddLiquidityTotals'

// Dummy translation function (replace with your i18n solution if needed)
const t = (key: string) => {
  const translations: { [key: string]: string } = {
    total: 'Total',
    maxed: 'Maxed',
    max: 'Max',
    priceImpact: 'Price Impact',
    optimize: 'Optimize',
    optimized: 'Optimized',
    customAmountsTip: 'Custom amounts tip',
  }
  return translations[key] || key
}

interface Props {
  pool: Pool
  isLoadingQuery: boolean
}

const JoinPoolDataTable: React.FC<Props> = ({ pool, isLoadingQuery }) => {
  const { fNum } = useNumbers()
  const { isWalletReady } = useWeb3()
  const { slippage } = useUserSettings()

  const { highPriceImpact, priceImpact, supportsProportionalOptimization, fiatValueIn, bptOut } = useJoinPool(pool)

  const {
    priceImpactClasses, // if any extra classes are returned by the hook
    optimizeBtnClasses, // if any extra classes are returned by the hook
    hasBalanceForAllTokens,
    hasBalanceForSomeTokens,
    optimized,
    maximized,
    maximizeAmounts,
    optimizeAmounts,
  } = useAddLiquidityTotals(pool)

  return (
    <DataTable>
      <TotalRow>
        <Cell>{t('total')}</Cell>
        <NumberCell>
          {fNum(fiatValueIn, FNumFormats.fiat)}
          {isWalletReady && hasBalanceForSomeTokens && (
            <div style={{ fontSize: '0.875rem' }}>
              {maximized ? (
                <span style={{ color: '#9ca3af' }}>{t('maxed')}</span>
              ) : (
                <span style={{ color: '#3b82f6', cursor: 'pointer' }} onClick={maximizeAmounts}>
                  {t('max')}
                </span>
              )}
            </div>
          )}
        </NumberCell>
      </TotalRow>

      <SecondaryRow>
        <Cell>LP tokens</Cell>
        <NumberCell>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {!isLoadingQuery ? <span>{fNum(bptOut, FNumFormats.token)}</span> : <LoadingBlock width="40px" />}
            <Tooltip
              text={`LP tokens you are expected to receive, not including possible slippage (${fNum(
                slippage,
                FNumFormats.percent
              )})`}
            >
              <Icon
                name="info"
                size="xs"
                style={{
                  marginLeft: '0.25rem',
                  marginBottom: '-2px',
                  color: '#9ca3af',
                }}
              />
            </Tooltip>
          </div>
        </NumberCell>
      </SecondaryRow>
      <SecondaryRow className={clsx(priceImpactClasses)}>
        <Cell>{t('priceImpact')}</Cell>
        <NumberCell>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {!isLoadingQuery ? <span>{fNum(priceImpact, FNumFormats.percent)}</span> : <LoadingBlock width="40px" />}
            <Tooltip text={t('customAmountsTip')}>
              {highPriceImpact ? (
                <Icon name="alert-triangle" size="xs" style={{ marginLeft: '0.25rem', marginBottom: '-2px' }} />
              ) : (
                <Icon
                  name="info"
                  size="xs"
                  style={{
                    marginLeft: '0.25rem',
                    marginBottom: '-2px',
                    color: '#9ca3af',
                  }}
                />
              )}
            </Tooltip>
          </div>
          {isWalletReady && hasBalanceForAllTokens && supportsProportionalOptimization && (
            <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>
              {optimized ? (
                <span style={{ color: '#9ca3af' }}>{t('optimized')}</span>
              ) : (
                <span style={{ cursor: 'pointer' }} className={clsx(optimizeBtnClasses)} onClick={optimizeAmounts}>
                  {t('optimize')}
                </span>
              )}
            </div>
          )}
        </NumberCell>
      </SecondaryRow>
    </DataTable>
  )
}

export default JoinPoolDataTable

// Styled components
const DataTable = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
`

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 3fr;
  align-items: center;
  border-bottom: 1px solid #e5e7eb;
`

const TotalRow = styled(Row)`
  font-size: 1.125rem;
  font-weight: bold;
  background-color: #f3f4f6;
`

const SecondaryRow = styled(Row)`
  font-size: 0.875rem;
`

const Cell = styled.div`
  padding: 0.5rem;
`

const NumberCell = styled(Cell)`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

// Placeholder components – replace with your own implementations as needed
interface LoadingBlockProps {
  width?: string
}
const LoadingBlock: React.FC<LoadingBlockProps> = ({ width = '40px' }) => (
  <div style={{ width, height: '1em', backgroundColor: '#e5e7eb' }} />
)

interface TooltipProps {
  text: string
  children: React.ReactNode
}
const Tooltip: React.FC<TooltipProps> = ({ text, children }) => <span title={text}>{children}</span>

interface IconProps {
  name: string
  size: string
  style?: React.CSSProperties
}
const Icon: React.FC<IconProps> = ({ name, size, style }) => <i className={`icon-${name} icon-${size}`} style={style} />
