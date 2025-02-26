import React from 'react'
import styled from 'styled-components'
import omit from 'lodash/omit'
import BalBtn from './BalBtn' // Import your button component

// Define the Option type.
export interface Option {
  value: string | number
  label: string
}

// Extend HTML attributes for a container.
interface BalBtnGroupProps {
  modelValue: string | number
  options: Option[]
  onChange: (value: string | number) => void
}

// A styled container that arranges buttons horizontally.
const FlexContainer = styled.div`
  display: flex;
`

// A styled version of BalBtn with fixed margin and width.
// (Tailwind classes: mr-2, capitalize, w-18 => w-18 means 4.5rem if 1 unit = 0.25rem)
const StyledBalBtn = styled(BalBtn)`
  margin-right: 0.5rem;
  text-transform: capitalize;
  width: 4.5rem;
`

const BalBtnGroup: React.FC<BalBtnGroupProps> = (props) => {
  const { modelValue, options, onChange, ...rest } = props

  // Omit the "options" key from rest attributes if present.
  const attrs = omit(rest, ['options'])

  return (
    <FlexContainer>
      {options.map((option) => (
        <StyledBalBtn
          key={option.value}
          outline
          size="sm"
          {...attrs}
          color={modelValue === option.value ? 'blue' : 'gray'}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </StyledBalBtn>
      ))}
    </FlexContainer>
  )
}

export default BalBtnGroup
