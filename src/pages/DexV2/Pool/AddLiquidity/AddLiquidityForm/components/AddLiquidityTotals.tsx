import React from 'react'
import styled from 'styled-components'
import clsx from 'clsx'
import useNumbers, { FNumFormats } from 'hooks/dex-v2/useNumbers'
import { Pool } from 'services/pool/types'
import { useJoinPool } from 'state/dexV2/pool/useJoinPool'
import useUserSettings from 'state/dexV2/userSettings/useUserSettings'
import { useAddLiquidityTotals } from '../useAddLiquidityTotals'
import { Flex } from 'rebass'
import LoadingBlock from 'pages/DexV2/common/LoadingBlock'
import Tooltip from 'pages/DexV2/common/Tooltip'
import { AlertTriangle, Info } from 'react-feather'

interface Props {
  pool: Pool
  isLoadingQuery: boolean
}

const JoinPoolDataTable: React.FC<Props> = ({ pool, isLoadingQuery }) => {
  const { fNum } = useNumbers()
  const { slippage } = useUserSettings()

  const {
    highPriceImpact,
    priceImpact,
    fiatValueIn,
    bptOut,
  } = useJoinPool(pool)

  const { priceImpactClasses } = useAddLiquidityTotals(pool)

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
        </Flex>
      </Flex>

      <SecondaryRow>
        <Cell>LP tokens</Cell>
        <NumberCell>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {!isLoadingQuery ? (
              <strong style={{ marginRight: 4 }}>{fNum(bptOut, FNumFormats.token)}</strong>
            ) : (
              <LoadingBlock className="w-40" />
            )}
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
        <Cell>Price Impact</Cell>
        <NumberCell>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {!isLoadingQuery ? (
              <strong style={{ marginRight: 4 }}>{fNum(priceImpact, FNumFormats.percent)}</strong>
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
