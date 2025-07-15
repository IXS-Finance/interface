// BalCircle.tsx
import React from 'react'
import styled from 'styled-components'

interface BalCircleProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: string
  color?: string
  children?: React.ReactNode
}

// A simple mapping for some colors to their Tailwind 500 equivalents.
const colorMap: { [key: string]: string } = {
  gray: '#6B7280', // Tailwind gray-500
  red: '#ef4444',
  blue: '#3b82f6',
  green: '#10b981',
  // add additional colors as needed
}

// Helper to append "px" if the value is numeric.
const addPx = (value: string | undefined): string => {
  if (!value) return '16px'
  return isNaN(Number(value)) ? value : `${value}px`
}

const StyledBalCircle = styled.div<BalCircleProps>`
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0;
  width: ${(props) => addPx(props.size)};
  height: ${(props) => addPx(props.size)};
  background-color: ${(props) => (props.color ? colorMap[props.color] || props.color : colorMap.gray)};
`

const BalCircle: React.FC<BalCircleProps> = ({ size = '16', color = 'gray', children }) => {
  return (
    <StyledBalCircle size={size} color={color}>
      {children}
    </StyledBalCircle>
  )
}

export default BalCircle
