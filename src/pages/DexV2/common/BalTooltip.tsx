import React, { useRef, useEffect } from 'react'
import styled from 'styled-components'
import { createPopper, Instance as PopperInstance } from '@popperjs/core'

// --- Types and Default Props ---
export type Placement = 'top' | 'left' | 'bottom' | 'right'
export type TextAlign = 'left' | 'center' | 'right' | ''

interface TooltipProps extends React.HTMLAttributes<HTMLDivElement> {
  text?: string
  placement?: Placement
  onShow?: () => void
  onHide?: () => void
  noPad?: boolean
  disabled?: boolean
  iconSize?: string // Use appropriate type if available
  iconName?: string
  iconClass?: string
  width?: string
  textAlign?: TextAlign
  delayMs?: number
  activator?: React.ReactNode // Optional custom activator content
  children?: React.ReactNode // If no text is provided, tooltip content is rendered from children
}

const defaultProps: Partial<TooltipProps> = {
  text: '',
  placement: 'top',
  noPad: false,
  disabled: false,
  width: '52',
  textAlign: '',
  iconName: 'info',
  iconSize: 'md',
  iconClass: 'text-gray-300',
  delayMs: 0,
}

// --- Styled Components ---
const ActivatorButton = styled.button<{ disabled?: boolean }>`
  line-height: 1;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  ${(props) => (props.disabled ? 'cursor: default;' : 'cursor: pointer;')}
`

interface TooltipContainerProps {
  textAlign: TextAlign
}
const TooltipContainer = styled.div<TooltipContainerProps>`
  z-index: 50;
  position: relative;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  text-align: left;
  display: none; /* Hidden by default */
  width: fit-content;

  &.show {
    display: block;
  }
`

interface TooltipContentProps {
  noPad: boolean
  textAlign: TextAlign
}
const TooltipContent = styled.div<TooltipContentProps>`
  border-radius: 0.375rem; /* rounded-md */
  font-size: 0.75rem; /* text-xs */
  color: black;
  background-color: white;
  padding: ${(props) => (props.noPad ? '0' : '0.75rem')};
  text-align: ${(props) => (props.textAlign ? props.textAlign : 'left')};
`

// --- BalTooltip Component ---
const BalTooltip: React.FC<TooltipProps> = (incomingProps) => {
  const props = { ...defaultProps, ...incomingProps }
  const {
    text,
    placement,
    onShow,
    onHide,
    noPad,
    disabled,
    iconSize,
    iconName,
    iconClass,
    width,
    textAlign,
    delayMs,
    activator,
    children,
  } = props

  // Convert width: if width is '52', we assume it means '13rem'
  const computedWidth = width === '52' ? '13rem' : width || '13rem'

  // Refs for the activator button and tooltip content.
  const activatorRef = useRef<HTMLButtonElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const popperRef = useRef<PopperInstance | null>(null)
  let delayTimeout: ReturnType<typeof setTimeout> | null = null

  const showTooltip = () => {
    if (contentRef.current && popperRef.current) {
      contentRef.current.setAttribute('data-show', '')
      contentRef.current.classList.add('show')
      popperRef.current.update()
      if (onShow) onShow()
    }
  }

  const hideTooltip = () => {
    if (contentRef.current) {
      contentRef.current.removeAttribute('data-show')
      contentRef.current.classList.remove('show')
      if (onHide) onHide()
    }
  }

  const handleMouseEnter = () => {
    if (!disabled) {
      if (delayMs && delayMs > 0) {
        delayTimeout = setTimeout(() => {
          showTooltip()
        }, delayMs)
      } else {
        showTooltip()
      }
    }
  }

  const handleMouseLeave = () => {
    if (!disabled) {
      if (delayTimeout) {
        clearTimeout(delayTimeout)
      }
      hideTooltip()
    }
  }

  useEffect(() => {
    if (activatorRef.current && contentRef.current) {
      popperRef.current = createPopper(activatorRef.current, contentRef.current, {
        placement: placement,
        modifiers: [
          { name: 'offset', options: { offset: [0, 8] } },
          { name: 'eventListeners', options: { scroll: false } },
        ],
      })
    }
    return () => {
      if (delayTimeout) {
        clearTimeout(delayTimeout)
      }
      if (popperRef.current) {
        popperRef.current.destroy()
      }
    }
  }, [placement])

  return (
    <>
      <ActivatorButton
        ref={activatorRef}
        disabled={disabled}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {activator ? (
          activator
        ) : (
          <svg
            stroke="currentColor"
            fill="currentColor"
            strokeWidth="0"
            viewBox="0 0 24 24"
            height="1em"
            width="1em"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path fill="none" d="M0 0h24v24H0V0z"></path>
            <path d="M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"></path>
          </svg>
        )}
      </ActivatorButton>
      <TooltipContainer ref={contentRef} textAlign={textAlign || ''}>
        <TooltipContent noPad={!!noPad} textAlign={textAlign || ''}>
          {text ? <p>{text}</p> : children}
        </TooltipContent>
      </TooltipContainer>
    </>
  )
}

export default BalTooltip
