import React from 'react';
import styled from 'styled-components';

// Define spacing and alignment types.
export type Spacing = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | 'none';
export type Alignment = 'center' | 'start' | 'end' | 'between';

// Maps discrete spacing types to a Tailwind spacing tier.
const SpacingMap: Record<Spacing, number> = {
  xs: 1,
  sm: 2,
  base: 4,
  lg: 8,
  xl: 12,
  '2xl': 16,
  none: 0,
};

interface StackProps {
  vertical?: boolean; // Stack items top-down
  horizontal?: boolean; // Stack items left-to-right
  spacing?: Spacing;
  withBorder?: boolean; // Add a hairline border after each item
  align?: Alignment | null; // Align items (affects align-items)
  justify?: Alignment | null; // Justify items (affects justify-content)
  expandChildren?: boolean; // Force children to occupy full width (or height)
  children?: React.ReactNode;
}

interface StackItemProps {
  isLast: boolean;
  vertical: boolean;
  spacing: Spacing;
  withBorder: boolean;
  expandChildren: boolean;
}

// Container: A flex container whose direction, alignment, and justification are set via props.
const Container = styled.div<StackProps>`
  display: flex;
  flex-direction: ${(props) => (props.vertical ? 'column' : 'row')};
  align-items: ${(props) => {
    if (props.align === 'center') return 'center';
    if (props.align === 'start') return 'flex-start';
    if (props.align === 'end') return 'flex-end';
    return 'stretch';
  }};
  justify-content: ${(props) => {
    if (props.justify === 'center') return 'center';
    if (props.justify === 'start') return 'flex-start';
    if (props.justify === 'end') return 'flex-end';
    if (props.justify === 'between') return 'space-between';
    return 'flex-start';
  }};
`;

// StackItem: Wraps each child and applies margin and an optional border to every item except the last.
const StackItem = styled.div<StackItemProps>`
  ${(props) => (props.expandChildren ? 'width: 100%;' : '')}
  ${(props) =>
    props.vertical
      ? `
    margin-bottom: ${!props.isLast ? `${SpacingMap[props.spacing] * 0.25}rem` : '0'};
    ${props.withBorder && !props.isLast ? 'border-bottom: 1px solid #e5e7eb;' : ''}
  `
      : `
    margin-right: ${!props.isLast ? `${SpacingMap[props.spacing] * 0.25}rem` : '0'};
    ${props.withBorder && !props.isLast ? 'border-right: 1px solid #e5e7eb;' : ''}
  `}
`;

const BalStack: React.FC<StackProps> = ({
  vertical = false,
  horizontal = false,
  spacing = 'base',
  withBorder = false,
  align = null,
  justify = null,
  expandChildren = false,
  children,
  ...rest
}) => {
  // Use React.Children.toArray to safely convert children to an array.
  const childrenArray = React.Children.toArray(children);
  const wrappedChildren = childrenArray.map((child, index) => (
    <StackItem
      key={index}
      isLast={index === childrenArray.length - 1}
      vertical={vertical}
      spacing={spacing}
      withBorder={withBorder}
      expandChildren={expandChildren}
    >
      {child}
    </StackItem>
  ));

  return (
    <Container
      vertical={vertical}
      horizontal={horizontal}
      align={align}
      justify={justify}
      {...rest}
    >
      {wrappedChildren}
    </Container>
  );
};

export default BalStack;
