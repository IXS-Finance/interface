import React from 'react'
import styled from 'styled-components'
import clsx from 'clsx'
import useNumbers, { FNumFormats } from 'hooks/dex-v2/useNumbers'
import { Pool } from 'services/pool/types'
import { useJoinPool } from 'state/dexV2/pool/useJoinPool'
import useWeb3 from 'hooks/dex-v2/useWeb3'
import useUserSettings from 'state/dexV2/userSettings/useUserSettings'
import { useAddLiquidityTotals } from '../useAddLiquidityTotals'
import { Flex } from 'rebass'
import LoadingBlock from 'pages/DexV2/common/LoadingBlock'
import Tooltip from 'pages/DexV2/common/Tooltip'
import { AlertTriangle, Info } from 'react-feather'

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
    <Container>
      <Flex
        justifyContent="space-between"
        alignItems="center"
        css={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: 'solid 1px #e6e6ff' }}
      >
        <Total>Total</Total>
        <Flex alignItems="center" justifyContent="flex-end" css={{ gap: '8px' }}>
          <LPAmount>{fNum(fiatValueIn, FNumFormats.fiat)}</LPAmount>
          {isWalletReady && hasBalanceForSomeTokens && (
            <MaxButton maximized={maximized} onClick={maximizeAmounts}>
              {maximized ? 'Maxed' : 'Max'}
            </MaxButton>
          )}
        </Flex>
      </Flex>

      <SecondaryRow>
        <Cell>LP tokens</Cell>
        <NumberCell>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {!isLoadingQuery ? <strong>{fNum(bptOut, FNumFormats.token)}</strong> : <LoadingBlock className="w-40" />}
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
            {!isLoadingQuery ? (
              <strong>{fNum(priceImpact, FNumFormats.percent)}</strong>
            ) : (
              <LoadingBlock className="w-40" />
            )}
            <Tooltip text="Adding custom amounts causes the internal prices of the pool to change, as if you were swapping tokens. The higher the price impact the more you'll spend in swap fees.">
              {highPriceImpact ? (
                <AlertTriangle size="xs" style={{ marginLeft: '0.25rem', marginBottom: '-2px' }} />
              ) : (
                <Info
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
                <span style={{ color: '#9ca3af' }}>Optimized</span>
              ) : (
                <span style={{ cursor: 'pointer' }} className={clsx(optimizeBtnClasses)} onClick={optimizeAmounts}>
                  Optimize
                </span>
              )}
            </div>
          )}
        </NumberCell>
      </SecondaryRow>
    </Container>
  )
}

export default JoinPoolDataTable

const Container = styled.div`
  width: 100%;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: solid 1px #e6e6ff;
  margin-bottom: 1rem;

  .w-40 {
    width: 40px;
  }
`

const Total = styled.div`
  color: rgba(41, 41, 51, 0.9);
  text-align: center;
  font-family: Inter;
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  letter-spacing: -0.48px;
`

const MaxButton = styled.div<{ maximized: boolean }>`
  border-radius: 8px;
  background: #f7f7fa;
  display: flex;
  padding: 8px 16px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 10px;
  color: ${({ maximized }) => (maximized ? '#B8B8D2' : '#66F')};
  cursor: ${({ maximized }) => (maximized ? 'default' : 'pointer')};
  font-family: Inter;
  font-size: 9px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  letter-spacing: -0.18px;
  text-transform: uppercase;
`

const LPAmount = styled.div`
  color: rgba(41, 41, 51, 0.9);
  font-family: Inter;
  font-size: 20px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  letter-spacing: -0.6px;
`

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 3fr;
  align-items: center;
  border-bottom: 1px solid #e5e7eb;
`

const SecondaryRow = styled(Row)`
  font-size: 14px;
`

const Cell = styled.div`
  padding: 0.5rem;
  padding-left: 0;
`

const NumberCell = styled(Cell)`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

interface IconProps {
  name: string
  size: string
  style?: React.CSSProperties
}
const Icon: React.FC<IconProps> = ({ name, size, style }) => <i className={`icon-${name} icon-${size}`} style={style} />
