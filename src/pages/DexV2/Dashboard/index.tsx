import React from 'react'
import _get from 'lodash/get'

import { Box, Container } from '@mui/material'
import LiquidityRewards from './components/LiquidityRewards'
import LockRewards from './components/LockRewards'
import VotingRewards from './components/VotingRewards'

const Dashboard: React.FC = () => {
  return (
    <Container>
      <Box mt={3}>
        <LiquidityRewards />
        <LockRewards />
        <VotingRewards />
      </Box>
    </Container>
  )
}

export default Dashboard
