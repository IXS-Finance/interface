import React from 'react'
import Modal from '.'

interface UnknownTokenPriceModalProps {
  visible: boolean
  onClose: () => void
}

const UnknownTokenPriceModal: React.FC<UnknownTokenPriceModalProps> = ({ visible, onClose }) => {
  if (!visible) {
    return null
  }
  return (
    <Modal onClose={onClose}>
      <p>The price of the token you are trying to trade is unknown. Please proceed with caution.</p>
    </Modal>
  )
}

export default UnknownTokenPriceModal
