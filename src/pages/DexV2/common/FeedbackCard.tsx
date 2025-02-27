import React from 'react'
import styled from 'styled-components'
import { Flex } from 'rebass'
import BalBtn from './popovers/BalBtn'

interface FeedbackCardProps extends React.HTMLAttributes<HTMLDivElement> {}

const Container = styled.div`
  padding: 0.5rem; /* p-2 */
  background-color: #f3f4f6;
  border-radius: 0.5rem; /* rounded-lg */
`

const HStack = styled(Flex)`
  display: flex;
  flex-direction: row;
  align-items: center;
`

const Label = styled.span`
  font-size: 0.75rem; /* text-xs */
  font-weight: 700; /* font-bold */
`

const FeedbackCard: React.FC<FeedbackCardProps> = () => {
  return (
    <Container>
      <HStack justifyContent="space-between" alignItems="center">
        <HStack alignItems="center" mr="0.5rem">
          <svg
            viewBox="0 0 24 24"
            width="24"
            height="24"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
          </svg>
          <Label>How did we do?</Label>
        </HStack>
        <BalBtn size="xs" color="white">
          Give feedback
        </BalBtn>
      </HStack>
    </Container>
  )
}

export default FeedbackCard
