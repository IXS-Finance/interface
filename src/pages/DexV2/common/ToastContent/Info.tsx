import React from 'react'
import { Box, Flex } from 'rebass'
import styled from 'styled-components'

interface InfoProps {
  title: string
  message: string
  explorerLink?: string
}

const InfoContent: React.FC<InfoProps> = ({ title, message, explorerLink }) => {
  return (
    <Flex className="toastify-body">
      <Box mr="12px">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22" fill="none">
          <path d="M11 10.5V15.5" stroke="#6666FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path
            d="M11 6.51013L11.01 6.49902"
            stroke="#6666FF"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M11 21C16.5228 21 21 16.5228 21 11C21 5.47715 16.5228 1 11 1C5.47715 1 1 5.47715 1 11C1 16.5228 5.47715 21 11 21Z"
            stroke="#6666FF"
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

export default InfoContent

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
