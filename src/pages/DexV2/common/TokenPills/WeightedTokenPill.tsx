// WeightedTokenPill.tsx
import React from 'react';
import styled, { css } from 'styled-components';
import { PoolToken } from 'services/pool/types';
import BalanceTooltip from './BalanceTooltip';

export interface WeightedTokenPillProps {
  hasBalance: boolean;
  symbol: string;
  weight: string;
  isSelected: boolean;
  isPicked: boolean;
  token: PoolToken;
  isOnMigrationCard?: boolean;
  isHovered?: boolean;
}

const PillWrapper = styled.div<{
  isSelected: boolean;
  isPicked: boolean;
  isMigration?: boolean;
  isHovered?: boolean;
  hasBalance: boolean;
}>`
  display: flex;
  align-items: center;
  padding: 0.25rem 0.5rem;  /* py-1, px-2 */
  margin: 0.25rem 0;        /* my-1 */
  border-radius: 0.5rem;    /* rounded-lg */
  background-color: #f3f4f6; /* bg-gray-100 */
  position: relative;
  max-height: 2.5rem;       /* max-h-10 */
  cursor: pointer;
  transition: background-color 0.2s ease;
  &:hover,
  &:focus {
    background-color: #e5e7eb; /* hover:bg-gray-200 */
  }
  ${({ isSelected }) =>
    isSelected &&
    css`
      box-shadow: 0 0 0 2px #2563eb; /* ring-blue-500 */
    `}
  ${({ isPicked }) =>
    isPicked &&
    css`
      background-color: #eff6ff; /* approximates blue-50 */
    `}
  ${({ isMigration }) =>
    isMigration &&
    css`
      background-color: rgba(31, 41, 55, 0.6);
    `}
  ${({ isHovered }) =>
    isHovered &&
    css`
      background-color: #e5e7eb;
    `}
`;

const BalanceIndicator = styled.div`
  width: 0.75rem;  /* w-3 */
  height: 0.75rem; /* h-3 */
  border-radius: 50%;
  border: 2px solid white;
  background-color: #bbf7d0; /* bg-green-200 */
  position: absolute;
  top: 0;
  right: 0;
  margin-top: -0.25rem; /* -mt-1 */
  margin-right: -0.25rem; /* -mr-1 */
`;

const PillWeight = styled.span<{ isMigration?: boolean }>`
  font-weight: 500;
  font-size: 0.75rem; /* text-xs */
  color: ${({ isMigration }) => (isMigration ? '#9ca3af' : '#4b5563')}; /* pill-weight vs pill-weight-migration */
  margin-top: 1px;
  margin-left: 0.25rem;
`;

interface BalTooltipProps {
  disabled: boolean;
  textAlign: string;
  delayMs: number;
  className?: string;
  activator: React.ReactNode;
  children: React.ReactNode;
}

// A simple BalTooltip component that renders the activator and tooltip content.
// (Replace this with your actual tooltip component.)
const BalTooltip: React.FC<BalTooltipProps> = ({ disabled, activator, children, ...rest }) => {
  return (
    <div {...rest}>
      {activator}
      {/* Tooltip content is rendered here. In a real component, you’d conditionally show/hide this content. */}
      {!disabled && <div className="tooltip-content">{children}</div>}
    </div>
  );
};

const WeightedTokenPill: React.FC<WeightedTokenPillProps> = ({
  hasBalance,
  symbol,
  weight,
  isSelected,
  isPicked,
  token,
  isOnMigrationCard = false,
  isHovered = false,
}) => {
  return (
    <BalTooltip
      disabled={!hasBalance}
      textAlign="left"
      delayMs={50}
      className="mr-2"
      activator={
        <PillWrapper
          hasBalance={hasBalance}
          isSelected={isSelected}
          isPicked={isPicked}
          isMigration={isOnMigrationCard}
          isHovered={isHovered}
        >
          {hasBalance && <BalanceIndicator />}
          <span style={{ fontWeight: isSelected ? 500 : 'normal' }}>{symbol}</span>
          {weight !== '0%' && <PillWeight isMigration={isOnMigrationCard}>{weight}</PillWeight>}
        </PillWrapper>
      }
    >
      <BalanceTooltip token={token} symbol={symbol} />
    </BalTooltip>
  );
};

export default WeightedTokenPill;
