import React from 'react';
import styled from 'styled-components';

interface BalProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  width: string | number;      // Main progress percentage
  bufferWidth: string | number; // Buffer progress percentage
  size?: string;               // Size as a string number (default "1")
  color?: string;              // Color name (default "green")
}

const defaultProps: Partial<BalProgressBarProps> = {
  size: '1',
  color: 'green',
};

// Container styled like Tailwind's "w-full rounded-full bg-gray-100 overflow-hidden flex"
const ProgressTrack = styled.div`
  width: 100%;
  border-radius: 9999px;
  background-color: #f3f4f6;
  overflow: hidden;
  display: flex;
  position: relative;
`;

// Bar styled component (used for both main and buffer bars)
interface BarProps{
  barWidth: string;
  height: string;
  bgColor: string;
}
const ProgressBar = styled.div<BarProps>`
  transition: all 0.3s ease;
  width: ${({ barWidth }) => barWidth};
  height: ${({ height }) => height};
  background-color: ${({ bgColor }) => bgColor};
`;

// Helper: convert size (as string number) to height in rem.
// For example, Tailwind's h-1 equals 0.25rem.
function getHeight(size: string): string {
  const multiplier = Number(size) || 1;
  return `${multiplier * 0.25}rem`;
}

// Helper: simple mapping for background colors.
function getBgColor(color: string): string {
  const mapping: Record<string, string> = {
    green: '#4ade80',  // green-400
    blue: '#3b82f6',   // blue-400
    red: '#ef4444',    // red-400
    orange: '#f97316', // orange-500
    gray: '#9ca3af',   // gray-400
  };
  return mapping[color] || '#4ade80';
}

const BalProgressBar: React.FC<BalProgressBarProps> = (incomingProps) => {
  const props = { ...defaultProps, ...incomingProps };

  // Compute the height from the size prop.
  const height = getHeight(String(props.size));

  // Determine the background colors.
  // For gradient colors in Vue, the main bar uses props.color (e.g. "green") with suffix "-400".
  // Here we use a simple mapping.
  const mainBgColor = getBgColor(props.color!);
  // The buffer bar always uses orange.
  const bufferBgColor = getBgColor('orange');

  // Calculate inline width styles (as percentage strings).
  const mainBarWidth = `${props.width}%`;
  const bufferBarWidth = `${props.bufferWidth}%`;

  return (
    <ProgressTrack {...props}>
      <ProgressBar barWidth={mainBarWidth} height={height} bgColor={mainBgColor} />
      {Number(props.bufferWidth) > 0 && (
        <ProgressBar barWidth={bufferBarWidth} height={height} bgColor={bufferBgColor} />
      )}
    </ProgressTrack>
  );
};

export default BalProgressBar;
