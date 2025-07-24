import React from 'react'

import { StakeAction } from './hooks/useStakePreview'
import Modal from 'pages/DexV2/common/modals'
import StakePreview, { StakePreviewPoolProps } from './StakePreview'
import { LP_DECIMALS } from './constants'

interface StakeModalProps {
  isVisible: boolean
  pool: StakePreviewPoolProps
  gaugeAddress: string
  currentShares: string
  unstakeBalance: bigint
  stakedBalance: bigint
  action: StakeAction
  onClose: () => void
  onSuccess: () => void
  emissionApr: string
}

const StakePreviewModal: React.FC<StakeModalProps> = ({
  isVisible,
  pool,
  gaugeAddress,
  currentShares,
  action,
  onClose,
  onSuccess,
  stakedBalance,
  unstakeBalance,
  emissionApr,
}) => {
  const lpToken = {
    address: pool.address,
    symbol: pool.name,
    decimals: LP_DECIMALS,
  }

  const handleClose = () => {
    onClose()
  }

  // Handle success action
  const handleSuccess = () => {
    onSuccess()
  }

  if (!isVisible) return null

  return (
    <Modal noPadding onClose={onClose}>
      <div>
        <StakePreview
          currentShares={currentShares}
          pool={pool}
          emissionApr={emissionApr}
          lpToken={lpToken}
          gaugeAddress={gaugeAddress}
          action={action}
          onClose={handleClose}
          onSuccess={handleSuccess}
          stakedBalance={stakedBalance}
          unstakeBalance={unstakeBalance}
        />
      </div>
    </Modal>
  )
}

export default StakePreviewModal
