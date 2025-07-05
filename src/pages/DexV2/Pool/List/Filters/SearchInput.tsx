import React from 'react'
import styled from 'styled-components/macro'

interface SearchInputProps {
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
}

export const SearchInput: React.FC<SearchInputProps> = ({
  placeholder = 'Search',
  value = '',
  onChange
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.value)
    }
  }

  return (
    <StyledInput
      placeholder={placeholder}
      value={value}
      onChange={handleChange}
    />
  )
}

const StyledInput = styled.input`
  position: relative;
  display: flex;
  padding: 0 22px;
  height: 48px;
  align-items: center;
  white-space: nowrap;
  border: 1px solid #e6e6ff;
  outline: none;
  border-radius: 6px;
  color: ${({ theme }) => theme.text8};
  -webkit-appearance: none;
  background: transparent;
  font-size: 14px;
  width: 100%;
  transition: border 100ms;
  :focus {
    outline: none;
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 16px 22px;
  `};
`