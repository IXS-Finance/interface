import React from 'react'
import styled from 'styled-components'

type Props = {
  title?: string
  children?: React.ReactNode
}

const Container = styled.div`
  border-radius: 8px;
  border: 1px solid #e6e6ff;
  background: #fff;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
`

const Header = styled.div`
  color: rgba(41, 41, 51, 0.9);
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 200%; /* 28px */
  letter-spacing: -0.28px;
`

const Content = styled.div`
  display: flex;
  flex-direction: column;
`

const BalDataList: React.FC<Props> = ({ title = 'Summary', children }) => {
  return (
    <Container>
      <Header>{title}</Header>
      <Content>{children}</Content>
    </Container>
  )
}

export default BalDataList
