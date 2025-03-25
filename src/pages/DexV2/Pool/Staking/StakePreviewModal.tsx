import React, { useEffect, useState } from 'react'

import { Pool } from 'services/pool/types'
import { StakeAction } from './hooks/useStakePreview'
import Modal from 'pages/DexV2/common/modals'
import { usePoolStaking } from 'state/dexV2/poolStaking/usePoolStaking'
import StakePreview from './StakePreview'

interface StakeModalProps {
  isVisible: boolean
  pool: Pool
  action: StakeAction
  onClose: () => void
  onSuccess: () => void
}

const StakePreviewModal: React.FC<StakeModalProps> = ({ isVisible, pool, action, onClose, onSuccess }) => {
  // State to control fireworks display
  const [showFireworks, setShowFireworks] = useState(false)
  // const { setCurrentPool } = usePoolStaking()

  // // Set the current pool when component mounts or when pool changes
  // useEffect(() => {
  //   setCurrentPool(pool.id)
  // }, [pool, setCurrentPool])

  // Handle modal close
  const handleClose = () => {
    setShowFireworks(false)
    onClose()
  }

  // Handle success action
  const handleSuccess = () => {
    setShowFireworks(true)
    onSuccess()
  }

  if (!isVisible) return null

  return (
    <Modal noPadding onClose={onClose}>
      <div>
        {/* <BalModal show={isVisible} fireworks={showFireworks} onClose={handleClose}> */}
       <StakePreview pool={pool} action={action} onClose={handleClose} onSuccess={handleSuccess} />
      </div>
    </Modal>
  )
}

export default StakePreviewModal
