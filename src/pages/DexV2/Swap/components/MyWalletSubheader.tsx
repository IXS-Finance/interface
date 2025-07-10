import React from 'react'
import styled from 'styled-components'

const Subheader = styled.div`
  padding: 0.5rem 0.75rem;
  margin: 0 -0.75rem;
  /* In Tailwind, border-gray-200 applies a border color.
     Here we add a 1px border for demonstration. */
  border: 1px solid #e5e7eb;
`

interface MyWalletSubheaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const MyWalletSubheader: React.FC<MyWalletSubheaderProps> = ({ children }) => {
  return <Subheader>{children}</Subheader>
}

export default MyWalletSubheader
