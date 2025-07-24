import React from 'react'
import styled from 'styled-components'
import { ReactComponent as SearchIcon } from 'assets/images/dex-v2/search.svg'

const TextInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => {
  return (
    <Wrapper>
      <IconWrapper>
        <SearchIcon />
      </IconWrapper>
      <StyledInput {...props} />
    </Wrapper>
  )
}

export default TextInput

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  border-radius: 8px;
  border: 1px solid #e6e6ff;
  background: #fff;
  padding: 0 10px;
  height: 50px;
  width: 100%;
`

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
`

const StyledInput = styled.input`
  border: none;
  color: #b8b8d2;
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  letter-spacing: -0.42px;
  width: 100%;
  box-sizing: border-box;
  outline: none;
`
