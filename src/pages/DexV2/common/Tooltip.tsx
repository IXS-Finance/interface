// Tooltip.tsx
import React, { useRef, useEffect, useCallback, ReactNode, ButtonHTMLAttributes } from 'react'
import { createPopper, Instance as PopperInstance } from '@popperjs/core'
import styled, { keyframes, css } from 'styled-components'
// Replace this with your actual Icon component

export type Placement = 'top' | 'left' | 'bottom' | 'right'
export type TextAlign = 'left' | 'center' | 'right' | ''

export interface TooltipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string
  placement?: Placement
  onShow?: () => void
  onHide?: () => void
  noPad?: boolean
  disabled?: boolean
  iconSize?: string // adjust type if you have a specific IconSize type
  iconName?: string
  iconClass?: string
  width?: string // e.g., '52' to yield class "w-52"
  textAlign?: TextAlign
  delayMs?: number
  /** Optional custom activator node. If not provided, a default Icon is rendered. */
  activator?: ReactNode
  /** Children used as tooltip content if text is not provided */
  children?: ReactNode
}

const DEFAULT_WIDTH = '52'

// The inner content of the tooltip.
interface TooltipContentProps {
  noPad: boolean
}
const TooltipContent = styled.div<TooltipContentProps>`
  border-radius: 0.375rem; /* rounded-md */
  font-size: 0.75rem; /* text-xs */
  color: #000;
  background: #fff;
  ${(props) =>
    !props.noPad &&
    css`
      padding: 0.75rem; /* equivalent to p-3 */
    `}/* Additional styling for dark mode could be added here */
`

const Tooltip: React.FC<TooltipProps> = ({
  text = '',
  placement = 'top',
  onShow,
  onHide,
  noPad = false,
  disabled = false,
  iconSize = 'md',
  iconName = 'info',
  iconClass = 'text-gray-300',
  width = DEFAULT_WIDTH,
  textAlign = '',
  delayMs = 0,
  activator,
  children,
  ...rest
}) => {
  // References for the activator (button) and tooltip content.
  const activatorRef = useRef<HTMLButtonElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const popperRef = useRef<PopperInstance | null>(null)
  const delayTimeoutRef = useRef<number | undefined>(undefined)

  // Show the tooltip by setting a data attribute and updating popper.
  const showTooltip = useCallback(() => {
    if (contentRef.current && popperRef.current) {
      contentRef.current.setAttribute('data-show', '')
      popperRef.current.update()
      onShow && onShow()
    }
  }, [onShow])

  // Hide the tooltip by removing the data attribute.
  const hideTooltip = useCallback(() => {
    if (contentRef.current) {
      contentRef.current.removeAttribute('data-show')
      onHide && onHide()
    }
  }, [onHide])

  // When mouse enters, either delay or immediately show tooltip.
  const handleMouseEnter = () => {
    if (!disabled) {
      if (delayMs > 0) {
        delayTimeoutRef.current = window.setTimeout(showTooltip, delayMs)
      } else {
        showTooltip()
      }
    }
  }

  // On mouse leave, clear any pending timeout and hide the tooltip.
  const handleMouseLeave = () => {
    if (!disabled) {
      if (delayTimeoutRef.current !== undefined) {
        clearTimeout(delayTimeoutRef.current)
      }
      hideTooltip()
    }
  }

  // Create the popper instance when both elements are mounted.
  useEffect(() => {
    if (activatorRef.current && contentRef.current) {
      popperRef.current = createPopper(activatorRef.current, contentRef.current, {
        placement,
        modifiers: [
          { name: 'offset', options: { offset: [0, 8] } },
          { name: 'eventListeners', options: { scroll: false } },
        ],
      })
    }
    return () => {
      if (delayTimeoutRef.current !== undefined) {
        clearTimeout(delayTimeoutRef.current)
      }
      if (popperRef.current) {
        popperRef.current.destroy()
        popperRef.current = null
      }
    }
  }, [placement])

  // Build dynamic class names similar to your tailwind classes.
  const dynamicClasses = `${width ? `w-${width}` : ''} ${textAlign ? `text-${textAlign}` : ''}`

  return (
    <>
      <ActivatorButton
        ref={activatorRef}
        disabled={disabled}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...rest}
      >
        {activator}
        {/* {activator || <Icon name={iconName} size={iconSize} className={iconClass} />} */}
      </ActivatorButton>
      <TooltipContainer ref={contentRef} className={dynamicClasses}>
        <TooltipContent noPad={noPad}>{text ? <p className="tooltip-text">{text}</p> : children}</TooltipContent>
      </TooltipContainer>
    </>
  )
}

export default Tooltip

/* Styled Components & Animations */

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

// The activator button styles.
const ActivatorButton = styled.button`
  line-height: 1;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  &.cursor-default {
    cursor: default;
  }
`

// The outer tooltip container. It is hidden by default and shown when data-show is present.
const TooltipContainer = styled.div`
  z-index: 50;
  display: none;
  position: relative;
  text-align: left;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);

  &[data-show] {
    display: block;
  }

  /* Pseudo-element for a soft radial glow (light mode example) */
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
    background: radial-gradient(ellipse at center, rgba(0, 0, 0, 0.6), transparent);
    animation: ${fadeIn} 0.4s ease-out 0.05s both;
  }

  /* Example animations based on placement */
  &[data-popper-placement='top'] ${TooltipContent} {
    animation: ${fadeInMoveUp} 0.2s ease-out both;
  }
  &[data-popper-placement='bottom'] ${TooltipContent} {
    animation: ${fadeInMoveDown} 0.2s ease-out both;
  }
`
