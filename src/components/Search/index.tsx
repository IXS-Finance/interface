import React, { ChangeEvent, CSSProperties, useEffect, useState } from 'react'
import { t } from '@lingui/macro'
import styled from 'styled-components'

import searchImg from 'assets/images/search-circle.svg'

let timer = null as any

interface Props {
  placeholder?: string
  setSearchValue: (newValue: string) => void
  style?: CSSProperties
  value?: string
}

export const Search = ({ setSearchValue, placeholder, style, value }: Props) => {
  const [search, handleSearch] = useState('')

  useEffect(() => {
    if (value && value !== search) {
      handleSearch(value)
    }
  }, [value])

  const onSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    handleSearch(value)
    clearTimeout(timer)
    timer = setTimeout(() => setSearchValue(value), 250)
  }

  return (
    <Container className="search">
      <SearchIcon src={searchImg} alt="searchImg" />
      <Input
        style={style}
        placeholder={`${placeholder || 'Search for Wallet or Token'}`}
        onChange={onSearchChange}
        value={search}
      />
    </Container>
  )
}

const Container = styled.div`
  position: relative;
  width: 90%;
`

const SearchIcon = styled.img`
  position: absolute;
  top: 16px;
  left: 16px;
  width: 20px;
  height: 20px;
`

export const Input = styled.input`
  // background-color: ${({ theme, value }) => (value ? theme.bg7 : theme.bg19)};
  border: 1px solid #e6e6ff;
  font-size: 20px;
  border-radius: 8px;
  width: 100%;
  height: 60px;
  // outline: none;
  // border: none;
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
  }
  ::placeholder {
    color: ${({ theme }) => theme.text11};
  }
  color: ${({ theme, color }) => (color === 'red' ? theme.red1 : theme.text1)};
  padding: 10px 22px;
  padding-left: 60px;
  margin-bottom: 40px;
  @media (max-width: 768px) {
    font-size: 16px;
  }
`
