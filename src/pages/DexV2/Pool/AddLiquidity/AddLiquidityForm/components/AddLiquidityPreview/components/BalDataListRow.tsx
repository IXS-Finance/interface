// BalDataListRow.tsx
import React from 'react'
import styled from 'styled-components'

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  label?: React.ReactNode
  children?: React.ReactNode
}

const Container = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  padding: 8px 0;
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
`

const LabelContainer = styled.div`
  display: flex;
  align-items: center;
  color: #b8b8d2;
`

const ValueContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  color: rgba(41, 41, 51, 0.9);
`

const BalDataListRow: React.FC<Props> = ({ label, children }) => {
  return (
    <Container>
      <LabelContainer>{label}</LabelContainer>
      <ValueContainer>{children}</ValueContainer>
    </Container>
  )
}

export default BalDataListRow
