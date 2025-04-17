import React, { useMemo } from 'react'
import styled from 'styled-components'

export type AlertType = 'warning' | 'error' | 'info' | 'tip'

export interface BalAlertProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: AlertType
  size?: 'sm' | 'md' | 'lg'
  title?: string
  description?: string
  actionLabel?: string
  raised?: boolean
  block?: boolean
  contentClass?: string
  square?: boolean
  noBorder?: boolean
  dismissable?: boolean
  onActionClick?: () => void
  onClose?: () => void
  // Optional slot override for the title
  titleSlot?: React.ReactNode
  // Default slot for description / extra content
  children?: React.ReactNode
}

/* Styled Components */

interface AlertWrapperProps {
  bgColor: string
  borderColor: string
  padding: string
  raised?: boolean
  block?: boolean
  rounded?: boolean
  noBorder?: boolean
}

const AlertWrapper = styled.div<AlertWrapperProps>`
  position: relative;
  display: inline-block;
  font-weight: 500;
  background-color: ${(p) => p.bgColor};
  padding: ${(p) => p.padding};
  ${(p) => !p.noBorder && `border: 1px solid ${p.borderColor};`}
  ${(p) =>
    p.raised &&
    `
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  `}
  ${(p) => p.block && `width: 100%;`}
  ${(p) => (p.rounded ? `border-radius: 0.5rem;` : '')}
`

interface AlertContainerProps {
  alignItems: string
}

const AlertContainer = styled.div<AlertContainerProps>`
  display: flex;
  flex-grow: 1;
  align-items: ${(p) => p.alignItems};
`

interface IconWrapperProps {
  size: string
  color: string
}

const IconWrapper = styled.div<IconWrapperProps>`
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.5rem;
  width: ${(p) => p.size};
  height: ${(p) => p.size};
  color: ${(p) => p.color};
`

interface ContentWrapperProps {
  flexDirection: string
}

const ContentWrapper = styled.div<ContentWrapperProps>`
  display: flex;
  flex-grow: 1;
  flex-direction: ${(p) => p.flexDirection};
  min-width: 0;
`

interface TitleProps {
  fontSize: string
  fontWeight: number
  titleColor: string
}

const Title = styled.h5<TitleProps>`
  margin: 0;
  color: ${(p) => p.titleColor};
  font-size: ${(p) => p.fontSize};
  font-style: normal;
  font-weight: ${(p) => p.fontWeight};
  line-height: 150%;
  letter-spacing: -0.28px;
`

interface DescriptionProps {
  fontSize: string
  color: string
}

const Description = styled.div<DescriptionProps>`
  overflow: hidden;
  word-break: break-word;
  white-space: pre-wrap;
  font-weight: normal;
  color: rgba(41, 41, 51, 0.5);
  font-family: Inter;
  font-size: ${(p) => p.fontSize};
  font-style: normal;
  line-height: 150%;
  letter-spacing: -0.28px;
`

const ActionWrapper = styled.div`
  display: flex;
`

const ActionButton = styled.button`
  background-color: transparent;
  border: none;
  color: blue;
  font-size: 0.75rem;
  cursor: pointer;
`

const DismissButtonWrapper = styled.div`
  position: absolute;
  top: 0.25rem;
  right: 0.25rem;
  cursor: pointer;
`

/* Main Component */

const BalAlert: React.FC<BalAlertProps> = ({
  type = 'info',
  size = 'md',
  title = 'A title message',
  description = '',
  actionLabel = '',
  raised = false,
  block = false,
  contentClass = '',
  square = false,
  noBorder = false,
  dismissable = false,
  onActionClick,
  onClose,
  titleSlot,
  children,
}) => {
  // Compute color and spacing values (remove dark mode colors)
  const bgColor = useMemo(() => {
    switch (type) {
      case 'tip':
        return '#ebf8ff' // blue-50
      case 'warning':
        return 'rgba(255, 190, 24, 0.05)' // custom warning background
      case 'error':
        return '#fff5f5' // red-50
      default:
        return '#f7fafc' // gray-100
    }
  }, [type])

  const borderColor = useMemo(() => {
    switch (type) {
      case 'tip':
        return '#bee3f8' // blue-200
      case 'warning':
        return 'rgba(255, 190, 24, 0.50)' // custom warning border
      case 'error':
        return '#feb2b2' // red-200
      default:
        return '#e2e8f0' // gray-200
    }
  }, [type])

  const titleColor = useMemo(() => {
    switch (type) {
      case 'tip':
        return '#2b6cb0' // blue-700
      case 'warning':
        return '#ffbe18' // orange-500
      case 'error':
        return '#FF6565' // red-500
      default:
        return '#4a5568' // secondary
    }
  }, [type])

  const paddingVal = size === 'sm' ? '0.25rem' : '0.5rem'
  const fontSize = size === 'sm' ? '0.75rem' : size === 'lg' ? '1rem' : '0.875rem'
  const iconSizeVal = size === 'sm' ? '20px' : size === 'lg' ? '28px' : '24px'

  const iconColorVal = useMemo(() => {
    switch (type) {
      case 'tip':
        return '#2b6cb0' // blue-700
      case 'warning':
        return '#ed8936' // orange-500
      case 'error':
        return '#f56565' // red-500
      default:
        return '#4a5568' // secondary
    }
  }, [type])

  // If a description or children is provided, we assume the content should stack vertically.
  const flexDirection = description || children ? 'column' : 'row'
  const alignItems = description || children ? 'flex-start' : 'center'
  const titleFontWeight = description || children ? 600 : 400
  const descColor = type === 'tip' ? '#000' : 'rgba(0, 0, 0, 0.7)'

  return (
    <AlertWrapper
      bgColor={bgColor}
      borderColor={borderColor}
      padding={paddingVal}
      raised={raised}
      block={block}
      rounded={!square}
      noBorder={noBorder}
    >
      <AlertContainer alignItems={alignItems}>
        <IconWrapper size={iconSizeVal} color={iconColorVal}>
          {type === 'tip' ? (
            // Replace with your LightBulbIcon if available
            <span style={{ fontSize: iconSizeVal }}>💡</span>
          ) : (
            // Replace with your alert icon if available
            <span style={{ fontSize: iconSizeVal }}>⚠️</span>
          )}
        </IconWrapper>
        <ContentWrapper flexDirection={flexDirection} className={contentClass}>
          <div>
            <Title fontSize={fontSize} fontWeight={titleFontWeight} titleColor={titleColor}>
              {titleSlot || title}
            </Title>
            {(children || description) && (
              <Description fontSize={fontSize} color={descColor}>
                {children || description}
              </Description>
            )}
          </div>
          {actionLabel && (
            <ActionWrapper style={description || children ? { marginTop: '0.25rem' } : { paddingLeft: '1rem' }}>
              <ActionButton onClick={onActionClick}>{actionLabel}</ActionButton>
            </ActionWrapper>
          )}
        </ContentWrapper>
      </AlertContainer>
      {dismissable && (
        <DismissButtonWrapper
          onClick={(e) => {
            e.stopPropagation()
            onClose && onClose()
          }}
        >
          {/* Replace with your close icon if available */}
          <span style={{ fontSize: '1rem' }}>×</span>
        </DismissButtonWrapper>
      )}
    </AlertWrapper>
  )
}

export default BalAlert
