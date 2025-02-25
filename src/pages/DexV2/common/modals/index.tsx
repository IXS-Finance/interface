import Portal from '@reach/portal'
import React from 'react'
import styled from 'styled-components'

import { ReactComponent as CrossIcon } from 'assets/launchpad/svg/close.svg'

interface ModalProps {
  children: React.ReactNode
  onClose: () => void
}

const Modal: React.FC<ModalProps> = ({ children, onClose }) => {
  return (
    <Portal>
      <ModalBackdrop>
        <ModalContainer>
          <ExitIconContainer onClick={onClose}>
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

const ModalContainer = styled.div`
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  gap: 1rem;
  position: relative;
  width: 480px;
  background: ${(props) => props.theme.launchpad.colors.background};
  border-radius: 8px;
  padding: 2rem;
`

export const ExitIconContainer = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  cursor: pointer;

  svg {
    fill: ${(props) => props.theme.launchpad.colors.text.body};
  }
`
