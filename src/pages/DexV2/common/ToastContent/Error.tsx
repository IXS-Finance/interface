import React from 'react'
import { Box, Flex } from 'rebass'
import styled from 'styled-components'

interface ErrorProps {
  title: string
  message: string
  explorerLink?: string
}

const ErrorContent: React.FC<ErrorProps> = ({ title, message, explorerLink }) => {
  return (
    <Flex className="toastify-body">
      <Box mr="12px">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22" fill="none">
          <path
            d="M8.17188 13.8285L11.0003 11.0001M11.0003 11.0001L13.8287 8.17163M11.0003 11.0001L8.17188 8.17163M11.0003 11.0001L13.8287 13.8285"
            stroke="#FF6565"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M11 21C16.5228 21 21 16.5228 21 11C21 5.47715 16.5228 1 11 1C5.47715 1 1 5.47715 1 11C1 16.5228 5.47715 21 11 21Z"
            stroke="#FF6565"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
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

export default ErrorContent

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
