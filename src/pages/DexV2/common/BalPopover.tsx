import React, { useState, useRef, useEffect } from 'react'
import styled from 'styled-components'

export type PopoverTrigger = 'click' | 'hover'

export interface PopoverProps {
  trigger?: PopoverTrigger
  align?: string // e.g. "right" or "left"; default "right"
  detached?: boolean
  onShow?: () => void
  onHide?: () => void
  activator: React.ReactNode
  children: React.ReactNode
}

const Container = styled.div`
  position: relative;
`

interface ActivatorWrapperProps {
  detached: boolean
}
const ActivatorWrapper = styled.div<ActivatorWrapperProps>`
  ${(props) => !props.detached && 'position: relative;'}
  display: flex;
  flex-direction: column;
  height: 100%;
  /* additional styles (e.g. group, flex) can be added here */
`

interface PopoverWrapperProps {
  popoverOpened: boolean
  detached: boolean
  align: string
  activatorWidth: string
  activatorHalfWidth: string
}
const PopoverWrapper = styled.div<PopoverWrapperProps>`
  position: absolute;
  z-index: 30;
  padding-top: 0.75rem; /* pt-3 */
  transition: all 0.2s ease-in-out;
  opacity: ${(props) => (props.popoverOpened ? '1' : '0')};
  visibility: ${(props) => (props.popoverOpened ? 'visible' : 'hidden')};

  /* When not detached, align using a simple positional style */
  ${(props) => !props.detached && (props.align === 'right' ? 'right: 0;' : props.align === 'left' ? 'left: 0;' : '')}

  /* When detached, apply transform based on the activator width */
  ${(props) =>
    props.detached && props.align === 'center'
      ? `transform: translateX(calc(-50% + ${props.activatorHalfWidth}));`
      : props.detached && props.align === 'right'
      ? `transform: translateX(calc(-100% + ${props.activatorWidth}));`
      : ''}
`

const BalPopover: React.FC<PopoverProps> = ({
  trigger = 'click',
  align = 'right',
  detached = false,
  onShow,
  onHide,
  activator,
  children,
}) => {
  const [popoverOpened, setPopoverOpened] = useState(false)
  const [activatorWidth, setActivatorWidth] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const activatorWrapperRef = useRef<HTMLDivElement>(null)

  // Toggle or show/hide popover based on trigger type.
  const togglePopover = () => {
    setPopoverOpened((prev) => !prev)
  }
  const showPopover = () => setPopoverOpened(true)
  const hidePopover = () => setPopoverOpened(false)

  // Update activator width when mounted.
  useEffect(() => {
    if (activatorWrapperRef.current) {
      setActivatorWidth(activatorWrapperRef.current.clientWidth)
    }
  }, [])

  // Click-outside handler (for click trigger).
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (trigger === 'click' && containerRef.current && !containerRef.current.contains(event.target as Node)) {
        hidePopover()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [trigger])

  // Emit onShow/onHide callbacks when popoverOpened changes.
  useEffect(() => {
    if (popoverOpened) {
      onShow && onShow()
    } else {
      onHide && onHide()
    }
  }, [popoverOpened, onShow, onHide])

  // Calculate width values.
  const activatorWidthPx = `${activatorWidth}px`
  const activatorHalfWidthPx = `${activatorWidth / 2}px`

  return (
    <Container ref={containerRef}>
      <ActivatorWrapper
        ref={activatorWrapperRef}
        detached={detached}
        onClick={trigger === 'click' ? togglePopover : undefined}
        onMouseEnter={trigger === 'hover' ? showPopover : undefined}
        onMouseLeave={trigger === 'hover' ? hidePopover : undefined}
      >
        {activator}
      </ActivatorWrapper>
      <PopoverWrapper
        popoverOpened={popoverOpened}
        detached={detached}
        align={align}
        activatorWidth={activatorWidthPx}
        activatorHalfWidth={activatorHalfWidthPx}
      >
        {/* Replace this with your Card component if desired */}
        <div
          style={{
            background: 'white',
            padding: '1rem',
            borderRadius: '0.5rem',
            boxShadow: '0px 0px 100px 38px rgba(0,0,0,0.1)',
          }}
        >
          {children}
        </div>
      </PopoverWrapper>
    </Container>
  )
}

export default BalPopover
