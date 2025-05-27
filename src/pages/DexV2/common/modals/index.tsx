import Portal from '@reach/portal'
import React, { useEffect } from 'react'
import styled from 'styled-components'

import { ReactComponent as CrossIcon } from 'assets/launchpad/svg/close.svg'

interface ModalProps {
  children: React.ReactNode
  onClose: () => void
  noPadding?: boolean
  size?: 'small' | 'medium' | 'large'
}

const Modal: React.FC<ModalProps> = ({ noPadding, children, onClose }) => {
  useEffect(() => {
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [])

  return (
    <Portal>
      <ModalBackdrop>
        <ModalContainer noPadding={noPadding}>
          <ExitIconContainer noPadding={noPadding} onClick={onClose}>
            <CrossIcon />
          </ExitIconContainer>
          {children}
        </ModalContainer>
      </ModalBackdrop>
    </Portal>
  )
}

export default Modal

const ModalBackdrop = styled.div<{ width?: string; height?: string }>`
  display: grid;
  place-content: center;
  width: 100vw;
  height: 100vh;
  background: rgba(143, 143, 204, 0.2);
  backdrop-filter: blur(5px);
  position: fixed;
  top: 0;
  left: 0;
  z-index: 10;
`

const ModalContainer = styled.div<{ noPadding?: boolean }>`
  display: flex;
  flex-flow: column nowrap;
  gap: 1rem;
  position: relative;
  width: 480px;
  background: ${(props) => props.theme.launchpad.colors.background};
  border-radius: 16px;
  padding: ${(props) => (props.noPadding ? '0' : '2rem')};
  max-height: 90vh;
  overflow-y: auto;
`

export const ExitIconContainer = styled.div<{ noPadding?: boolean }>`
  position: absolute;
  top: ${(props) => (props.noPadding ? '1.5rem' : '1rem')};
  right: ${(props) => (props.noPadding ? '1.5rem' : '1rem')};
  cursor: pointer;

  svg {
    fill: ${(props) => props.theme.launchpad.colors.text.body};
  }
`
