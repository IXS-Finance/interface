import styled, { css } from 'styled-components'
import { Box, Flex } from 'rebass'
import React from 'react'
import { t } from '@lingui/macro'
import StickyBox from 'react-sticky-box'

import Card from 'components/Card'
import { cardCommonStyles } from 'pages/CustodianV2/styleds'
import { LoaderThin } from 'components/Loader/LoaderThin'
import { Input } from 'components/Input'

import { KYCStatuses } from './enum'
import { ReactComponent as Attention } from 'assets/images/attention.svg'
import { ReactComponent as Passed } from 'assets/images/newRightCheck.svg'
import { ReactComponent as NonTradable } from 'assets/images/newReject.svg'
import { ReactComponent as Pending } from 'assets/images/newPending.svg'
import { ReactComponent as BigPassed } from 'assets/images/check-success-big.svg'
import { ReactComponent as AttentionIcon } from 'assets/images/attentionIcon.svg'

export const StatusCard = styled(Card)`
  display: flex;
  flex-direction: column; /* Change the flex direction to column */
  align-items: center; /* Center items vertically */
  justify-content: center;
  background: ${({ theme }) => theme.config.background?.secondary || theme.bg0};
  width: 100%;
  min-height: 630px;
  padding-bottom: 100px;
  ${cardCommonStyles};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    height: 100%;
    margin-top: 30px;
  `};
`

export const Content = styled(Flex)`
  width: 100%;
  max-width: 580px;
`

export const KYCStatusCard = styled(Card)`
  width: fit-content;
  display: flex;
  align-items: center;
  border-radius: 6px;
  padding: 8px 20px;
  // background: ${({ theme }) => theme.bgG13};
  border: 1px solid #e6e6ff;

  ${cardCommonStyles};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-direction: row;
     padding: 8px 6px;
  `};
`

export const Grid = styled(Box)`
  display: grid;
  grid-template-columns: 1fr 300px;
  grid-gap: 35px;
`

export const FormWrapper = styled.form`
  gap: 35px;

  &::-webkit-scrollbar {
    display: none;
  }
`

export const FormCard = styled.div<{ filled?: boolean }>`
  background: ${({ theme }) => theme.bg0};
  padding: 32px;
  border-radius: 16px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 16px;
  `};
`

export const Ul = styled.ul`
  list-style: none;
`

export const Li = styled.li`
  display: flex;
  align-items: center;

  &:before {
    content: '•';
    color: ${({ theme }) => theme.text2};
    display: inline-block;
    width: 1em;
    margin-left: -1em;
  }
`

export const PageLink = styled.div<{ active?: boolean }>`
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 4px 0px;
  padding: 8px 16px 8px 24px;
  color: ${({ theme, active }) => (active ? theme.text1 : theme.text11)};
  text-decoration: none;
`

export const FormGrid = styled.div<{ columns?: number }>`
  display: grid;
  grid-template-columns: ${({ columns }) => `repeat(${columns || 2}, 1fr)`};
  grid-gap: 20px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    grid-template-columns: 1fr;
  `};
`

export const ExtraInfoCard = styled.div`
  padding: 12px 8px 12px 27px;
  border-radius: 8px;
  background: ${({ theme }) => theme.bg2};
`
export const ExtraInfoCardCountry = styled.div`
  padding: 12px 8px 12px 27px;
  border-radius: 8px;
  background: ${({ theme }) => theme.bg0};
  border: 1px solid #e6e6ff;
`

export const StyledInput = styled(Input)`
  background: ${({ theme }) => theme.bg19};
  color: ${({ theme }) => theme.text2};
`

export const UploaderCard = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 120px;
  width: 100%;
  background: ${({ theme }) => theme.bg0};
  border: 1px solid #e6e6ff;
  border-radius: 8px;
  cursor: pointer;
`

export const SelfieUploaderCard = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
  width: 100%;
  background: ${({ theme }) => theme.bg0};
  border: 1px solid #e6e6ff;
  border-radius: 8px;
  cursor: pointer;
`

export const StyledStickyBox = styled(StickyBox).attrs(() => ({ offsetTop: 100 }))`
  width: 296px;
  max-width: 296px;
  min-width: 296px;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    width: 100%;
    max-width: 100%;
    min-width: 100%;
  `};
`

export const BeneficialOwnersTableContainer = styled.div`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: none;
  `};
`

// const RejectedIcon = styled(NonTradable)`
//   ${({ theme }) =>
//     theme.config.elements?.main &&
//     css`
//       circle {
//         fill: ${theme.config.elements?.main};
//       }
//       path {
//         fill: white;
//       }
//     `}
// `
// const AttentionIcon = styled(Attention)`
//   ${({ theme }) =>
//     theme.config.elements?.main &&
//     css`
//       > circle[fill='#FF6161'] {
//         fill: ${theme.error};
//       }
//       > circle[stroke='#FF6161'] {
//         stroke: ${theme.error};
//       }
//       line {
//         stroke: ${theme.error};
//       }
//       > circle[fill='#372E5E'] {
//         fill: ${theme.config.elements?.main};
//       }
//     `}
// `

export const PassedIcon = styled(Passed)`
  ${({ theme }) =>
    theme.config.elements?.main &&
    css`
      > path {
        fill: ${theme.success};
      }
      > circle {
        fill: ${theme.config.elements?.main};
      }
    `}
`

export const StyledBigPassed = styled(BigPassed)`
  ${({ theme }) =>
    theme.config.elements?.main &&
    css`
      > path {
        fill: ${theme.success};
      }
      > circle {
        fill: ${theme.config.elements?.main};
      }
    `}
`

/* eslint-disable react/display-name */
export const KYCStatusIcons = {
  [KYCStatuses.PENDING]: () => <Pending />,
  [KYCStatuses.APPROVED]: () => <PassedIcon />,
  [KYCStatuses.NOT_SUBMITTED]: () => null,
  [KYCStatuses.CHANGES_REQUESTED]: () => <AttentionIcon />,
  [KYCStatuses.REJECTED]: () => <NonTradable />,
  [KYCStatuses.DRAFT]: () => null,
  [KYCStatuses.IN_PROGRESS]: () => <Pending />,
  [KYCStatuses.FAILED]: () => <NonTradable />,
}

const KYCStatusText = {
  [KYCStatuses.PENDING]: `Pending approval`,
  [KYCStatuses.APPROVED]: `Approved`,
  [KYCStatuses.NOT_SUBMITTED]: `Not submitted`,
  [KYCStatuses.CHANGES_REQUESTED]: `Changes Requested`,
  [KYCStatuses.REJECTED]: `Rejected`,
  [KYCStatuses.DRAFT]: `Draft Saved`,
  [KYCStatuses.IN_PROGRESS]: `Pending approval`,
  [KYCStatuses.FAILED]: `FAILED`,
}

const KYCStatusColors = {
  [KYCStatuses.PENDING]: 'text2',
  [KYCStatuses.APPROVED]: 'green1',
  [KYCStatuses.NOT_SUBMITTED]: 'error',
  [KYCStatuses.CHANGES_REQUESTED]: 'text1',
  [KYCStatuses.REJECTED]: 'error',
  [KYCStatuses.DRAFT]: 'text2',
  [KYCStatuses.IN_PROGRESS]: 'text2',
  [KYCStatuses.FAILED]: 'error',
}

const KYCStatusDescription = {
  [KYCStatuses.PENDING]:
    'Your KYC application has been received and will be processed by the team. Thank you for your patience.',
  [KYCStatuses.APPROVED]: null,
  [KYCStatuses.NOT_SUBMITTED]: 'To sign up to the IXSwap Platform you have to pass KYC',
  [KYCStatuses.CHANGES_REQUESTED]:
    'Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Donec velit neque, auctor sit amet aliquam vel, ullamcorper sit amet ligula.',
  [KYCStatuses.REJECTED]:
    'Curabitur arcu erat, accumsan id imperdiet et, porttitor at sem. Vivamus suscipit tortor eget felis porttitor volutpat. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Donec velit neque, auctor sit amet aliquam vel, ullamcorper sit amet ligula.',
  [KYCStatuses.DRAFT]: 'Your KYC application draft has been saved',
  [KYCStatuses.FAILED]:
    'We regret to inform you that your KYC verification has been rejected due to incomplete documentation. Please ensure all required documents are provided and meet our specified criteria for successful verification. Thank you for your cooperation.',
  [KYCStatuses.IN_PROGRESS]:
    'Your KYC application has been received and will be processed by the team. Thank you for your patience.',
}

export const getStatusInfo = (status: KYCStatuses) => {
  return { icon: KYCStatusIcons[status], color: KYCStatusColors[status], text: KYCStatusText[status] }
}

export const getStatusDescription = (status: KYCStatuses) => {
  return KYCStatusDescription[status]
}

export const Divider = styled.div`
  height: 1px;
  background-color: ${({ theme: { text2 } }) => `${text2}50`};
  width: 100%;
  opacity: 0.2;
`

export const DateInfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  text-align: center;
  color: ${({ theme: { text9 } }) => text9};
`

export const EligibilityAndDocumentsContainer = styled.div`
  border-radius: 16px;
  border: 1px solid #353840;
  background: #202126;
  display: flex;
  padding: 48px 64px;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  align-self: stretch;
  margin-bottom: 24px;

  .title {
    color: #292933;
    font-family: Inter;
    font-size: 20px;
    font-style: normal;
    font-weight: 600;
    line-height: 130%; /* 26px */
    letter-spacing: -0.6px;
  }

  ul.description {
    list-style-type: disc;
    padding-left: 20px;
    margin-top: 8px;
    padding-bottom: 24px;
    margin-bottom: 24px;
    border-bottom: 1px solid rgba(102, 102, 255, 0.1);

    li {
      color: rgba(255, 255, 255, 0.50);
      font-family: Inter;
      font-size: 14px;
      font-style: normal;
      font-weight: 400;
      line-height: 210%; /* 29.4px */
      letter-spacing: -0.28px;
    }
  }

  .checkbox-container {
    display: flex;
    align-items: center;
    margin-bottom: 16px;

    label.label {
      color: #fff;
      font-family: Inter;
      font-size: 14px;
      font-style: normal;
      font-weight: 400;
      line-height: 210%; /* 29.4px */
      letter-spacing: -0.28px;
      margin-left: 8px;
    }

    input.checkbox {
      width: 16px;
      height: 16px;
      cursor: pointer;
    }
  }
`
