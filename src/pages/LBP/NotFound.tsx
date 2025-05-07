import React from 'react'
import styled from 'styled-components'

import OopsImg from 'assets/images/oops.png'
import { useWhitelabelState } from 'state/whitelabel/hooks'

const NotFound: React.FC = () => {
  const { config } = useWhitelabelState()
  const supportEmail = config?.supportEmail || 'c@ixs.finance'

  return (
    <Container>
      <img src={OopsImg} alt="Oops" />

      <Title>Oops</Title>

      <Description>
        We&apos;re sorry, but it looks like something went wrong on our end. Please try refreshing the page or come back
        later. If the problem persists, feel free to contact{' '}
        <a href={`mailto:${supportEmail}`} style={{ textDecoration: 'none', color: '#6666FF' }}>
          {supportEmail}
        </a>{' '}
        for assistance. Thank you for your patience.
      </Description>
    </Container>
  )
}

export default NotFound

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: calc(100vh - 200px);
`

const Title = styled.h1`
  color: #292933;
  text-align: center;
  font-family: Inter;
  font-size: 48px;
  font-style: normal;
  font-weight: 700;
  line-height: 100%; /* 48px */
  letter-spacing: -1.44px;
`

const Description = styled.p`
  color: #666680;
  text-align: center;
  font-family: Inter;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: 160%; /* 25.6px */
  letter-spacing: -0.32px;
  max-width: 466px;
`
