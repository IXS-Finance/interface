import React, { useState } from 'react'
import Portal from '@reach/portal'
import styled from 'styled-components'

import { CenteredFixed } from 'components/LaunchpadMisc/styled'
import { ReactComponent as CloseIcon } from 'assets/images/dex-v2/close.svg'

interface SwapSettingsModalProps {
  onClose: () => void
}

const SwapSettingsModal: React.FC<SwapSettingsModalProps> = ({ onClose }) => {
  const [fee, setFee] = useState<string>('0')

  const onFeeChange = (value: string) => {
    console.log(value)
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
    }
  }
  return (
    <Portal>
      <CenteredFixed width="100vw" height="100vh">
        <ModalContent>
          <HeaderModal>
            <TitleWrapper>
              <Title>Transaction settings</Title>
              <CloseButton onClick={onClose}>
                <CloseIcon />
              </CloseButton>
            </TitleWrapper>
          </HeaderModal>

          <BodyModal>
            <div>Slippage</div>
            <Wrapper>
              <StyledInput
                placeholder="0"
                value={fee}
                min="0"
                step="0.01"
                onKeyDown={onKeyDown}
                type="text"
                inputMode="decimal"
                pattern="[0-9]*[.,]?[0-9]*"
                onChange={(e) => onFeeChange(e.target.value)}
              />
              <PercentSymbol>%</PercentSymbol>
            </Wrapper>
            <ButtonContainer>
              <StyledButton onClick={() => onFeeChange('0.5')}>0.5%</StyledButton>
              <StyledButton onClick={() => onFeeChange('1')}>1%</StyledButton>
              <StyledButton onClick={() => onFeeChange('2')}>1%</StyledButton>
            </ButtonContainer>
          </BodyModal>
        </ModalContent>
      </CenteredFixed>
    </Portal>
  )
}

export default SwapSettingsModal

const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  width: 480px;
`

const HeaderModal = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
  align-self: stretch;
  padding-top: 32px;
  padding-left: 32px;
  padding-right: 32px;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
`

const BodyModal = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-top: 16px;
  padding-left: 32px;
  padding-right: 32px;
  padding-bottom: 32px;
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 16px;
`

const CloseButton = styled.div`
  cursor: pointer;
  color: rgba(41, 41, 51, 0.5);
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  letter-spacing: -0.42px;
`

const TitleWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`

const Title = styled.div`
  color: rgba(41, 41, 51, 0.9);
  font-family: Inter;
  font-size: 20px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  letter-spacing: -0.6px;
`

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid #e6e6ff;
  background: #fff;
  border-radius: 8px;
  padding: 0 16px;
  height: 50px;
`

const StyledInput = styled.input`
  border: none;
  outline: none;
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  letter-spacing: -0.42px;
  flex: 1;
`

const PercentSymbol = styled.div`
  margin-left: 8px;
  color: #b8b8d2;
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  letter-spacing: -0.42px;
`

const ButtonContainer = styled.div`
  display: flex;
  gap: 8px;
`

const StyledButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 33px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid #e6e6ff;
  background: #fff;
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  letter-spacing: -0.42px;
  color: #292933;
  cursor: pointer;

  &:hover {
    background: #f0f0ff;
  }
`
