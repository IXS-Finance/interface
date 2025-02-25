import React, { useMemo } from 'react'
import styled, { css, keyframes } from 'styled-components'

// TYPES
type RoundedOpts = 'sm' | 'md' | 'lg'

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  white?: boolean
  darker?: boolean
  square?: boolean
  rounded?: RoundedOpts
  className?: string // Add className prop
}

// Keyframes for shimmer animation
const shimmerBackground = keyframes`
  0% {
    background-position: -5000px 0;
  }
  100% {
    background-position: 5000px 0;
  }
`

// Styled component for the loading block
const LoadingBlockComponent = styled.div<{ rounded?: RoundedOpts; square?: boolean; bgClass: any }>`
  min-height: 5px;
  ${({ rounded, square }) =>
    !square &&
    css`
      border-radius: ${rounded === 'sm' ? '0.125rem' : rounded === 'md' ? '0.375rem' : '0.5rem'};
    `}
  ${({ bgClass }) => bgClass}
  ${({ bgClass }) => bgClass}
`

const LoadingBlock: React.FC<Props> = ({
  white = false,
  darker = false,
  square = false,
  rounded = 'lg',
  className, // Add className prop
}) => {
  // COMPUTED
  const bgClass = useMemo(() => {
    if (white) {
      return css`
        --start-color: rgb(255 255 255 / 10%);
        --mid-color: rgb(255 255 255 / 20%);
        --end-color: rgb(255 255 255 / 10%);

        animation: ${shimmerBackground} 10s infinite;
        background: linear-gradient(to right, var(--start-color) 4%, var(--mid-color) 25%, var(--end-color) 36%);
        background-size: 1000px 100%;
      `
    }
    return darker
      ? css`
          --start-color: #f3f4f6; /* gray.100 */
          --mid-color: #e5e7eb; /* gray.200 */
          --end-color: #f3f4f6; /* gray.100 */

          animation: ${shimmerBackground} 10s infinite;
          background: linear-gradient(to right, var(--start-color) 4%, var(--mid-color) 25%, var(--end-color) 36%);
          background-size: 1000px 100%;
        `
      : css`
          --start-color: #f9fafb; /* gray.50 */
          --mid-color: #f3f4f6; /* gray.100 */
          --end-color: #f9fafb; /* gray.50 */

          animation: ${shimmerBackground} 10s infinite;
          background: linear-gradient(to right, var(--start-color) 4%, var(--mid-color) 25%, var(--end-color) 36%);
          background-size: 1000px 100%;
        `
  }, [white, darker])

  return (
    <LoadingBlockComponent
      rounded={rounded}
      square={square}
      bgClass={bgClass}
      className={className} // Pass className to the styled component
    />
  )
}

export default LoadingBlock
