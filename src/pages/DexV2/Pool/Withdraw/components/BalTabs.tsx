// BalTabs.tsx
import React from 'react'
import styled, { css } from 'styled-components'

export interface Tab {
  value: string | number
  label: string
}

interface BalTabsProps {
  tabs: Tab[]
  modelValue: string | number
  noPad?: boolean
  onChange: (value: string | number) => void
  children?: React.ReactNode
  className?: any
}

// Container – adds horizontal padding unless noPad is true, and applies a bottom border.
const Container = styled.div<{ noPad?: boolean }>`
  display: flex;
  border-bottom: 1px solid #E6E6FF;
  padding: ${({ noPad }) => (noPad ? '0' : '0 1rem')};
  color: rgba(41, 41, 51, 0.9);
`

const TabItem = styled.div<{ active: boolean }>`
  margin-bottom: -1px;
  margin-right: 2rem;
  padding: 1rem 0;
  cursor: pointer;
  font-weight: 500;
  transition: color 0.2s ease;

  ${({ active }) =>
    active
      ? css`
          border-bottom: 1px solid #66f;
          color: #8F8FB2;
          font-weight: 500;
          &:hover {
            color: #7a7aa1;
          }
        `
      : css`
          color: rgba(41, 41, 51, 0.9);
          &:hover {
            color: #8b5cf6;
          }
        `}
`

const BalTabs: React.FC<BalTabsProps> = ({ tabs, modelValue, noPad = false, onChange }) => {
  return (
    <Container noPad={noPad}>
      {tabs.map((tab, i) => (
        <TabItem key={i} active={modelValue === tab.value} onClick={() => onChange(tab.value)}>
          {tab.label}
        </TabItem>
      ))}
    </Container>
  )
}

export default BalTabs
