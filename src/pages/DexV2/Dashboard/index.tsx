import React from 'react'
import _get from 'lodash/get'

import { Container } from '@mui/material'
import LiquidityRewards from './components/LiquidityRewards'
import LockRewards from './components/LockRewards'
import VotingRewards from './components/VotingRewards'
import { DashProvider } from './DashProvider'
import DexV2Layout from '../common/Layout'

const Dashboard: React.FC = () => {
  return (
    <DashProvider>
      <Container>
        <DexV2Layout>
          <LiquidityRewards />
          <LockRewards />
          <VotingRewards />
        </DexV2Layout>
      </Container>
    </DashProvider>
  )
}

export default Dashboard
