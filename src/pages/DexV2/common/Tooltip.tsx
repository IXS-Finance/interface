import React, { useRef, useEffect } from 'react'
import styled, { keyframes } from 'styled-components'
import { createPopper, Instance as PopperInstance, Placement } from '@popperjs/core'
import { Info } from 'react-feather'

// Keyframe animations similar to your Tailwind animations
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`

const fadeInMoveUp = keyframes`
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
`

const fadeInMoveDown = keyframes`
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
`

// Tooltip component props
interface TooltipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string
  placement?: Placement // "top", "left", "bottom", "right"
  onShow?: () => void
  onHide?: () => void
  noPad?: boolean
  disabled?: boolean
  iconSize?: string // e.g. "1rem" or "16px"
  iconName?: string
  iconClass?: string
  width?: string // e.g. "13rem"
  textAlign?: 'left' | 'center' | 'right' | ''
  delayMs?: number
  // Use this prop to supply a custom activator element. Otherwise a default icon is used.
  activator?: React.ReactNode
  // Tooltip content when `text` is not provided.
  children?: React.ReactNode
}

// The button that activates the tooltip
const ActivatorButton = styled.button<{ disabled?: boolean }>`
  line-height: 1;
  cursor: ${(props) => (props.disabled ? 'default' : 'pointer')};
  background: none;
  border: none;
  padding: 0;
  display: inline-flex;
  align-items: center;
  color: #b8b8cc;
`

// The tooltip outer container – note that it uses the data attribute "data-show" to toggle display.
interface TooltipWrapperProps {
  width: string
  textAlign: string
}
const TooltipWrapper = styled.div<TooltipWrapperProps>`
  z-index: 50;
  display: none;
  position: relative;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  text-align: ${(props) => props.textAlign || 'left'};
  width: ${(props) => props.width};

  &[data-show] {
    display: block;
  }

  /* Pseudo-element for the light mode radial gradient shadow */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    filter: blur(40px);
    z-index: -1;
    background-blend-mode: soft-light;
    background: radial-gradient(ellipse at center, rgba(0, 0, 0, 0.6), transparent);
  }
`

// The tooltip content with conditional padding and placement-based animations and arrow.
interface TooltipContentProps {
  placement: Placement
  noPad?: boolean
}
const TooltipContent = styled.div<TooltipContentProps>`
  position: relative;
  border-radius: 0.375rem; /* rounded-md */
  font-size: 0.75rem; /* text-xs */
  color: rgba(41, 41, 51, 0.6);
  background-color: #f3f3ff;
  ${(props) => (props.noPad ? '' : 'padding: 0.75rem;')}
  font-weight: 500; /* font-medium */
  opacity: 0;
  animation: ${(props) => {
      if (props.placement === 'top') return fadeInMoveUp
      if (props.placement === 'bottom') return fadeInMoveDown
      return fadeIn
    }}
    0.2s ease-out both;

  /* Arrow triangles for top and bottom placements */
  &::before,
  &::after {
    content: ' ';
    position: absolute;
    left: calc(50% - 7px);
    width: 0;
    height: 0;
  }

  ${(props) =>
    props.placement === 'top' &&
    `
    &::before {
      bottom: -7px;
      border-top: 8px solid #F3F3FF;
      border-left: 8px solid transparent;
      border-right: 8px solid transparent;
    }
  `}

  ${(props) =>
    props.placement === 'bottom' &&
    `
    &::after {
      top: -7px;
      border-bottom: 8px solid #fff;
      border-left: 8px solid transparent;
      border-right: 8px solid transparent;
    }
  `}
`

const Tooltip: React.FC<TooltipProps> = ({
  text = '',
  placement = 'top',
  onShow,
  onHide,
  noPad = false,
  disabled = false,
  iconSize = '1rem',
  iconClass = '',
  width = '13rem',
  textAlign = 'left',
  delayMs = 0,
  activator,
  children,
  ...rest
}) => {
  const activatorRef = useRef<HTMLButtonElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const popperInstance = useRef<PopperInstance | null>(null)
  const delayTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showTooltip = () => {
    if (tooltipRef.current && popperInstance.current) {
      tooltipRef.current.setAttribute('data-show', '')
      popperInstance.current.update()
      onShow && onShow()
    }
  }

  const hideTooltip = () => {
    if (tooltipRef.current) {
      tooltipRef.current.removeAttribute('data-show')
      onHide && onHide()
    }
  }

  const handleMouseEnter = () => {
    if (!disabled) {
      if (delayMs > 0) {
        delayTimeoutRef.current = setTimeout(showTooltip, delayMs)
      } else {
        showTooltip()
      }
    }
  }

  const handleMouseLeave = () => {
    if (!disabled) {
      if (delayTimeoutRef.current) {
        clearTimeout(delayTimeoutRef.current)
        delayTimeoutRef.current = null
      }
      hideTooltip()
    }
  }

  useEffect(() => {
    if (activatorRef.current && tooltipRef.current) {
      popperInstance.current = createPopper(activatorRef.current, tooltipRef.current, {
        placement: placement,
        modifiers: [
          { name: 'offset', options: { offset: [0, 8] } },
          { name: 'eventListeners', options: { scroll: false } },
        ],
      })
    }
    return () => {
      if (delayTimeoutRef.current) {
        clearTimeout(delayTimeoutRef.current)
      }
      if (popperInstance.current) {
        popperInstance.current.destroy()
        popperInstance.current = null
      }
    }
  }, [placement])

  // Default activator element if none is provided.
  const defaultActivator = <Info size={16} className={iconClass} style={{ fontSize: iconSize }} />

  return (
    <>
      <ActivatorButton
        ref={activatorRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        disabled={disabled}
        {...rest}
      >
        {activator || defaultActivator}
      </ActivatorButton>
      <TooltipWrapper ref={tooltipRef} width={width} textAlign={textAlign}>
        <TooltipContent placement={placement} noPad={noPad}>
          {text ? <span>{text}</span> : children}
        </TooltipContent>
      </TooltipWrapper>
    </>
  )
}

export default Tooltip
