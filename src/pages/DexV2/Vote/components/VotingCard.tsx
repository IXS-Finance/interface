import React, { useEffect } from 'react'
import styled from 'styled-components'
import dayjs from 'dayjs'

import VotingModal from './VoteModal'
import { VeSugar } from 'services/balancer/contracts/VeSugar'
import useWeb3 from 'hooks/dex-v2/useWeb3'
import lockImg from 'assets/images/dex-v2/lockIcon.png'

interface LockCardProps {
  lockNumber: string
  amount: string
  percentage: string
  poolSelected: boolean
  poolNumber: number
  expiresAt: string
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

const LockCard: React.FC<LockCardProps> = ({ lockNumber, amount, percentage, poolSelected, poolNumber, expiresAt }) => {
  let lockDuration = dayjs.unix(Number(expiresAt)).diff(dayjs(), 'year')
  let lockMessage = `${amount} IXS Locked for ${lockDuration} years`
  if (lockDuration === 0) {
    lockDuration = dayjs.unix(Number(expiresAt)).diff(dayjs(), 'day')
    lockMessage = `${amount} IXS Locked for ${lockDuration} days`
  }
  return (
    <Card>
      <CardContent>
        <LockInfo>
          <ImageWrapper>
            <Avatar src={lockImg} alt="Lock avatar" />
          </ImageWrapper>
          <LockDetails>
            <LockHeader>
              <LockTitle>Lock #{lockNumber}</LockTitle>
              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="15" viewBox="0 0 11 15" fill="none">
                <path
                  d="M8.5 7.5H9.55C9.79855 7.5 10 7.70145 10 7.95V13.05C10 13.2985 9.79855 13.5 9.55 13.5H1.45C1.20147 13.5 1 13.2985 1 13.05V7.95C1 7.70145 1.20147 7.5 1.45 7.5H2.5M8.5 7.5V4.5C8.5 3.5 7.9 1.5 5.5 1.5C3.1 1.5 2.5 3.5 2.5 4.5V7.5M8.5 7.5H2.5"
                  stroke="#B8B8D2"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </LockHeader>
            <LockDuration>{lockMessage}</LockDuration>
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

export const VotingCard = () => {
  const veSugar = new VeSugar()
  const { account } = useWeb3()
  const [lockedList, setLockedList] = React.useState<any[]>([])

  useEffect(() => {
    if (account) {
      veSugar.byAccount(account).then((data) => {
        setLockedList(data)
      })
    }
  }, [account])

  console.log('Locked List:', lockedList)
  return (
    <Container>
      <Wrapper>
        <ContentLayout>
          {lockedList.map((lock) => (
            <LockCard
              key={lock.id}
              lockNumber={lock.id}
              amount={lock.amount}
              expiresAt={lock.expiresAt}
              percentage="100.0"
              poolSelected={true}
              poolNumber={1}
            />
          ))}

          <StyledButton>Vote</StyledButton>
        </ContentLayout>
      </Wrapper>

      <VotingModal isVisible={false} onClose={() => {}} onSuccess={() => {}} />
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
