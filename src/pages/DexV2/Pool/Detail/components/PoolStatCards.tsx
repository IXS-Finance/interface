import React, { Fragment } from 'react'
import styled from 'styled-components'

import useNumbers, { FNumFormats } from 'hooks/dex-v2/useNumbers'
import { VOLUME_THRESHOLD } from 'constants/dexV2/pools'
import { Pool } from 'services/pool/types'
import { Flex } from 'rebass'
import LoadingBlock from 'pages/DexV2/common/LoadingBlock'
import { fNum as numF } from 'lib/balancer/utils/numbers'
import usePoolDayDatas from 'hooks/dex-v2/pools/usePoolDayDatas'
import { getPoolAprValue } from 'lib/utils/poolApr'

interface Props {
  pool?: Pool | null
  loading?: boolean
}

const PoolAprCard = ({ pool }: { pool: Pool }) => {
  const { poolDayDatasFor } = usePoolDayDatas([pool.address])
  const poolApr = getPoolAprValue(pool, poolDayDatasFor(pool.address))

  return <>{numF('apr', poolApr)}</>
}

const PoolStatCards: React.FC<Props> = ({ pool = null, loading = false }) => {
  // Hooks (replace these with your React equivalents)
  const { fNum } = useNumbers()

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
      value: pool && <PoolAprCard pool={pool} />,
      loading: loading,
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
