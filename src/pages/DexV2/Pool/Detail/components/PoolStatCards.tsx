import React, { Fragment } from 'react'
import styled from 'styled-components'
import { AprBreakdown } from '@ixswap1/dex-v2-sdk'

import useNumbers, { FNumFormats } from 'hooks/dex-v2/useNumbers'
import { APR_THRESHOLD, VOLUME_THRESHOLD } from 'constants/dexV2/pools'
import { Pool } from 'services/pool/types'
import useWeb3 from 'hooks/dex-v2/useWeb3'
import { shouldHideAprs, totalAprLabel } from 'hooks/dex-v2/usePoolHelpers'
import { Flex } from 'rebass'
import LoadingBlock from 'pages/DexV2/common/LoadingBlock'

interface Props {
  pool?: Pool | null
  poolApr: AprBreakdown | null
  loading?: boolean
  loadingApr?: boolean
}

const PoolStatCards: React.FC<Props> = ({ pool = null, poolApr = null, loading = false, loadingApr = false }) => {
  // Hooks (replace these with your React equivalents)
  const { fNum } = useNumbers()
  const { isWalletReady } = useWeb3()

  // Calculate APR label
  const aprLabel = poolApr ? totalAprLabel(poolApr, pool?.boost, isWalletReady) : '0'

  // Calculate snapshot values and stats
  const volumeSnapshot = Number(pool?.volumeSnapshot || '0')
  const feesSnapshot = Number(pool?.feesSnapshot || '0')
  const stats = [
    {
      id: 'poolValue',
      label: 'Pool value',
      value: fNum(pool?.totalLiquidity || '0', FNumFormats.fiat),
      loading: loading,
    },
    {
      id: 'volumeTime',
      label: `Volume (24h)`,
      value: fNum(volumeSnapshot > VOLUME_THRESHOLD ? '-' : volumeSnapshot, FNumFormats.fiat),
      loading: loading,
    },
    {
      id: 'feesTime',
      label: 'Fees (24h)',
      value: fNum(feesSnapshot > VOLUME_THRESHOLD ? '-' : feesSnapshot, FNumFormats.fiat),
      loading: loading,
    },
    {
      id: 'apr',
      label: 'APR',
      value: Number(poolApr?.swapFees || '0') > APR_THRESHOLD || shouldHideAprs(pool?.id || '') ? '-' : aprLabel,
      loading: loading || loadingApr,
      tooltip: '',
    },
  ]

  return (
    <Flex
      alignItems="center"
      alignSelf="stretch"
      css={{
        gap: '20px',
      }}
    >
      {stats.map((stat) => (
        <Fragment key={stat.id}>
          {stat.loading || !pool ? (
            <LoadingBlock className="h-24" />
          ) : (
            <Info>
              <div className="label">{stat.label}</div>
              <div className="value">{stat.value}</div>
            </Info>
          )}
        </Fragment>
      ))}
    </Flex>
  )
}

export default PoolStatCards

const Info = styled.div`
  display: flex;
  padding: 32px;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  flex: 1 0 0;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.3);
  box-shadow: 0px 30px 48px 0px rgba(63, 63, 132, 0.05);

  .label {
    color: #b8b8d2;
    font-family: Inter;
    font-size: 14px;
    font-style: normal;
    font-weight: 500;
    line-height: normal;
    letter-spacing: -0.42px;
  }

  .value {
    align-self: stretch;
    color: rgba(41, 41, 51, 0.9);
    font-family: Inter;
    font-size: 24px;
    font-style: normal;
    font-weight: 600;
    line-height: normal;
    letter-spacing: -0.72px;
  }
`
