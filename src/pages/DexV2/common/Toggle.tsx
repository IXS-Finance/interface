import React from 'react'
import styled, { css } from 'styled-components'

export interface ToggleProps {
  name: string
  /** Whether the toggle is active (checked) */
  checked?: boolean
  /** Optional text label displayed after the toggle */
  label?: string
  /** Disable the toggle */
  disabled?: boolean
  /** Only "green" is supported for now */
  color?: 'green'
  /**
   * Called when the value changes.
   * This is analogous to Vue’s update:modelValue.
   */
  onChange?: (checked: boolean) => void
  /**
   * Additional callback triggered when toggled.
   */
  onToggle?: (checked: boolean) => void
}

const Toggle: React.FC<ToggleProps> = ({
  name,
  checked = false,
  label = '',
  disabled = false,
  color = 'green',
  onChange,
  onToggle,
  ...rest
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!disabled) {
      const checked = e.target.checked
      onChange && onChange(checked)
      onToggle && onToggle(checked)
    }
  }

  return (
    <Wrapper>
      <ToggleGroup>
        <ToggleCheckbox
          id={name}
          name={name}
          checked={checked}
          disabled={disabled}
          onChange={handleChange}
          {...rest}
        />
        <ToggleTrack htmlFor={name} />
      </ToggleGroup>
      {label && <ToggleLabel htmlFor={name}>{label}</ToggleLabel>}
    </Wrapper>
  )
}

export default Toggle

/* Styled Components */

const Wrapper = styled.div`
  display: flex;
  align-items: center;
`

const ToggleGroup = styled.div`
  position: relative;
  display: inline-block;
  width: 2.5rem; /* Tailwind w-10 */
  vertical-align: middle;
  user-select: none;
  transition: all 0.2s ease-out;
`

// The checkbox styled to mimic the Vue classes
const ToggleCheckbox = styled.input.attrs({ type: 'checkbox' })`
  position: absolute;
  display: block;
  width: 1.5rem; /* Tailwind w-6 */
  height: 1.5rem; /* Tailwind h-6 */
  border-radius: 9999px;
  background: white;
  border: 4px solid #e5e7eb; /* gray-200 */
  appearance: none;
  cursor: pointer;
  transition: border-color 0.2s, background-color 0.2s;

  &:hover {
    border-color: #d1d5db; /* gray-300 */
  }

  &:disabled {
    border-color: #d1d5db;
    cursor: not-allowed;
  }

  /* Special styling when name is "swapGasless" */
  &[name='swapGasless'] {
    width: 2rem; /* Tailwind w-8 */
    height: 2rem; /* Tailwind h-8 */
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &[name='swapGasless']::before {
    content: '⛽';
  }

  &[name='swapGasless']:checked::before {
    content: '✍️';
  }
`

// The track that sits next to the checkbox.
// We use a sibling selector to update the background when the checkbox is checked.
const ToggleTrack = styled.label`
  display: block;
  overflow: hidden;
  height: 1.5rem; /* Tailwind h-6 */
  border-radius: 9999px;
  background: #e5e7eb; /* gray-200 */
  cursor: pointer;
  transition: background-color 0.2s;

  /* When the checkbox is checked, update the background */
  ${ToggleCheckbox}:checked + & {
    background: #34d399; /* green-400 */
  }

  /* Hover state for the track */
  ${ToggleCheckbox}:hover + & {
    background: #d1d5db; /* gray-300 */
  }

  ${ToggleCheckbox}:disabled + & {
    background: #d1d5db;
    cursor: not-allowed;
  }
`

// The optional text label displayed after the toggle
const ToggleLabel = styled.label`
  margin-left: 0.5rem; /* Tailwind ml-2 */
  font-size: 0.75rem; /* Tailwind text-xs */
  color: #000; /* Default text color; adjust for dark mode as needed */
`
