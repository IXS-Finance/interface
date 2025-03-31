import React, { useMemo } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { getAddress } from '@ethersproject/address'

import { routes } from 'utils/routes'
import useWeb3 from 'hooks/dex-v2/useWeb3'
import { Pool } from 'services/pool/types'
import BalCard from 'pages/DexV2/common/Card'
import { useTokens } from 'state/dexV2/tokens/hooks/useTokens'
import { bnum } from 'lib/utils'
import useNumbers, { FNumFormats } from 'hooks/dex-v2/useNumbers'
import BalBtn from 'pages/DexV2/common/popovers/BalBtn'

export interface PoolActionsCardProps {
  pool: Pool
  missingPrices: boolean
}

const PoolActionsCard: React.FC<PoolActionsCardProps> = ({ pool, missingPrices }) => {
  const { isWalletReady } = useWeb3()
  const history = useHistory()
  const params = useParams<any>()
  const poolId = (params.id as string).toLowerCase()
  const { balanceFor } = useTokens()
  const { fNum } = useNumbers()

  const fiatValueOfUnstakedShares = bnum(pool.totalLiquidity)
    .div(pool.totalShares)
    .times(balanceFor(getAddress(pool.address)))
    .toString()

  const hasBpt = pool?.address ? bnum(balanceFor(pool?.address)).gt(0) : false

  const handleAddLiquidity = () => {
    const path = routes.dexV2PoolAddLiquidity.replace(':id', poolId)
    history.push(path)
  }

  const handleWithdraw = () => {
    const path = routes.dexV2PoolWithdraw.replace(':id', poolId)
    history.push(path)
  }

  return (
    <BalCard shadow="none" noBorder className="p-4">
      {!isWalletReady ? (
        <Button color="gradient" disabled>
          Connect Wallet
        </Button>
      ) : (
        <div>
          <Title>You can invest</Title>
          <Description>Based on pool tokens in your wallet</Description>

          <AmountText>{fNum(fiatValueOfUnstakedShares, FNumFormats.fiat)}</AmountText>

          <Grid>
            <BalBtn color="blue" outline disabled={!hasBpt} onClick={handleWithdraw}>
              Withdraw
            </BalBtn>

            <BalBtn color="blue" onClick={handleAddLiquidity}>
              Add Liquidity
            </BalBtn>
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

const Title = styled.div`
  color: rgba(41, 41, 51, 0.9);
  font-family: Inter;
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  letter-spacing: -0.48px;
`

const Description = styled.div`
  color: #b8b8d2;
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  letter-spacing: -0.42px;
`

const AmountText = styled.div`
  color: rgba(41, 41, 51, 0.9);
  text-align: right;
  font-family: Inter;
  font-size: 32px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  letter-spacing: -0.96px;
  padding-bottom: 1rem;
  padding-top: 1rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid rgba(230, 230, 255, 0.6);
`
