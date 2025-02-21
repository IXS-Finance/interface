import React from 'react'
import styled, { css, useTheme } from 'styled-components'

import { ReactComponent as warningIcon } from 'assets/images/dex-v2/warning.svg'
import { Flex } from 'rebass'

interface AlertProps {
  type: 'tip' | 'warning' | 'error' | 'default'
  title: string
  children?: React.ReactNode
}

const BalAlert: React.FC<AlertProps> = ({ type = 'info', title = 'A title message', children }) => {
  const icon = {
    tip: warningIcon,
    warning: warningIcon,
    error: warningIcon,
    default: warningIcon,
  } as any
  const Icon = icon[type]
  const theme = useTheme()

  return (
    <Alert type={type}>
      <AlertContainer>
        <Flex alignItems='center' mb={children ? '8px' : '0'} style={{ gap: 4 }}>
          <Icon width={16} height={16} color={theme.red5} />
          <AlertTitle>
            {title}
          </AlertTitle>
        </Flex>
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
