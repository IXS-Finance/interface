import React from 'react'

import { Container } from '@mui/material'
import DepositedStakedLiquidity from './components/DepositedStakedLiquidity'
import LockRewards from './components/LockRewards'
import VotingRewards from './components/VotingRewards'
import { DashProvider } from './DashProvider'
import DexV2Layout from '../common/Layout'

const Dashboard: React.FC = () => {
  return (
    <DashProvider>
      <Container>
        <DexV2Layout>
          <DepositedStakedLiquidity />
          <LockRewards />
          <VotingRewards />
        </DexV2Layout>
      </Container>
    </DashProvider>
  )
}

export default Dashboard
