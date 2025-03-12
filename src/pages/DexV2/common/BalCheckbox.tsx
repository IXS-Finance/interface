// BalCheckbox.tsx
import { Checkbox } from '@mui/material'
import React, { useState } from 'react'
import styled from 'styled-components'
import { RuleFunction, Rules } from 'types' // Adjust import as needed

// Styled container for the entire checkbox component.
const CheckboxContainer = styled.div`
  position: relative;
  margin-bottom: 0.25rem; /* equivalent to mb-1 (if noMargin is false) */
`

// A simple flex container.
const Flex = styled.div`
  display: flex;
`

// Flex container for the input (to support alignment).
const FlexAlign = styled.div<{ align: string }>`
  display: flex;
  /* Use the provided alignment class (e.g. "items-start") */
  /* In our case, if align === 'items-start', we might add a top offset later */
`

// Container for the label and error message.
const LabelContainer = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  margin-left: 0.75rem; /* ml-3 */
`

// Styled label.
const StyledLabel = styled.label<{ textSize: string }>`
  font-size: ${({ textSize }) => textSize};
`

// Styled error text.
const ErrorText = styled.div`
  color: #ef4444; /* red-500 */
  font-size: 0.875rem; /* text-sm */
  padding-top: 0.25rem; /* pt-1 */
`

// Styled input; base styles mimic Tailwind's utility classes.
const StyledInput = styled.input<any>`
  appearance: none;
  border-radius: 0.25rem;
  vertical-align: middle;
  background-origin: border-box;
  user-select: none;
  border: 1px solid #6b7280; /* border-gray-500 */
  background-color: white;
  line-height: 1;
  cursor: pointer;
  transition: border-color 0.2s ease;
  ${({ sizeClasses }) => sizeClasses && `${sizeClasses}`};

  &:hover {
    border-color: #2563eb; /* hover:border-blue-600 */
  }

  &:checked {
    border-color: transparent;
    background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M5.707 7.293a1 1 0 0 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l4-4a1 1 0 0 0-1.414-1.414L7 8.586 5.707 7.293z'/%3e%3c/svg%3e");
    background-size: 100% 100%;
    background-position: center;
    background-repeat: no-repeat;
  }

  &:disabled {
    background-color: #e5e7eb; /* bg-gray-200 */
    cursor: not-allowed;
  }
`

export interface BalCheckboxProps {
  name: string
  modelValue?: boolean
  label?: string
  noMargin?: boolean
  alignCheckbox?: string // e.g. 'items-start'
  rules?: Rules
  size?: 'sm' | 'md' | 'lg'
  color?: string // Only "blue" is allowed.
  disabled?: boolean
  onChange?: (checked: boolean) => void
  children?: React.ReactNode // For custom label content.
}

const BalCheckbox: React.FC<BalCheckboxProps> = ({
  name,
  modelValue = false,
  label = '',
  noMargin = false,
  alignCheckbox = 'items-start',
  rules = [],
  size = 'md',
  disabled = false,
  onChange,
  children,
}) => {
  const [errors, setErrors] = useState<string[]>([])

  // Simple validation: iterate through rules and collect error messages.
  const validate = (val: string | number) => {
    const newErrors: string[] = []
    rules.forEach((rule: RuleFunction) => {
      const result = rule(val)
      if (typeof result === 'string') newErrors.push(result)
    })
    setErrors(newErrors)
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked: any = event.target.checked
    if (onChange) onChange(checked)
    validate(checked)
  }



  // Compute text size for the label.
  const textSize = size === 'sm' ? '0.875rem' : size === 'lg' ? '1.125rem' : '1rem' // text-sm, text-lg, text-base

  // Compute wrapper classes.
  const wrapperStyle = {
    marginBottom: noMargin ? '0' : '0.25rem', // mb-1 if noMargin is false.
  }

  return (
    <CheckboxContainer style={wrapperStyle}>
      <Flex>
        <FlexAlign align={alignCheckbox}>
          <Checkbox
            name={name}
            checked={modelValue}
            disabled={disabled}
            onChange={handleChange}
          />
        </FlexAlign>
        <LabelContainer>
          {(children || label) && (
            <StyledLabel htmlFor={name} textSize={textSize}>
              {children ? children : label}
            </StyledLabel>
          )}
          {errors.length > 0 && (
            <ErrorText>
              <div>{errors[0]}</div>
            </ErrorText>
          )}
        </LabelContainer>
      </Flex>
    </CheckboxContainer>
  )
}

export default BalCheckbox
