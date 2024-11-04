import React from 'react'
import styled from 'styled-components'

interface BalProgressBarProps {
  color?: string
  width: number
  bufferWidth?: number
}

const ProgressBar: React.FC<BalProgressBarProps> = ({ color, width, bufferWidth = 0 }) => {
  return (
    <ProgressBarWrapper>
      <ProgressBarContent color={color} width={width} />
      {bufferWidth > 0 && <BufferBar width={bufferWidth} />}
    </ProgressBarWrapper>
  )
}

const ProgressBarWrapper = styled.div`
  position: relative;
  height: 8px;
  background-color: #e0e0e0;
  border-radius: 38px;
  overflow: hidden;
  margin-top: 16px;
  margin-bottom: 16px;
`

const ProgressBarContent = styled.div<{ color?: string; width: number }>`
  height: 100%;
  background-color: ${(props) => props.color || 'blue'};
  width: ${(props) => props.width}%;
  transition: width 0.3s ease;
`

const BufferBar = styled.div<{ width: number }>`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.1);
  width: ${(props) => props.width}%;
`

export default ProgressBar
