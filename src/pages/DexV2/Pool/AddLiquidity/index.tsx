import React, { useMemo } from 'react'
import styled from 'styled-components'
import { useParams } from 'react-router-dom'

import Col2Layout from 'pages/DexV2/common/Col2Layout'
import LoadingBlock from 'pages/DexV2/common/LoadingBlock'
import { usePool } from 'state/dexV2/pool/usePool'
import MyWallet from './MyWallet'
import AddLiquidityCard from './AddLiquidityCard'

interface AddLiquidityProps {
  // Add props definitions here if needed
}

const AddLiquidity: React.FC<AddLiquidityProps> = (props) => {
  const params = useParams<any>()
  const poolId = (params.id as string).toLowerCase()
  const { pool, isLoadingPool } = usePool(poolId)
  const isLoading: boolean = isLoadingPool

  return (
    <Container>
      {isLoading || !pool ? (
        <Col2Layout
          leftSpan="5"
          rightSpan="7"
          left={<LoadingBlock className="h-24" />}
          right={<LoadingBlock className="h-96" />}
        />
      ) : (
        <Col2Layout leftSpan="5" rightSpan="7" left={<MyWallet />} right={<AddLiquidityCard pool={pool} />} />
      )}
    </Container>
  )
}

export default AddLiquidity

const Container = styled.div`
  .h-24 {
    height: 6rem;
  }

  .h-96 {
    height: 24rem;
  }

  .h-64 {
    height: 16rem /* 256px */;
  }
`
