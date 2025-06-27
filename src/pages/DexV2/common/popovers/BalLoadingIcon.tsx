import React from 'react';
import styled, { keyframes } from 'styled-components';

// Define allowed sizes and colors.
export type ClipLoaderProps = {
  color?: 'gray' | 'primary' | 'white';
  size?: 'xs' | 'sm' | 'md' | 'lg';
};

const defaultProps: Partial<ClipLoaderProps> = {
  color: 'primary',
  size: 'md',
};

// Keyframes for the spin animation.
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

// Spinner styled-component with dynamic size, border thickness, and color.
const Spinner = styled.div<{ size: 'xs' | 'sm' | 'md' | 'lg'; color: 'gray' | 'primary' | 'white' }>`
  display: inline-block;
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
  border: ${({ size }) => {
    // Adjust the border width relative to the size.
    switch (size) {
      case 'xs':
        return '2px';
      case 'sm':
        return '2.5px';
      case 'lg':
        return '4px';
      case 'md':
      default:
        return '3px';
    }
  }} solid ${({ color }) => {
    const mapping: Record<string, string> = {
      white: '#ffffff',
      gray: '#9ca3af',
      primary: '#3b82f6',
    };
    return mapping[color] || '#3b82f6';
  }};
  border-top-color: transparent;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const BalLoadingIcon: React.FC<ClipLoaderProps> = (incomingProps) => {
  const { color, size } = { ...defaultProps, ...incomingProps };

  return <Spinner size={size!} color={color!} />;
};

export default BalLoadingIcon;