import React from 'react'
import { Box, Flex } from 'rebass'
import styled, { keyframes } from 'styled-components'

interface PendingProps {
  title: string
  message: string
  explorerLink?: string
}

// 1) Define a 360° rotation
const rotate360 = keyframes`
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
`

// 2) Wrap your SVG in a styled component
const RotatingIcon = styled.svg`
  width: 22px;
  height: 22px;
  animation: ${rotate360} 2s linear infinite;
`

const PendingContent: React.FC<PendingProps> = ({ title, message, explorerLink }) => {
  return (
    <Flex className="toastify-body">
      <Box mr="12px">
        <RotatingIcon viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M11 21C16.5228 21 21 16.5228 21 11C21 5.47715 16.5228 1 11 1C5.47715 1 1 5.47715 1 11C1 16.5228 5.47715 21 11 21Z"
            stroke="#6666FF"
            strokeWidth="1.5"
          />
          <path
            d="M15.5829 8.66667C14.8095 7.09697 13.043 6 10.9876 6C8.38854 6 6.25148 7.75408 6 10"
            stroke="#6666FF"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M13.4941 8.72222H15.4003C15.7317 8.72222 16.0003 8.45359 16.0003 8.12222V6.5"
            stroke="#6666FF"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M6.41797 12.6667C7.19144 14.6288 8.95788 16 11.0133 16C13.6124 16 15.7494 13.8074 16.0009 11"
            stroke="#6666FF"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M8.50618 12.6221H6.6C6.26863 12.6221 6 12.8908 6 13.2221V15.3999"
            stroke="#6666FF"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </RotatingIcon>
      </Box>
      <Flex flexDirection={'column'}>
        <Title>{title}</Title>
        <Message>{message}</Message>
        {explorerLink ? (
          <ViewOnScan href={explorerLink} target="_blank">
            View on Explore
          </ViewOnScan>
        ) : null}
      </Flex>
    </Flex>
  )
}

export default PendingContent

const Title = styled.div`
  color: #292933;
  font-family: Inter;
  font-size: 15px;
  font-style: normal;
  font-weight: 500;
  line-height: 150%; /* 22.5px */
  letter-spacing: -0.3px;
`

const Message = styled.div`
  color: #666680;
  font-family: Inter;
  font-size: 15px;
  font-style: normal;
  font-weight: 400;
  line-height: 150%;
  letter-spacing: -0.3px;
`

const ViewOnScan = styled.a`
  color: #66f;
  font-family: Inter;
  font-size: 15px;
  font-style: normal;
  font-weight: 400;
  line-height: 150%;
  letter-spacing: -0.3px;
  text-decoration: none;
`
