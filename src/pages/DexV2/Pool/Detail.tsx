import React, { useMemo } from 'react'
import { useParams } from 'react-router-dom'

import LoadingBlock from '../common/LoadingBlock'
import { usePool } from 'state/dexV2/pool/usePool'
import useWeb3 from 'hooks/dex-v2/useWeb3'
import { useTokens } from 'state/dexV2/tokens/hooks/useTokens'
import { usePoolHelpers } from 'hooks/dex-v2/usePoolHelpers'

const PoolDetail: React.FC = () => {
  const params = useParams<any>()
  const poolId = (params.id as string).toLowerCase()

  const { pool, isLoadingPool } = usePool(poolId)
  const { isWalletReady } = useWeb3()
  const { prices } = useTokens()
  const {
    isStableLikePool,
    isLiquidityBootstrappingPool,
    isComposableStableLikePool,
    isDeprecatedPool,
    isNewPoolAvailable,
  } = usePoolHelpers(pool)

  const loadingPool = useMemo(() => isLoadingPool || !pool, [isLoadingPool, JSON.stringify(pool)])

  console.log('loadingPool', loadingPool)
  return (
    <div>
      <h1>Pool Detail</h1>
      <p>Details about the pool will be displayed here.</p>
      <LoadingBlock darker rounded="lg" />
    </div>
  )
}

export default PoolDetail
