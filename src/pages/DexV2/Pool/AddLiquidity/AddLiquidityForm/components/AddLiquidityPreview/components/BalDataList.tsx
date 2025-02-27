import React from 'react';
import styled from 'styled-components';

type Props = {
  title?: string;
  children?: React.ReactNode;
};

const Container = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
  width: 100%;
`;

const Header = styled.div`
  padding: 0.5rem; /* p-2 */
  border-bottom: 1px solid #e5e7eb; /* divide-y */
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0.5rem 0; /* py-2 */
`;

const BalDataList: React.FC<Props> = ({
  title = 'Summary',
  children,
}) => {
  return (
    <Container>
      <Header>{title}</Header>
      <Content>{children}</Content>
    </Container>
  );
};

export default BalDataList;
