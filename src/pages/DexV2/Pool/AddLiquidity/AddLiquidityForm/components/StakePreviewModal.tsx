import Modal from 'pages/DexV2/common/modals'
import React from 'react'

interface StakePreviewModalProps {
  onClose: () => void
}

const StakePreviewModal: React.FC<StakePreviewModalProps> = ({ onClose }) => {
  return <Modal onClose={onClose}>Test</Modal>
}

export default StakePreviewModal
