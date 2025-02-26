import React from 'react';
import styled, { keyframes, css } from 'styled-components';

// Define allowed sizes and colors.
export type BalLoadingIconProps = {
  color?: 'gray' | 'primary' | 'white';
  size?: 'xs' | 'sm' | 'md' | 'lg';
};

const defaultProps: Partial<BalLoadingIconProps> = {
  color: 'gray',
  size: 'md',
};

// Keyframes for the bounce animation.
const skBounce = keyframes`
  0%, 100% { transform: scale(0); }
  50% { transform: scale(1); }
`;

// Spinner container with dynamic size.
const Spinner = styled.div<{ size: 'xs' | 'sm' | 'md' | 'lg' }>`
  position: relative;
  width: ${({ size }) => {
    switch (size) {
      case 'xs':
        return '12px';
      case 'sm':
        return '16px';
      case 'lg':
        return '32px';
      case 'md':
      default:
        return '22px';
    }
  }};
  height: ${({ size }) => {
    switch (size) {
      case 'xs':
        return '12px';
      case 'sm':
        return '16px';
      case 'lg':
        return '32px';
      case 'md':
      default:
        return '22px';
    }
  }};
`;

// Bounce element with dynamic color and optional animation delay.
const Bounce = styled.div<{ color: 'gray' | 'primary' | 'white'; delay?: string }>`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  opacity: 0.6;
  position: absolute;
  top: 0;
  left: 0;
  background-color: ${({ color }) => {
    const mapping: Record<string, string> = {
      white: '#ffffff',
      gray: '#9ca3af',
      primary: '#3b82f6',
    };
    return mapping[color] || '#9ca3af';
  }};
  animation: ${skBounce} 2s infinite ease-in-out;
  ${({ delay }) =>
    delay &&
    css`
      animation-delay: ${delay};
    `}
`;

const BalLoadingIcon: React.FC<BalLoadingIconProps> = (incomingProps) => {
  const { color, size } = { ...defaultProps, ...incomingProps };

  return (
    <Spinner size={size!}>
      <Bounce color={color!} delay="0s" />
      <Bounce color={color!} delay="-1s" />
    </Spinner>
  );
};

export default BalLoadingIcon;
