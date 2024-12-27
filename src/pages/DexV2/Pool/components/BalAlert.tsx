import React from 'react'
import styled, { css } from 'styled-components'

import warningIcon from 'assets/images/dex-v2/warning.svg'

interface AlertProps {
  type: 'tip' | 'warning' | 'error' | 'default'
  title: string
  children?: React.ReactNode
}

const BalAlert: React.FC<AlertProps> = ({ type = 'info', title = 'A title message', children }) => {
  const icon = {
    tip: '',
    warning: warningIcon,
    error: '',
    default: '',
  } as any

  return (
    <Alert type={type}>
      <AlertContainer>
        <AlertTitle style={{ marginBottom: children ? '8px' : '0' }}>
          <Img src={icon[type]} alt="icon" width={16} height={16} /> {title}
        </AlertTitle>
        <AlertDescription>{children}</AlertDescription>
      </AlertContainer>
    </Alert>
  )
}

const bgColorStyles = (type: string) => {
  switch (type) {
    case 'tip':
      return css`
        background-color: #ebf8ff;
        border-color: #bee3f8;
        color: #000;
      `
    case 'warning':
      return css`
        background-color: rgba(234, 88, 12, 0.1);
        border: #9a3412;
        color: #000;
      `
    case 'error':
      return css`
        background-color: #fef2f2;
        border-color: #fecaca;
        color: #000;
      `
    default:
      return css`
        background-color: #f7fafc;
        border-color: #edf2f7;
        color: #000;
      `
  }
}

const Alert = styled.div<any>`
  display: inline-block;
  font-weight: 500;
  ${({ type }) => bgColorStyles(type)}
  width: 100%;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
`
const AlertContainer = styled.div`
  display: flex;
  flex-direction: column;
`

const AlertTitle = styled.div`
  color: rgba(255, 128, 128, 0.9);
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  letter-spacing: -0.42px;
`

const Img = styled.img`
  width: 16px;
  height: 16px;
  margin-bottom: -2px;
`

const AlertDescription = styled.div`
  color: #84849d;
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 150%; /* 21px */
  letter-spacing: -0.42px;
`

export default BalAlert
