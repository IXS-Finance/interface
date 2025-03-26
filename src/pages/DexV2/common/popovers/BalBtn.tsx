import React from 'react'
import styled from 'styled-components'
import BalLoadingIcon from './BalLoadingIcon'

interface BalBtnProps extends React.HTMLAttributes<HTMLButtonElement> {
  tag?: 'button' | 'a' | 'div'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  color?:
    | 'primary'
    | 'gradient'
    | 'gradient-reverse'
    | 'gradient-pink-yellow'
    | 'gray'
    | 'red'
    | 'white'
    | 'blue'
    | 'yellow'
    | 'black'
    | 'transparent'
  label?: string
  block?: boolean
  circle?: boolean
  outline?: boolean
  flat?: boolean
  rounded?: boolean
  loading?: boolean
  loadingLabel?: string
  disabled?: boolean
  justifyContent?: 'start' | 'center' | 'end' | 'between'
}

const defaultProps: Partial<BalBtnProps> = {
  tag: 'button',
  size: 'md',
  color: 'primary',
  label: '',
  block: false,
  circle: false,
  outline: false,
  flat: false,
  rounded: false,
  loading: false,
  loadingLabel: 'loading...',
  disabled: false,
  justifyContent: 'center',
}

// Simple mapping for standard colors.
const colorMapping: Record<string, string> = {
  primary: '#66F',
  gray: '#6b7280',
  red: '#FF6161',
  white: '#f9fafb',
  blue: '#66F',
  yellow: '#facc15',
  black: '#000000',
  transparent: 'transparent',
}

// Returns CSS styles for normal (non‑circle) sizes.
function getSizeStyles(size: 'xs' | 'sm' | 'md' | 'lg'): string {
  switch (size) {
    case 'xs':
      return 'padding: 0 0.5rem; height: 1.5rem; font-size: 0.75rem;'
    case 'sm':
      return 'padding: 0 0.75rem; height: 2.25rem; font-size: 1rem;'
    case 'lg':
      return 'padding: 0 1.25rem; height: 4.5rem; font-size: 1.125rem;'
    default:
      return 'padding: 0 1rem; height: 3rem; font-size: 14px;'
  }
}

// Returns CSS styles for circle buttons.
function getCircleSizeStyles(size: 'xs' | 'sm' | 'md' | 'lg'): string {
  switch (size) {
    case 'xs':
      return 'width: 1.5rem; height: 1.5rem; font-size: 0.875rem;'
    case 'sm':
      return 'width: 2.25rem; height: 2.25rem; font-size: 1.125rem;'
    case 'lg':
      return 'width: 4rem; height: 4rem; font-size: 1.5rem;'
    default:
      return 'width: 3rem; height: 3rem; font-size: 1rem;'
  }
}

// Returns background CSS based on the props.
function getBackgroundStyles(props: BalBtnProps): string {
  if (props.outline) {
    return 'background: transparent; &:hover { background: #f3f4f6; }'
  }
  if (props.color && props.color.includes('gradient')) {
    let fromColor = 'blue'
    let toColor = 'pink'
    if (props.color === 'gradient-reverse') {
      fromColor = 'pink'
      toColor = 'blue'
    } else if (props.color === 'gradient-pink-yellow') {
      fromColor = 'pink'
      toColor = 'yellow'
    }
    if (props.disabled) {
      return 'background: #d1d5db; color: white;'
    }
    if (props.loading) {
      return `background: linear-gradient(to top right, #93c5fd, #f9a8d4);`
    }
    return `background: linear-gradient(to top right, ${fromColor}, ${toColor});
      &:hover { background: linear-gradient(to top right, ${fromColor}, ${toColor}); }
      transition: background-color 0.2s ease;`
  }
  if (props.outline) return 'background: transparent;'
  if (props.flat) {
    return `background: ${colorMapping[props.color || 'primary']}; &:hover { background: ${
      colorMapping[props.color || 'primary']
    }; }`
  }
  if (props.color === 'white') {
    return 'background: #f9fafb; &:hover { background: white; }'
  }
  if (props.disabled) return 'background: #d1d5db; color: white;'
  if (props.loading) {
    return `background: linear-gradient(to top right, #93c5fd, #f9a8d4);`
  }
  return `background: ${colorMapping[props.color || 'primary']}; &:hover { background: ${
    colorMapping[props.color || 'primary']
  }; }`
}

// Returns border CSS based on the props.
function getBorderStyles(props: BalBtnProps): string {
  if (props.outline) {
    if (props.disabled) return 'border: 1px solid #e5e7eb;'
    return `border: 1px solid ${colorMapping[props.color || 'primary']};`
  }
  return 'border: none;'
}

// Returns text color.
function getTextColor(props: BalBtnProps): string {
  if (props.outline || props.flat) return colorMapping[props.color || 'primary']
  return 'white'
}

// Determines display style.
function getDisplayStyles(props: BalBtnProps): string {
  if (props.block) return 'display: block; width: 100%;'
  return 'display: inline-block;'
}

// Determines shape.
function getShapeStyles(props: BalBtnProps): string {
  if (props.circle || props.rounded) return 'border-radius: 9999px;'
  return 'border-radius: 0.5rem;'
}

interface StyledButtonProps extends BalBtnProps {}

const StyledButton = styled.button<StyledButtonProps>`
  overflow: hidden;
  text-decoration: none;
  font-variation-settings: 'wght' 500;
  transition: all 0.2s ease;
  line-height: 1;
  ${(props) => getDisplayStyles(props)}
  ${(props) => (props.circle ? getCircleSizeStyles(props.size || 'md') : getSizeStyles(props.size || 'md'))}
  ${(props) => getShapeStyles(props)}
  ${(props) => getBackgroundStyles(props)}
  ${(props) => getBorderStyles(props)}
  color: ${(props) => getTextColor(props)};
  ${(props) => (props.disabled || props.loading ? 'cursor: not-allowed;' : 'cursor: pointer;')}
`

const ContentWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
`

const BalBtn: React.FC<BalBtnProps> = (incomingProps) => {
  const {
    tag = 'button',
    loading,
    loadingLabel,
    label,
    children,
    disabled,
    ...rest
  } = { ...defaultProps, ...incomingProps }

  return (
    <StyledButton as={tag} disabled={disabled || loading} {...rest}>
      {loading ? (
        <ContentWrapper style={{ justifyContent: 'center' }}>
          <BalLoadingIcon size={rest.size} color="white" />
          {loadingLabel && <span style={{ marginLeft: '0.5rem' }}>{loadingLabel}</span>}
        </ContentWrapper>
      ) : (
        <ContentWrapper>{label ? <span>{label}</span> : children}</ContentWrapper>
      )}
    </StyledButton>
  )
}

export default BalBtn
