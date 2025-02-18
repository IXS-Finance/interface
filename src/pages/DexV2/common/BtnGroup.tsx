import React from 'react'
import { Flex, Button } from 'rebass'
import styled from 'styled-components'

interface Option {
  value: any
  label: any
}

interface BtnGroupProps {
  value: any
  options: Option[]
  onChange: (value: any) => void
}

const BtnGroup: React.FC<BtnGroupProps> = ({ value, options, onChange, ...rest }) => {
  return (
    <Flex>
      {options.map((option) => {
        const isSelected = value === option.value
        // If the option label is 'best', translate it.
        const label = option.label === 'best' ? option.label : option.label
        return (
          <StyledButton
            key={option.value}
            size="small"
            sx={{ color: isSelected ? 'blue' : 'gray' }}
            onClick={() => onChange(option.value)}
            {...rest}
          >
            {label}
          </StyledButton>
        )
      })}
    </Flex>
  )
}

export default BtnGroup

// Styled button that mimics the Tailwind classes (e.g. "mr-2 capitalize w-18")
const StyledButton = styled(Button)`
  text-transform: capitalize;
  width: 72px; /* Assuming Tailwind's w-18 equals 72px */
  margin-right: 8px; /* mr-2 is roughly 8px */
`
