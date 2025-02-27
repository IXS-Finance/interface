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
  border-bottom: 1px solid #e5e7eb;
  padding: ${({ noPad }) => (noPad ? '0' : '0 1rem')};
  color: #6b7280; /* text-secondary */
`

// TabItem – each tab is clickable, has a bottom margin (negative to pull up the border),
// right margin of 1.5rem (mr-6), vertical padding of 0.75rem (py-3) and a pointer cursor.
const TabItem = styled.div<{ active: boolean }>`
  margin-bottom: -1px;
  margin-right: 1.5rem;
  padding: 0.75rem 0;
  cursor: pointer;
  font-weight: 500;
  transition: color 0.2s ease;

  ${({ active }) =>
    active
      ? css`
          border-bottom: 2px solid #2563eb; /* blue-600 */
          color: #2563eb;
          font-weight: 600;
          &:hover {
            color: #3b82f6; /* blue-500 */
          }
        `
      : css`
          &:hover {
            color: #8b5cf6; /* purple-600 */
          }
        `}
`

// LastTabItem – similar to TabItem but with adjusted left margin and left padding.
const LastTabItem = styled.div<{ active: boolean }>`
  margin-right: 0;
  margin-left: -1.5rem;
  padding-left: 0.5rem;
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
  font-weight: 500;
  transition: color 0.2s ease;

  ${({ active }) =>
    active
      ? css`
          border-bottom: 2px solid #2563eb;
          color: #2563eb;
          font-weight: 600;
          &:hover {
            color: #3b82f6;
          }
        `
      : css`
          &:hover {
            color: #8b5cf6;
          }
        `}
`

const BalTabs: React.FC<BalTabsProps> = ({ tabs, modelValue, noPad = false, onChange, children }) => {
  // Compute the "last tab" as the last element of the tabs array.
  const lastTab = tabs[tabs.length - 1]

  return (
    <Container noPad={noPad}>
      {tabs.map((tab, i) => (
        <TabItem key={i} active={modelValue === tab.value} onClick={() => onChange(tab.value)}>
          {tab.label}
        </TabItem>
      ))}
      <LastTabItem active={modelValue === lastTab?.value}>{children}</LastTabItem>
    </Container>
  )
}

export default BalTabs
