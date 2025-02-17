import React from 'react';
import styled, { css } from 'styled-components';

// Define allowed prop types
type Gap = '4' | '8';
type MaxWidth = '3xl';
type ColSpan = '5' | '6' | '7';
type Cols = '12';

export interface TwoColumnProps {
  /** Always '12' in this version; kept for consistency */
  cols?: Cols;
  /** Controls vertical & (on lg screens) horizontal gaps */
  gap?: Gap;
  /** Column span for left content on lg screens */
  leftSpan?: ColSpan;
  /** Column span for right content on lg screens */
  rightSpan?: ColSpan;
  /** Maximum width of the container */
  maxWidth?: MaxWidth;
  /** Content for the left column */
  left?: React.ReactNode;
  /** Content for the right column */
  right?: React.ReactNode;
  /** Additional (default slot) content */
  children?: React.ReactNode;
}

/*
  Container mimics: px-4 lg:px-0 mx-auto and max-w-3xl
  Tailwind's max-w-3xl is about 48rem by default.
*/
const Container = styled.div<{ maxWidth: MaxWidth }>`
  padding-left: 1rem;
  padding-right: 1rem;
  margin-left: auto;
  margin-right: auto;

  @media (min-width: 1024px) {
    padding-left: 0;
    padding-right: 0;
  }

  ${({ maxWidth }) =>
    maxWidth === '3xl' &&
    css`
      max-width: 48rem;
      width: 48rem;
    `}
`;

/*
  GridContainer mimics:
  - grid grid-cols-1 (one column by default)
  - lg:grid-cols-12 (12 columns on large screens)
  - gap-x-0 on small screens and lg:gap-x-4 (or 8) on large screens,
    with a consistent row gap from gap-y-4 (or 8)

  For gap '4', we use 1rem; for gap '8', we use 2rem.
*/
const GridContainer = styled.div<{ gap: Gap }>`
  display: grid;
  grid-template-columns: 1fr;
  /* On small screens: no column gap and set row gap */
  column-gap: 0;
  row-gap: ${({ gap }) => (gap === '4' ? '1rem' : '2rem')};

  @media (min-width: 1024px) {
    grid-template-columns: repeat(12, minmax(0, 1fr));
    column-gap: ${({ gap }) => (gap === '4' ? '1rem' : '2rem')};
  }
`;

/*
  Column styled component mimics Tailwind's col-span-{x}.
  On small screens (1-column grid) the span doesn't matter.
  On large screens, we set grid-column to span the given number of columns.
*/
const Column = styled.div<{ span: ColSpan }>`
  @media (min-width: 1024px) {
    grid-column: span ${({ span }) => span} / span ${({ span }) => span};
  }
`;

export const Col2Layout: React.FC<TwoColumnProps> = ({
  cols = '12',
  gap = '8',
  leftSpan = '6',
  rightSpan = '6',
  maxWidth = '3xl',
  left,
  right,
  children,
}) => {
  return (
    <Container maxWidth={maxWidth}>
      <GridContainer gap={gap}>
        <Column span={leftSpan}>{left}</Column>
        <Column span={rightSpan}>{right}</Column>
        {children}
      </GridContainer>
    </Container>
  );
};

export default Col2Layout;
