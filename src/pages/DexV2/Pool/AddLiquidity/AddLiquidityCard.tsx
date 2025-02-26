import React from 'react'
import { Box, Flex } from 'rebass'

import { configService } from 'services/config/config.service'
import BalCard from 'pages/DexV2/common/Card'
import AddLiquidityForm from './AddLiquidityForm'
import { useTokens } from 'state/dexV2/tokens/hooks/useTokens'
import SwapSettingsPopover, { SwapSettingsContext } from 'pages/DexV2/common/popovers/SwapSettingsPopover'

interface AddLiquidityCardProps {
  pool: any
}

const AddLiquidityCard: React.FC<AddLiquidityCardProps> = ({ pool }) => {
  const { network } = configService
  const { tokens } = useTokens()

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

      {pool && pool.address && tokens && Object.keys(tokens).length > 0 ? <AddLiquidityForm pool={pool} /> : null}
    </BalCard>
  )
}

export default AddLiquidityCard
