import React from 'react'
import styled from 'styled-components'
import { PoolToken } from 'services/pool/types'

interface HiddenTokensPillsProps {
  tokens: PoolToken[]
  hasBalance?: boolean
  isSelected?: boolean
  isPicked?: boolean
}

const Container = styled.div`
  display: flex;
  position: relative;
  margin: 0.25rem 0;
  margin-right: 0.5rem;
`

const Pill = styled.div<{ isSelected: boolean; isPicked: boolean }>`
  padding: 0.25rem 0.5rem;
  max-height: 2.5rem;
  border-radius: 0.5rem;
  background: #f9fafb; /* gray-50 */
  color: #4b5563; /* gray-600 */
  font-size: 0.875rem; /* text-sm */
  display: flex;
  align-items: center;
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.07);

  ${(props) =>
    (props.isSelected || props.isPicked) &&
    `
    background: #2563eb; /* blue-600 */
    color: #ffffff;
  `}
`

const StackedPill = styled.div<{ isSelected: boolean }>`
  height: 100%;
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
  border-radius: 0.5rem;
  background: #f9fafb; /* gray-50 */
  color: #4b5563; /* gray-600 */
  padding: 0.25rem 0.5rem;
  box-shadow: 2px 0 4px rgba(0, 0, 0, 0.07);

  ${(props) =>
    props.isSelected &&
    `
    background: #2563eb; /* blue-600 */
    color: #ffffff;
  `}
`

const BalanceIndicator = styled.div`
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
  border: 2px solid #ffffff;
  background: #c6f6d5; /* green-200 */
  position: absolute;
  top: 0;
  right: 0;
  margin-top: -0.25rem;
  margin-right: -0.25rem;
`

const HiddenTokensPills: React.FC<HiddenTokensPillsProps> = ({
  tokens,
  hasBalance = false,
  isSelected = false,
  isPicked = false,
}) => {
  const tokensCount = tokens.length

  return (
    <Container>
      {/* Main pill with token count */}
      <Pill isSelected={isSelected} isPicked={isPicked} style={{ zIndex: tokensCount }}>
        {`+${tokensCount} tokens`}
      </Pill>

      {/* Optional balance indicator */}
      {hasBalance && <BalanceIndicator style={{ zIndex: tokensCount }} />}

      {/* Two stacked pills */}
      {[1, 2].map((n) => (
        <StackedPill
          key={n}
          isSelected={isSelected}
          style={{
            transform: `translateX(${n * 8}px)`,
            zIndex: tokensCount - n,
          }}
        />
      ))}
    </Container>
  )
}

export default HiddenTokensPills
