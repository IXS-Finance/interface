import React from 'react'
import { Box, Flex } from 'rebass'

import { configService } from 'services/config/config.service'
import BalCard from 'pages/DexV2/common/Card'
import AddLiquidityForm from './AddLiquidityForm'
import SwapSettingsPopover, { SwapSettingsContext } from 'pages/DexV2/common/popovers/SwapSettingsPopover'

interface AddLiquidityCardProps {
  pool: any
}

const AddLiquidityCard: React.FC<AddLiquidityCardProps> = ({ pool }) => {
  const { network } = configService

  return (
    <BalCard noBorder shadow="xl" exposeOverflow>
      <Box width="100%">
        <Box
          fontSize="0.75rem" // equivalent to text-xs
          lineHeight="1" // equivalent to leading-none
          sx={{
            color: 'secondary', // ensure your theme defines "secondary" or use a hex value like "#6b7280"
          }}
        >
          {network.chainName}
        </Box>
        <Flex alignItems="center" justifyContent="space-between">
          <Box as="h4" css={{ lineHeight: 1.75 }}>
            Add liquidity
          </Box>
          <SwapSettingsPopover context={SwapSettingsContext.invest} />
        </Flex>
      </Box>
      <AddLiquidityForm pool={pool} />
    </BalCard>
  )
}

export default AddLiquidityCard
