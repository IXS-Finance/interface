import React from 'react';
import styled from 'styled-components';
import { PoolToken } from 'services/pool/types';
import BalanceTooltip from './BalanceTooltip';
import BalTooltip from '../BalTooltip';
// Assume Tooltip is a React tooltip component that accepts the following props:
// disabled, textAlign, delayMs and renders its first child as the activator
// and its child content as the tooltip content.

interface Props {
  hasBalance?: boolean;
  symbol: string;
  isSelected?: boolean;
  isPicked?: boolean;
  token: PoolToken;
}

// Styled component for the pill container. The pseudo-element ::before creates
// the skewed background and its style changes based on props.
const Pill = styled.div<{ isSelected: boolean; isPicked: boolean; hoverable: boolean }>`
  display: flex;
  position: relative;
  margin: 0.25rem 0;
  max-height: 2.5rem;
  align-items: center;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #f7fafc; /* gray-100 */
    transform: skew(-16deg);
  }

  &:first-child::before {
    border-radius: 4px 0 0 4px;
  }
  &:last-child::before {
    border-radius: 0 4px 4px 0;
  }
  &:only-child::before {
    border-radius: 4px;
  }

  ${props => props.isSelected && `
    &::before {
      box-shadow: 0 0 0 2px #3b82f6; /* blue-500 */
    }
  `}

  ${props => props.isPicked && `
    &::before {
      background: #eff6ff; /* blue-50 */
    }
  `}

  ${props => props.hoverable && `
    &:hover::before,
    &:focus::before {
      background: #edf2f7; /* gray-200 */
    }
  `}
`;

// Styled component for the pill text.
const PillText = styled.div<{ isSelected: boolean }>`
  padding: 0.25rem 0.5rem;
  z-index: 1;
  font-weight: ${props => (props.isSelected ? 500 : 400)};
`;

// Styled component for the balance indicator dot.
const BalanceIndicator = styled.div`
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
  border: 2px solid white;
  background: #c6f6d5; /* green-200 */
  position: absolute;
  top: 0;
  right: 0;
  margin-top: -0.25rem;
  margin-right: -0.5rem;
`;

const StableTokenPill: React.FC<Props> = ({
  hasBalance = false,
  symbol,
  isSelected = false,
  isPicked = false,
  token,
}) => {
  return (
    <BalTooltip disabled={!hasBalance} textAlign="left" delayMs={50}>
      {/* Activator */}
      <Pill isSelected={isSelected} isPicked={isPicked} hoverable={hasBalance}>
        {hasBalance && <BalanceIndicator />}
        <PillText isSelected={isSelected}>{symbol}</PillText>
      </Pill>
      {/* Tooltip Content */}
      <BalanceTooltip token={token} symbol={symbol} />
    </BalTooltip>
  );
};

export default StableTokenPill;
