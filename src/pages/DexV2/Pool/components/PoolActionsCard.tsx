import React, { useMemo } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import styled from 'styled-components'

import { routes } from 'utils/routes'
import useWeb3 from 'hooks/dex-v2/useWeb3'
import { Pool } from 'services/pool/types'
import BalCard from 'pages/DexV2/common/Card'
import { useTokens } from 'state/dexV2/tokens/hooks/useTokens'
import { bnum } from 'lib/utils'

export interface PoolActionsCardProps {
  pool: Pool | undefined
  missingPrices: boolean
}

const PoolActionsCard: React.FC<PoolActionsCardProps> = ({ pool, missingPrices }) => {
  const { isWalletReady } = useWeb3()
  const history = useHistory()
  const params = useParams<any>()
  const poolId = (params.id as string).toLowerCase()
  const { balanceFor } = useTokens()

  const hasBpt = pool?.address ? bnum(balanceFor(pool?.address)).gt(0) : false

  const handleAddLiquidity = () => {
    const path = routes.dexV2PoolAddLiquidity.replace(':id', poolId)
    history.push(path)
  }

  const handleWithdraw = () => {
    const path = routes.dexV2PoolWithdraw.replace(':id', poolId)
    history.push(path)
  }

  console.log('hasBpt', hasBpt)
  return (
    <BalCard shadow="none" noBorder className="p-4">
      {!isWalletReady ? (
        <Button color="gradient" disabled>
          Connect Wallet
        </Button>
      ) : (
        <div>
          <Grid>
            <Button color="gradient" onClick={handleAddLiquidity}>
              Add Liquidity
            </Button>
            <Button color="blue" disabled={!hasBpt} onClick={handleWithdraw}>
              Withdraw
            </Button>
          </Grid>
        </div>
      )}
    </BalCard>
  )
}

export default PoolActionsCard

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
`

const Button = styled.button`
  width: 100%;
  padding: 0.75rem;
  border-radius: 0.375rem;
  font-weight: 600;
  text-align: center;
  cursor: pointer;
  border: none;
  background: ${({ color }) => (color === 'gradient' ? 'linear-gradient(90deg, #4f46e5, #8b5cf6)' : 'transparent')};
  color: ${({ color }) => (color === 'gradient' ? '#fff' : '#3b82f6')};
  border: ${({ color }) => (color === 'blue' ? '1px solid #3b82f6' : 'none')};
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
  pointer-events: ${({ disabled }) => (disabled ? 'none' : 'auto')};
`

const Text = styled.div`
  padding-top: 1rem;
  font-size: 0.75rem;
  color: #6b7280;
`

const Link = styled.a`
  font-weight: 500;
  cursor: pointer;
  color: #2563eb;
`
