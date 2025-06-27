import styled from 'styled-components';
import { ReactNode } from 'react';

type Props = {
  mobileGuttersFirst?: boolean;
  mobileGuttersLast?: boolean;
  mobileHideGutters?: boolean;
  offsetGutters?: boolean;
  children: {
    gutterLeft?: ReactNode;
    center?: ReactNode;
    gutterRight?: ReactNode;
  };
};

const LayoutContainer = styled.div`
  max-width: 72rem;
  margin: 0 auto;
  padding: 0 1rem;
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  @media (min-width: 1024px) {
    grid-template-columns: repeat(7, 1fr);
    gap: 2rem;
  }
`;

const GutterCol = styled.div<{ gutterClasses: string }>`
  grid-column: span 2;
  ${(props) => props.gutterClasses};
`;

const CenterCol = styled.div<{ centerClasses: string }>`
  width: 100%;
  max-width: 36rem;
  margin: 0 auto;
  grid-column: span 3;
  ${(props) => props.centerClasses};
`;

export default function Col3Layout({
  mobileGuttersFirst = false,
  mobileGuttersLast = false,
  mobileHideGutters = false,
  offsetGutters = false,
  children,
}: Props) {
  const gutterClasses = `
    ${mobileGuttersFirst ? 'order-1 lg:order-2' : ''}
    ${mobileGuttersLast ? 'order-3 lg:order-2' : ''}
    ${mobileHideGutters ? 'hidden lg:block' : ''}
    ${offsetGutters ? 'mt-6' : ''}
  `;

  const centerClasses = `
    ${mobileGuttersFirst ? 'order-2' : ''}
    ${mobileGuttersLast ? 'order-1 lg:order-2' : ''}
  `;

  return (
    <LayoutContainer>
      <GutterCol gutterClasses={gutterClasses}>{children.gutterLeft}</GutterCol>
      <CenterCol centerClasses={centerClasses}>{children.center}</CenterCol>
      <GutterCol gutterClasses={gutterClasses}>{children.gutterRight}</GutterCol>
    </LayoutContainer>
  );
}
