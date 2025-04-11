import React, { useState, useRef, useEffect } from 'react'
import styled from 'styled-components'

// Define the props for the Dropdown component.
type DropdownProps = {
  // An array of options to display.
  options: any[]
  // Optional minWidth value (default is 'auto').
  minWidth?: string
  // Callback fired when an option is selected.
  onSelected: (option: any) => void
  // The activator element to click (e.g., button or custom JSX).
  activator: React.ReactNode
  // A function that returns the JSX to render for each option.
  renderOption: (option: any) => React.ReactNode
}

const Dropdown: React.FC<DropdownProps> = ({ options, minWidth = 'auto', onSelected, activator, renderOption }) => {
  // Component state to control dropdown visibility.
  const [showDropdown, setShowDropdown] = useState(false)
  // Ref to the container element to help detect clicks outside.
  const containerRef = useRef<HTMLDivElement>(null)

  // Toggles the dropdown open/close.
  const toggleDropdown = () => setShowDropdown((prev) => !prev)
  // Hides the dropdown.
  const hideDropdown = () => setShowDropdown(false)
  // Handles clicking an option, firing the onSelected callback.
  const handleRowClick = (option: any) => {
    onSelected(option)
    hideDropdown()
  }

  // Click-outside logic:
  // Add an event listener that will hide the dropdown if the click occurs outside the component.
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        hideDropdown()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <Container ref={containerRef}>
      <Activator onClick={toggleDropdown}>{activator}</Activator>
      {showDropdown && (
        <DropdownMenu minWidth={minWidth}>
          {options.map((option, i) => (
            <DropdownRow key={i} onClick={() => handleRowClick(option)}>
              {renderOption(option)}
            </DropdownRow>
          ))}
        </DropdownMenu>
      )}
    </Container>
  )
}

export default Dropdown

// The outer container is set to relative positioning.
const Container = styled.div`
  position: relative;
`

// The activator area (your clickable element) gets a pointer cursor.
const Activator = styled.div`
  cursor: pointer;
`

// Props interface for DropdownMenu so we can pass a dynamic minWidth value.
interface DropdownMenuProps {
  minWidth: string
}

// DropdownMenu replicates the styling for .bal-dropdown in your Vue component.
const DropdownMenu = styled.div<DropdownMenuProps>`
  position: absolute;
  z-index: 10;
  background-color: white;
  border: 1px solid #e5e7eb; /* light gray border similar to Tailwind */
  border-radius: 0.5rem; /* rounded-lg */
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); /* similar to Tailwind's shadow */
  min-width: ${(props) => props.minWidth};
  overflow: hidden;

  /* Apply a dividing line between rows */
  & > * + * {
    border-top: 1px solid #e5e7eb;
  }
`

// DropdownRow replicates the styling for .bal-dropdown-row.
const DropdownRow = styled.div`
  padding: 0.75rem; /* equivalent to p-3 in Tailwind */
  white-space: nowrap;
  cursor: pointer;

  &:hover {
    background-color: #f9fafb; /* light hover background */
  }

  /* Rounded corners for the first and last rows */
  &:first-child {
    border-top-left-radius: 0.5rem;
    border-top-right-radius: 0.5rem;
  }
  &:last-child {
    border-bottom-left-radius: 0.5rem;
    border-bottom-right-radius: 0.5rem;
  }
`
