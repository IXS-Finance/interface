import React, { useState } from 'react'
import { Trans } from '@lingui/macro'
import styled from 'styled-components'

import { ModalBlurWrapper, ModalContentWrapper, CloseIcon } from 'theme'
import RedesignedWideModal from 'components/Modal/RedesignedWideModal'

const ModalContent = styled(ModalContentWrapper)`
  padding: 1rem;
  max-width: 450px;
`

const Title = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: ${({ theme }) => theme.text1};
`

const Message = styled.div`
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 1.5rem;
  color: ${({ theme }) => theme.text2};
`

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid ${({ theme }) => theme.bg3};
  border-radius: 8px;
  background: ${({ theme }) => theme.bg1};
  color: ${({ theme }) => theme.text1};
  font-size: 14px;
  margin-bottom: 1.5rem;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary1};
  }

  &::placeholder {
    color: ${({ theme }) => theme.text3};
  }
`

const ButtonsContainer = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  width: 100%;
`

const BaseButton = styled.button`
  flex: 1;
  height: 48px;
  font-weight: 600;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.2;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

const ConfirmButton = styled(BaseButton)`
  background: #6666ff;
  border-color: #6666ff;
  color: white;

  &:hover:not(:disabled) {
    background: #5555ee;
    transform: translateY(-1px);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }
`

const CancelButton = styled(BaseButton)`
  background: transparent;
  border-color: #e6e6ff;
  color: #6666ff;

  &:hover:not(:disabled) {
    background: rgba(253, 121, 168, 0.1);
    transform: translateY(-1px);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }
`

interface ConfirmModalProps {
  isOpen: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({ isOpen, title, message, onConfirm, onCancel }) => {
  return (
    <RedesignedWideModal isOpen={isOpen} onDismiss={onCancel} maxHeight={'400px'}>
      <ModalBlurWrapper style={{ minWidth: '450px', maxWidth: '500px' }}>
        <ModalContent>
          <Title>
            <span>{title}</span>
            <CloseIcon onClick={onCancel} />
          </Title>
          <Message>{message}</Message>
          <ButtonsContainer>
            <CancelButton onClick={onCancel}>
              <Trans>Cancel</Trans>
            </CancelButton>
            <ConfirmButton onClick={onConfirm}>
              <Trans>Confirm</Trans>
            </ConfirmButton>
          </ButtonsContainer>
        </ModalContent>
      </ModalBlurWrapper>
    </RedesignedWideModal>
  )
}

interface PromptModalProps {
  isOpen: boolean
  title: string
  message: string
  placeholder?: string
  expectedValue?: string
  onConfirm: (value: string) => void
  onCancel: () => void
}

export const PromptModal: React.FC<PromptModalProps> = ({
  isOpen,
  title,
  message,
  placeholder = '',
  expectedValue,
  onConfirm,
  onCancel,
}) => {
  const [inputValue, setInputValue] = useState('')

  const handleConfirm = () => {
    if (expectedValue && inputValue !== expectedValue) {
      return // Don't confirm if expected value doesn't match
    }
    onConfirm(inputValue)
    setInputValue('')
  }

  const handleCancel = () => {
    setInputValue('')
    onCancel()
  }

  const isValidInput = !expectedValue || inputValue === expectedValue

  return (
    <RedesignedWideModal isOpen={isOpen} onDismiss={handleCancel} maxHeight={'450px'}>
      <ModalBlurWrapper style={{ minWidth: '450px', maxWidth: '500px' }}>
        <ModalContent>
          <Title>
            <span>{title}</span>
            <CloseIcon onClick={handleCancel} />
          </Title>
          <Message>{message}</Message>
          <Input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={placeholder}
            autoFocus
          />
          <ButtonsContainer>
            <CancelButton onClick={handleCancel}>
              <Trans>Cancel</Trans>
            </CancelButton>
            <ConfirmButton onClick={handleConfirm} disabled={!isValidInput}>
              <Trans>Confirm</Trans>
            </ConfirmButton>
          </ButtonsContainer>
        </ModalContent>
      </ModalBlurWrapper>
    </RedesignedWideModal>
  )
}
