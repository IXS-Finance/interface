import React from 'react'
import _get from 'lodash/get'

import { Box, Container } from '@mui/material'
import LiquidityRewards from './components/LiquidityRewards'
import LockRewards from './components/LockRewards'
import VotingRewards from './components/VotingRewards'
import { DashProvider } from './DashProvider'

const Dashboard: React.FC = () => {
  return (
    <DashProvider>
      <Container>
        <Box mt={3}>
          <LiquidityRewards />
          <LockRewards />
          <VotingRewards />
        </Box>
      </Container>
    </DashProvider>
  )
}

export default Dashboard
