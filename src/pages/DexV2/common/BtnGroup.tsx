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
    <Flex style={{ gap: '8px' }}>
      {options.map((option) => {
        const isSelected = value === option.value
        // If the option label is 'best', translate it.
        const label = option.label === 'best' ? option.label : option.label

        return (
          <StyledButton
            key={option.value}
            size="small"
            sx={{
              color: isSelected ? 'rgba(102, 102, 255, 0.90)' : 'rgba(41, 41, 51, 0.90)',
              border: isSelected ? '1px solid rgba(102, 102, 255, 0.30)' : '1px solid #E6E6FF',
              borderRadius: '8px',
              background: 'transparent',
              cursor: 'pointer',
            }}
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
  width: 72px;
  font-size: 14px;
`
