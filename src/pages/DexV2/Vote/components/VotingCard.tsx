import React from 'react'
import styled from 'styled-components'

interface LockCardProps {
  lockNumber: string
  amount: string
  percentage: string
  poolSelected: boolean
  poolNumber: number
  imageUrl: string
  lockImageUrl: string
}

interface PoolIndicatorProps {
  number: number
  active: boolean
}

const PoolIndicator: React.FC<PoolIndicatorProps> = ({ number, active }) => {
  return (
    <IndicatorWrapper>
      <IndicatorCircle active={active}>{number}</IndicatorCircle>
    </IndicatorWrapper>
  )
}

const LockCard: React.FC<LockCardProps> = ({
  lockNumber,
  amount,
  percentage,
  poolSelected,
  poolNumber,
  imageUrl,
  lockImageUrl,
}) => {
  return (
    <Card>
      <CardContent>
        <LockInfo>
          <ImageWrapper>
            <Avatar src={imageUrl} alt="Lock avatar" />
          </ImageWrapper>
          <LockDetails>
            <LockHeader>
              <LockTitle>Lock #{lockNumber}</LockTitle>
              <LockIcon src={lockImageUrl} alt="Lock icon" />
            </LockHeader>
            <LockDuration>{amount} IXS Locked for 4 years</LockDuration>
          </LockDetails>
        </LockInfo>
        <StatusInfo>
          <Percentage>{percentage}%</Percentage>
          <PoolStatus>
            <PoolText poolSelected={poolSelected}>Pool Selected</PoolText>
            <PoolIndicator number={poolNumber} active={poolSelected} />
          </PoolStatus>
        </StatusInfo>
      </CardContent>
    </Card>
  )
}

const VoteButton: React.FC = () => {
  return <StyledButton>Vote</StyledButton>
}

export const VotingCard = () => {
  return (
    <Container>
      <Wrapper>
        <ContentLayout>
          <LockCard
            lockNumber="63492"
            amount="0.0048"
            percentage="100.0"
            poolSelected={true}
            poolNumber={1}
            imageUrl="https://cdn.builder.io/api/v1/image/assets/2fee40ad791a4d8d9f5a8c7717832989/1d10ed749d0d7e12072633f75ab828346dc6d163?placeholderIfAbsent=true"
            lockImageUrl="https://cdn.builder.io/api/v1/image/assets/2fee40ad791a4d8d9f5a8c7717832989/43a1086188e23c0f12daa0de44a714f634bae2f3?placeholderIfAbsent=true"
          />
          <LockCard
            lockNumber="65129"
            amount="0.0048"
            percentage="100.0"
            poolSelected={false}
            poolNumber={0}
            imageUrl="https://cdn.builder.io/api/v1/image/assets/2fee40ad791a4d8d9f5a8c7717832989/1d10ed749d0d7e12072633f75ab828346dc6d163?placeholderIfAbsent=true"
            lockImageUrl="https://cdn.builder.io/api/v1/image/assets/2fee40ad791a4d8d9f5a8c7717832989/43a1086188e23c0f12daa0de44a714f634bae2f3?placeholderIfAbsent=true"
          />
          <VoteButton />
        </ContentLayout>
      </Wrapper>
    </Container>
  )
}

const Container = styled.section`
  border-radius: 16px;
  background-color: rgba(255, 255, 255, 1);
  box-shadow: 0px 30px 48px rgba(63, 63, 132, 0.05);
  display: flex;
  padding: 48px;
  flex-direction: column;
  align-items: stretch;
  justify-content: center;
  max-width: 1180px;
  margin: 0 auto;

  @media (max-width: 991px) {
    padding: 20px;
  }
`

const Wrapper = styled.div`
  width: 100%;
  @media (max-width: 991px) {
    max-width: 100%;
  }
`

const ContentLayout = styled.div`
  display: flex;
  width: 100%;
  align-items: start;
  gap: 16px;
  justify-content: start;
  flex-wrap: wrap;

  @media (max-width: 991px) {
    max-width: 100%;
  }
`

const Card = styled.article`
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 1);
  border: 1px solid rgba(230, 230, 255, 1);
  display: flex;
  min-width: 240px;
  padding: 16px;
  align-items: start;
  gap: 6px;
  justify-content: start;
  flex: 1;
  flex-basis: 0%;

  @media (max-width: 991px) {
    max-width: 100%;
  }
`

const CardContent = styled.div`
  display: flex;
  min-width: 240px;
  width: 100%;
  align-items: center;
  gap: 40px 90px;
  justify-content: space-between;
  flex: 1;

  @media (max-width: 991px) {
    max-width: 100%;
  }
`

const LockInfo = styled.div`
  align-self: stretch;
  display: flex;
  min-width: 240px;
  margin: auto 0;
  align-items: center;
  gap: 12px;
`

const ImageWrapper = styled.div`
  align-self: stretch;
  display: flex;
  margin: auto 0;
  align-items: center;
  gap: -8px;
  width: 40px;
`

const Avatar = styled.img`
  aspect-ratio: 1;
  object-fit: contain;
  object-position: center;
  width: 40px;
  border-radius: 50%;
  align-self: stretch;
  margin: auto 0;
`

const LockDetails = styled.div`
  align-self: stretch;
  margin: auto 0;
  font-family: Inter, -apple-system, Roboto, Helvetica, sans-serif;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: -0.42px;
  width: 191px;
`

const LockHeader = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  gap: 6px;
  color: rgba(41, 41, 51, 1);
`

const LockTitle = styled.h3`
  align-self: stretch;
  margin: auto 0;
`

const LockIcon = styled.img`
  aspect-ratio: 0.75;
  object-fit: contain;
  object-position: center;
  width: 9px;
  align-self: stretch;
  margin: auto 0;
  flex-shrink: 0;
`

const LockDuration = styled.p`
  color: rgba(184, 184, 210, 1);
  margin-top: 6px;
`

const StatusInfo = styled.div`
  align-self: stretch;
  display: flex;
  margin: auto 0;
  flex-direction: column;
  align-items: flex-end;
  font-family: Inter, -apple-system, Roboto, Helvetica, sans-serif;
  font-weight: 500;
`

const Percentage = styled.div`
  color: rgba(41, 41, 51, 1);
  font-size: 14px;
  letter-spacing: -0.42px;
  text-align: right;
`

const PoolStatus = styled.div`
  display: flex;
  margin-top: 6px;
  align-items: center;
  gap: 6px;
`

const PoolText = styled.p<{ poolSelected: boolean }>`
  color: ${(props) => (props.poolSelected ? 'rgba(102, 102, 255, 1)' : 'rgba(184, 184, 210, 1)')};
  font-size: 14px;
  letter-spacing: -0.42px;
  text-align: right;
  align-self: stretch;
  margin: auto 0;
`

const IndicatorWrapper = styled.div`
  align-self: stretch;
  margin: auto 0;
  font-size: 11px;
  color: rgba(255, 255, 255, 1);
  white-space: nowrap;
  letter-spacing: -0.33px;
  width: 16px;

  @media (max-width: 991px) {
    white-space: initial;
  }
`

const IndicatorCircle = styled.div<{ active: boolean }>`
  background-color: ${(props) => (props.active ? 'rgba(102, 102, 255, 1)' : 'rgba(184, 184, 210, 1)')};
  border-radius: 50%;
  padding: 0 2px;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 991px) {
    white-space: initial;
  }
`

const StyledButton = styled.button`
  align-self: stretch;
  border-radius: 8px;
  background-color: rgba(102, 102, 255, 1);
  min-height: 72px;
  padding: 28px 16px;
  font-family: Inter, -apple-system, Roboto, Helvetica, sans-serif;
  font-size: 14px;
  color: rgba(255, 255, 255, 1);
  font-weight: 600;
  white-space: nowrap;
  letter-spacing: -0.28px;
  width: 100px;
  border: none;
  cursor: pointer;

  @media (max-width: 991px) {
    white-space: initial;
  }
`

export default VotingCard
