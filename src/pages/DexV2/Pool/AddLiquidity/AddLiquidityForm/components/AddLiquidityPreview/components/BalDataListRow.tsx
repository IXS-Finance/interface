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
  padding: 0.25rem 0.5rem; /* py-1 px-2 */
`

const LabelContainer = styled.div`
  display: flex;
  align-items: center;
`

const ValueContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
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
