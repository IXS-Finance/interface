import React from 'react'
import styled from 'styled-components'

import useWeb3 from 'hooks/dex-v2/useWeb3'
import { useTokens } from 'state/dexV2/tokens/hooks/useTokens'
import useNumbers from 'hooks/dex-v2/useNumbers'
import PoolActionsCard from './PoolActionsCard'
import { Pool } from 'services/pool/types'

interface MyPoolBalancesCardProps {
  pool: Pool | undefined
  missingPrices: boolean
}

const MyPoolBalancesCard: React.FC<MyPoolBalancesCardProps> = ({ pool, missingPrices }) => {
  const { balanceFor } = useTokens()
  const { fNum } = useNumbers()
  const { isWalletReady } = useWeb3()

  return (
    <Card>
      <Header>
        <Title>My pool balance</Title>
        <Value>-</Value>
      </Header>
      {/* <ButtonWrapper>
        <Button>Migrate Liquidity</Button>
      </ButtonWrapper> */}
      <Footer>
        <PoolActionsCard pool={pool} missingPrices={missingPrices} />
      </Footer>
    </Card>
  )
}

export default MyPoolBalancesCard

const Card = styled.div`
  border-radius: 0.75rem;
  box-shadow: 0px 10px 15px -3px rgba(0, 0, 0, 0.1);
  background: white;
  overflow: hidden;
`

const Header = styled.div`
  padding: 1rem;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #374151;
`

const Title = styled.div`
  font-size: 1rem;
`

const Value = styled.div`
  font-size: 1.5rem;
`

const ButtonWrapper = styled.div`
  padding: 0.5rem 1rem;
`

const Button = styled.button`
  width: 100%;
  padding: 0.75rem;
  border-radius: 0.375rem;
  font-weight: 600;
  text-align: center;
  cursor: pointer;
  border: none;
  background: #3b82f6;
  color: white;
`

const Footer = styled.div`
  padding: 1rem;
  border-top: 1px solid #374151;
`
