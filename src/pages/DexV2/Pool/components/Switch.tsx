import React, { useState } from 'react'
import styled from 'styled-components'

interface SwitchProps {
  checked: boolean
  onChange: () => void
}

const Switch: React.FC<SwitchProps> = ({ checked, onChange }) => {
  return (
    <SwitchContainer onClick={onChange} checked={checked}>
      <SwitchSvg>
        <SwitchBackground checked={checked} />
        <SwitchCircle checked={checked} />
      </SwitchSvg>
    </SwitchContainer>
  )
}

export default Switch

const SwitchContainer = styled.div<{ checked: boolean }>`
  display: flex;
  align-items: center;
  cursor: pointer;
`

const SwitchSvg = styled.svg.attrs({
  xmlns: 'http://www.w3.org/2000/svg',
  width: 22,
  height: 17,
  viewBox: '0 0 22 17',
  fill: 'none',
})``

const SwitchBackground = styled.rect.attrs({
  width: 22,
  height: 16,
  rx: 8,
})<{ checked: boolean }>`
  y: 0.5;
  fill: ${({ checked }) => (checked ? '#66F' : '#E2E2F1')};
`

const SwitchCircle = styled.rect.attrs({
  width: 10,
  height: 10,
  rx: 5,
  fill: 'white',
})<{ checked: boolean }>`
  x: ${({ checked }) => (checked ? 10 : 3)};
  y: 3.5;
  transition: x 0.3s ease;
`
