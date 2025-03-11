import React from 'react'
import { Box, Flex } from 'rebass'

import BalCard from 'pages/DexV2/common/Card'
import AddLiquidityForm from './AddLiquidityForm'
import SwapSettingsPopover, { SwapSettingsContext } from 'pages/DexV2/common/popovers/SwapSettingsPopover'

interface AddLiquidityCardProps {
  pool: any
}

const AddLiquidityCard: React.FC<AddLiquidityCardProps> = ({ pool }) => {
  return (
    <BalCard noBorder shadow="xl" exposeOverflow className="px-5 py-4">
      <Box width="100%">
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
