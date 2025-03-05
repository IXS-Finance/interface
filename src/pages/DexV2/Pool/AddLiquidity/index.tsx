import React, { useEffect } from 'react'
import styled from 'styled-components'
import { useParams } from 'react-router-dom'

import LoadingBlock from 'pages/DexV2/common/LoadingBlock'
import { usePool } from 'state/dexV2/pool/usePool'
import AddLiquidityCard from './AddLiquidityCard'
import useWeb3 from 'hooks/dex-v2/useWeb3'
import { useTokens } from 'state/dexV2/tokens/hooks/useTokens'
import DexV2Layout from 'pages/DexV2/common/Layout'

const AddLiquidity: React.FC = () => {
  const params = useParams<any>()
  const poolId = (params.id as string).toLowerCase()
  const { pool, isLoadingPool } = usePool(poolId)
  const { appNetworkConfig, isWalletReady } = useWeb3()
  const { injectSpenders, tokens } = useTokens()

  const isLoading: boolean = isLoadingPool

  useEffect(() => {
    injectSpenders([appNetworkConfig.addresses.vault])
  }, [isWalletReady])

  return (
    <DexV2Layout>
      <Container>
        {!isLoading && pool && pool.address && tokens && Object.keys(tokens).length > 1 ? (
          <AddLiquidityCard pool={pool} />
        ) : (
          <LoadingBlock className="h-120" />
        )}
      </Container>
    </DexV2Layout>
  )
}

export default AddLiquidity

const Container = styled.div`
  padding: 0 1rem;
  margin: 0 auto;
  width: 100%;
  max-width: 462px;

  .h-120 {
    height: 30rem;
  }
`
