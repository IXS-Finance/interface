import React from 'react'
import { useAccount } from 'wagmi'
import { Redirect } from 'react-router-dom'
import styled from 'styled-components'

import { ReactComponent as ErrorIcon } from 'assets/launchpad/svg/earth.svg'
import { ReactComponent as CrossIcon } from 'assets/launchpad/svg/close.svg'
import Modal from 'components/Modal'
import { routes } from 'utils/routes'
import { Flex } from 'rebass'

interface Props {
  isOpen?: boolean // optional prop to control open/close state
  onClose?: () => void
}

export const UnsupportedCountryPopup: React.FC<Props> = (props) => {
  const { address: account } = useAccount()

  // Use props.isOpen or default to true.
  const [isOpen, setIsOpen] = React.useState(props.isOpen ?? true)

  // Sync local state when props.isOpen changes
  React.useEffect(() => {
    if (typeof props.isOpen === 'boolean') {
      setIsOpen(props.isOpen)
    }
  }, [props.isOpen])

  const toggleModal = React.useCallback((newState?: boolean) => {
    // If newState is passed, use it; otherwise toggle.
    const finalState = typeof newState === 'boolean' ? newState : !isOpen
    setIsOpen(finalState)
    if (!finalState && props.onClose) {
      props.onClose()
    }
  }, [isOpen, props.onClose])

  return (
    <Modal isOpen={isOpen} onDismiss={() => toggleModal(false)}>
      {account ? (
        <Container>
          <ExitIconContainer onClick={() => toggleModal(false)}>
            <CrossIcon />
          </ExitIconContainer>

          <>
            <KYCPromptIconContainer>
              <ErrorIcon />
            </KYCPromptIconContainer>

            <Flex flexDirection="column" alignItems="center" css={{ gap: '16px' }}>
              <Title>Coming Soon to Your Country</Title>

              <Caption>
                {`We don't currently support your country. We'll let you know as soon as we're available in your area. Stay tuned for updates!`}
              </Caption>
            </Flex>

            <CloseButton onClick={() => toggleModal(false)}>
              <span>Close</span>
            </CloseButton>
          </>
        </Container>
      ) : (
        <Redirect to={routes.launchpad} />
      )}
    </Modal>
  )
}

export const Container = styled.div`
  display: flex;
  width: 419px;
  padding: 64px 32px 32px 32px;
  flex-direction: column;
  align-items: center;
  gap: 30px;
  border-radius: 16px;
  background: #fff;
  position: relative;
`

const Title = styled.div`
  color: #292933;
  text-align: center;
  font-family: Inter;
  font-size: 20px;
  font-style: normal;
  font-weight: 600;
  line-height: 130%;
  letter-spacing: -0.6px;
`

const Caption = styled.div`
  color: #666680;
  text-align: center;
  font-family: Inter;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: 150%;
  letter-spacing: -0.32px;
`

const CloseButton = styled.button`
  display: flex;
  width: 100%;
  height: 48px;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
  border-radius: 6px;
  border: 1px solid rgba(102, 102, 255, 0.2);
  background: #fff;
  color: #b8b8cc;
  font-family: Inter;
  font-size: 13px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  letter-spacing: -0.26px;
  outline: none;
  cursor: pointer;

  &:hover {
    transform: scale(1.02);
    transition: transform 0.2s ease-in-out;
  }
`

const ExitIconContainer = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  cursor: pointer;

  svg {
    fill: ${(props) => props.theme.launchpad.colors.text.body};
  }
`

const KYCPromptIconContainer = styled.div`
  display: grid;
  place-content: center;
  border: 1px solid ${(props) => props.theme.launchpad.colors.border.default};
  border-radius: 50%;
  width: 80px;
  height: 80px;
`
