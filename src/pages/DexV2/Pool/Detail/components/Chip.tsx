// Chip.tsx
import React from 'react'
import styled from 'styled-components'

export interface ChipProps {
  label?: string
  closeable?: boolean
  size?: 'sm' | 'md' | 'lg'
  color?: 'gray' | 'gradient' | 'white' | 'red' | 'orange' | 'amber'
  outline?: boolean
  rounded?: boolean
  onClosed?: () => void
  children?: React.ReactNode
  className?: string
}

// Default prop values
const defaultProps: Required<Omit<ChipProps, 'children' | 'onClosed'>> = {
  label: '',
  closeable: false,
  size: 'md',
  color: 'gray',
  outline: true,
  rounded: false,
  className: '',
}

// Helper functions to determine styles based on props
const getColorBorder = (color: ChipProps['color']) => {
  switch (color) {
    case 'gray':
      return '#d1d5db'
    case 'gradient':
      return 'transparent'
    case 'white':
      return '#e5e7eb'
    case 'red':
      return '#fecaca'
    case 'orange':
      return '#fff'
    case 'amber':
      return '#fcd34d'
    default:
      return '#d1d5db'
  }
}

const getColorBackground = (color: ChipProps['color']) => {
  switch (color) {
    case 'gray':
      return '#f9fafb'
    case 'gradient':
      return 'linear-gradient(45deg, #f3ec78, #af4261)'
    case 'white':
      return '#ffffff'
    case 'red':
      return '#fef2f2'
    case 'orange':
      return '#fed7aa'
    case 'amber':
      return '#fffbeb'
    default:
      return '#f9fafb'
  }
}

const getColorText = (color: ChipProps['color'], outline: boolean) => {
  // For filled chips (outline false) we use white text (unless the color is white)
  if (!outline && color !== 'white' && color !== 'gradient') {
    return '#ffffff'
  }
  switch (color) {
    case 'gray':
      return '#374151'
    case 'gradient':
      return '#ffffff'
    case 'white':
      return '#1f2937'
    case 'red':
      return '#991b1b'
    case 'orange':
      return '#c2410c'
    case 'amber':
      return '#92400e'
    default:
      return '#374151'
  }
}

const getPadding = (size: ChipProps['size']) => {
  switch (size) {
    case 'sm':
      return '0.25rem 0.5rem'
    case 'md':
      return '0.375rem 0.75rem'
    case 'lg':
      return '0.5rem 1rem'
    default:
      return '0.375rem 0.75rem'
  }
}

const getFontSize = (size: ChipProps['size']) => {
  switch (size) {
    case 'sm':
      return '12px'
    case 'md':
      return '14px'
    case 'lg':
      return '16px'
    default:
      return '14px'
  }
}

// Styled components
const ChipContainer = styled.div<ChipProps>`
  display: inline-block;
  white-space: nowrap;
  padding: ${({ size = defaultProps.size }) => getPadding(size)};
  border-radius: ${({ rounded = defaultProps.rounded }) => (rounded ? '9999px' : '4px')};
  border: ${({ outline = defaultProps.outline, color = defaultProps.color }) =>
    outline ? `1px solid ${getColorBorder(color)}` : 'none'};
  background: ${({ outline = defaultProps.outline, color = defaultProps.color }) =>
    outline ? 'transparent' : getColorBackground(color)};
  color: ${({ outline = defaultProps.outline, color = defaultProps.color }) => getColorText(color, outline)};
  font-size: ${({ size = defaultProps.size }) => getFontSize(size)};
`

const ContentContainer = styled.div`
  display: flex;
  align-items: center;
  line-height: 1;
  height: 100%;
`

const CloseButton = styled.div`
  cursor: pointer;
  margin-left: 0.25rem;
  margin-bottom: -1px;
  color: #9ca3af;
  display: flex;
  align-items: center;
`

// Simple Icon component for the close (x) icon
interface IconProps {
  name: string
  size: number
  className?: string
}

const Icon: React.FC<IconProps> = ({ name, size, className }) => {
  if (name === 'x') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
      >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    )
  }
  return null
}

const getIconSize = (size: ChipProps['size'] = defaultProps.size): number => {
  switch (size) {
    case 'sm':
      return 12
    case 'md':
      return 16
    case 'lg':
      return 20
    default:
      return 16
  }
}

// Chip Component
const Chip: React.FC<ChipProps> = (props) => {
  const { label, closeable, size, color, outline, rounded, onClosed, children } = { ...defaultProps, ...props }

  const iconSize = getIconSize(size)

  return (
    <ChipContainer size={size} color={color} outline={outline} rounded={rounded} className={props.className}>
      <ContentContainer>
        {label ? <span>{label}</span> : children}
        {closeable && (
          <CloseButton onClick={onClosed}>
            <Icon name="x" size={iconSize} />
          </CloseButton>
        )}
      </ContentContainer>
    </ChipContainer>
  )
}

export default Chip
