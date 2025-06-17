import React from 'react'
import { Flex } from 'rebass'
import styled from 'styled-components'

import { ReactComponent as AlertIcon } from 'assets/images/icons/alert.svg'

const CountriesBlockAlert: React.FC = () => {
  return (
    <Container>
      <Flex flexDirection={['column', 'row']} alignItems={'center'} style={{ gap: 8 }}>
        <AlertIcon />
        <div>
          Our service is currently unavailable to citizens of the United States, North Korea, Myanmar (formerly Burma),
          Iran, and Singapore.
        </div>
      </Flex>
    </Container>
  )
}

export default CountriesBlockAlert

const Container = styled.div`
  border-radius: 8px;
  border: 1px solid rgba(255, 168, 0, 0.5);
  background: rgba(255, 168, 0, 0.1);
  display: flex;
  padding: 12px 16px;
  justify-content: space-between;
  align-items: center;
  align-self: stretch;
  color: #e0a83d;
  text-align: center;
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 160%; /* 22.4px */
  letter-spacing: -0.28px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 8px;
  }
`
