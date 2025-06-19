import React from 'react';
import styled, { keyframes } from 'styled-components';

export type LoadingIconSize = 'xs' | 'sm' | 'md' | 'lg';
export type LoadingIconColor = 'gray' | 'primary' | 'white';

export interface LoadingIconProps {
  size?: LoadingIconSize;
  color?: LoadingIconColor;
}

// Map sizes to dimensions.
const sizes: Record<LoadingIconSize, string> = {
  xs: '12px',
  sm: '16px',
  md: '22px',
  lg: '32px',
};

// Define the bounce keyframes.
const skBounce = keyframes`
  0%, 100% {
    transform: scale(0);
  }
  50% {
    transform: scale(1);
  }
`;

// Map color names to actual colors.
const bounceColor = (color: LoadingIconColor): string => {
  switch (color) {
    case 'white':
      return '#ffffff';
    case 'gray':
      return '#cbd5e0'; // equivalent to Tailwind's gray-400
    case 'primary':
      return '#3b82f6'; // example primary color (blue-500)
    default:
      return '#3b82f6';
  }
};

// Spinner wrapper with dynamic size.
const Spinner = styled.div<{ size: LoadingIconSize }>`
  position: relative;
  width: ${({ size }) => sizes[size]};
  height: ${({ size }) => sizes[size]};
`;

// Common styles for the bounces.
const Bounce = styled.div<{ color: LoadingIconColor }>`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  opacity: 0.6;
  position: absolute;
  top: 0;
  left: 0;
  background-color: ${({ color }) => bounceColor(color)};
  animation: ${skBounce} 2s infinite ease-in-out;
`;

// Second bounce with an animation delay.
const Bounce2 = styled(Bounce)`
  animation-delay: -1s;
`;

// The React component.
const LoadingIcon: React.FC<LoadingIconProps> = ({
  size = 'md',
  color = 'gray',
}) => {
  return (
    <Spinner size={size}>
      <Bounce color={color} />
      <Bounce2 color={color} />
    </Spinner>
  );
};

export default LoadingIcon;
