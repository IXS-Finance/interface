import React, { useState } from 'react'
import styled from 'styled-components'

const Switch: React.FC = () => {
  const [isOn, setIsOn] = useState(false)

  const toggleSwitch = () => {
    setIsOn(!isOn)
  }

  return (
    <SwitchContainer onClick={toggleSwitch} isOn={isOn}>
      <SwitchSvg>
        <SwitchBackground isOn={isOn} />
        <SwitchCircle isOn={isOn} />
      </SwitchSvg>
    </SwitchContainer>
  )
}

export default Switch

const SwitchContainer = styled.div<{ isOn: boolean }>`
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
})<{ isOn: boolean }>`
  y: 0.5;
  fill: ${({ isOn }) => (isOn ? '#66F' : '#E2E2F1')};
`

const SwitchCircle = styled.rect.attrs({
  width: 10,
  height: 10,
  rx: 5,
  fill: 'white',
})<{ isOn: boolean }>`
  x: ${({ isOn }) => (isOn ? 10 : 3)};
  y: 3.5;
  transition: x 0.3s ease;
`