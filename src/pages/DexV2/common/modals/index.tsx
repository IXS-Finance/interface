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
      <ModalWrapper width="100vw" height="100vh">
        <ModalContent>
          <ExitIconContainer onClick={onClose}>
            <CrossIcon />
          </ExitIconContainer>
          {children}
        </ModalContent>
      </ModalWrapper>
    </Portal>
  )
}

export default Modal

const ModalWrapper = styled.div<{ width?: string; height?: string }>`
  display: grid;
  place-content: center;
  ${(props) => props.width && `width: ${props.width};`}
  ${(props) => props.height && `height: ${props.height};`}
  background: rgba(143, 143, 204, 0.2);
  backdrop-filter: blur(8px);
  position: fixed;
  top: 0;
  left: 0;
  z-index: 10;
`

const ModalContent = styled.div`
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
