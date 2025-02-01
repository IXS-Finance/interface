import Portal from '@reach/portal'
import React from 'react'
import styled from 'styled-components'

interface ModalProps {
  isOpen: boolean
  children: React.ReactNode
  onClose: () => void
}

const Modal: React.FC<ModalProps> = ({ isOpen, children, onClose}) => {
  return (
    <Portal>
      <Content width="100vw" height="100vh">
        {children}
      </Content>
    </Portal>
  )
}

export default Modal

export const Content = styled.div<{ width?: string; height?: string }>`
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
