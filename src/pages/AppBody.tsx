import React from 'react'
import { useCookies } from 'react-cookie'
import styled from 'styled-components/macro'

import { isMobile } from 'react-device-detect'
import Box from '@mui/material/Box'
import { useWeb3React } from 'hooks/useWeb3React'
import ConnectWalletCard from 'components/NotAvailablePage/ConnectWalletCard'
import FeatureNotSupported from 'components/FeatureNotSupported'

export const BodyWrapper = styled(Box)<{
  margin?: string
  padding?: string
  paddingXS?: string
  maxWidth?: string
  transparent?: boolean
  blurred?: boolean
  hasAnnouncement?: boolean
}>`
  position: relative;
  margin-top: ${({ margin }) => margin ?? '0px'};
  max-width: ${({ maxWidth }) => maxWidth ?? '592px'};
  width: 100%;
  background: ${({ theme }) => theme.bg0};
  // box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
  //   0px 24px 32px rgba(0, 0, 0, 0.01);
  border-radius: 8px;
  margin-top: ${({ hasAnnouncement }) => (hasAnnouncement ? '3rem' : '1rem')};
  padding: ${({ padding, blurred }) => (blurred ? '0px' : padding ?? '40px')};
  ${({ theme, paddingXS, blurred }) =>
    !blurred &&
    theme.mediaWidth.upToExtraSmall`
      padding: ${paddingXS ?? '1rem 0.7rem'};
  `};
  z-index: 1;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    margin-top: 1rem;
  `};

  /* Media Query for Mobile */
  // @media (max-width: 768px) {
  //   padding-bottom: 20px;
  // }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    // padding: 40px;
  `};

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    // padding: 40px;
  `};
`
export const BlurredOverlay = styled.div`
  width: 100%;
  display: flex;
  text-align: center;
  vertical-align: center;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(10px);
  background: ${({ theme }) => theme.bgG16};
  border-radius: 30px;
`

/**
 * The styled container element that wraps the content of most pages and the tabs.
 */
export default function AppBody({
  children,
  blurred,
  ...rest
}: {
  children: React.ReactNode
  blurred?: boolean
  transparent?: boolean
  maxWidth?: string
  page?: string
  style?: React.CSSProperties
}) {
  const { account } = useWeb3React()
  const [cookies] = useCookies(['annoucementsSeen'])

  if (!account) {
    return <ConnectWalletCard />
  }

  if (blurred) {
    return <FeatureNotSupported />
  }

  return (
    <React.Fragment>
      <BodyWrapper
        style={{
          marginTop: isMobile ? '120px' : '10px',
        }}
        {...rest}
        hasAnnouncement={!cookies.annoucementsSeen}
        blurred={blurred}
        paddingXS="12px"
      >
        {!blurred && children}
      </BodyWrapper>
    </React.Fragment>
  )
}
