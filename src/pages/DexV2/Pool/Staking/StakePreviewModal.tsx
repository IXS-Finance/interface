import React from 'react'

import { Pool } from 'services/pool/types'
import { StakeAction } from './hooks/useStakePreview'
import Modal from 'pages/DexV2/common/modals'
import StakePreview from './StakePreview'

interface StakeModalProps {
  isVisible: boolean
  pool: Pool
  action: StakeAction
  onClose: () => void
  onSuccess: () => void
}

const StakePreviewModal: React.FC<StakeModalProps> = ({ isVisible, pool, action, onClose, onSuccess }) => {
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
        <StakePreview pool={pool} action={action} onClose={handleClose} onSuccess={handleSuccess} />
      </div>
    </Modal>
  )
}

export default StakePreviewModal
