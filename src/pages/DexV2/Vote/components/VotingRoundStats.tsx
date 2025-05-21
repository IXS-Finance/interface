import React from 'react'
import styled from 'styled-components'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'

import useNumbers from 'hooks/dex-v2/useNumbers'

import timerImg from 'assets/images/dex-v2/timer.svg'
import Countdown, { renderer } from 'components/Countdown'
import LoadingBlock from 'pages/DexV2/common/LoadingBlock'

dayjs.extend(duration)
interface VotingRoundStatsProps {
  epochVoteEnd: number
  totalSupply: number | string
  availableDeposit: number | string
  isLoading: boolean
  totalFees: number | string
  totalIncentives: number | string
  totalRewards: number | string
}

export const VotingRoundStats: React.FC<VotingRoundStatsProps> = ({
  epochVoteEnd,
  totalSupply,
  availableDeposit,
  totalFees,
  totalIncentives,
  totalRewards,
  isLoading = false,
}) => {
  const { fNum } = useNumbers()

  const statistics = [
    { label: 'Total Voting Power', value: fNum(totalSupply, { abbreviate: true }) },
    { label: 'Total Fees', value: fNum(totalFees, { style: 'currency', currency: 'USD', fixedFormat: true }) },
    {
      label: 'Total Incentives',
      value: fNum(totalIncentives, { style: 'currency', currency: 'USD', fixedFormat: true }),
    },
    { label: 'Total Rewards', value: fNum(totalRewards, { style: 'currency', currency: 'USD', fixedFormat: true }) },
    { label: 'New Emissions', value: `${Number(availableDeposit).toLocaleString()} IXS` },
  ]

  const filteredStatistics = statistics.filter(
    (stat) => !(stat.label === 'Total Incentives' && Number(totalIncentives) === 0)
  )

  return (
    <MainContainer>
      <HeaderContainer>
        <InfoSection>
          <Title>Current Voting Round</Title>
          <Description>
            Voters earn a share of transaction fees and incentives for helping govern how emissions are distributed.
          </Description>
        </InfoSection>
        {!isLoading ? (
          <TimerSection>
            <TimerLabel>
              <TimerIcon src={timerImg} alt="Timer icon" />
              <span>Ends in</span>
            </TimerLabel>
            <TimeValue>
              {epochVoteEnd ? <Countdown date={new Date(epochVoteEnd * 1000)} renderer={renderer} /> : '00 : 00 : 00'}
            </TimeValue>
          </TimerSection>
        ) : (
          <LoadingBlock style={{ width: '220px', height: '80px' }} />
        )}
      </HeaderContainer>
      <Divider />
      <StatsContainer>
        <StatsGrid>
          {filteredStatistics.map((stat, index) => (
            <CardWrapper key={index}>
              <StatLabel>{stat.label}</StatLabel>
              <StatValue>{stat.value}</StatValue>
            </CardWrapper>
          ))}
        </StatsGrid>
      </StatsContainer>
    </MainContainer>
  )
}

const MainContainer = styled.div`
  border-radius: 16px;
  background-color: rgba(255, 255, 255, 1);
  box-shadow: 0px 30px 48px rgba(63, 63, 132, 0.05);
  padding: 48px;
  font-family: Inter, -apple-system, Roboto, Helvetica, sans-serif;
  width: 1180px;
  margin: 0 auto;

  @media (max-width: 991px) {
    padding: 20px;
  }
`

const HeaderContainer = styled.header`
  display: flex;
  width: 100%;
  align-items: start;
  gap: 40px 100px;
  justify-content: space-between;
  flex-wrap: wrap;
  @media (max-width: 991px) {
    max-width: 100%;
  }
`

const InfoSection = styled.section`
  min-width: 240px;
  min-height: 80px;
  font-size: 18px;
  width: 453px;
  @media (max-width: 991px) {
    max-width: 100%;
  }
`

const Title = styled.h1`
  color: rgba(41, 41, 51, 1);
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: -0.54px;
  @media (max-width: 991px) {
    max-width: 100%;
  }
`

const Description = styled.p`
  color: #292933;
  font-weight: 400;
  line-height: 27px;
  letter-spacing: -0.36px;
  margin-top: 4px;
  @media (max-width: 991px) {
    max-width: 100%;
  }
`

const TimerSection = styled.aside`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: start;
`

const TimerLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: rgba(184, 184, 210, 1);
  font-weight: 500;
  text-align: right;
  letter-spacing: -0.42px;
  justify-content: end;
`

const TimerIcon = styled.img`
  aspect-ratio: 1;
  object-fit: contain;
  object-position: center;
  width: 16px;
  align-self: stretch;
  margin: auto 0;
  flex-shrink: 0;
`

const TimeValue = styled.div`
  color: rgba(41, 41, 51, 1);
  font-size: 48px;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -1.44px;
  @media (max-width: 991px) {
    font-size: 40px;
  }
`

const Divider = styled.hr`
  background-color: rgba(240, 240, 255, 1);
  height: 1px;
  margin: 48px 0;
  border: none;
  width: 100%;
  @media (max-width: 991px) {
    margin: 40px 0;
    max-width: 100%;
  }
`

const StatsContainer = styled.section`
  margin-top: 48px;
  width: 100%;
  @media (max-width: 991px) {
    max-width: 100%;
    margin-top: 40px;
  }
`

const StatsGrid = styled.div`
  display: flex;
  width: 100%;
  align-items: start;
  gap: 16px;
  justify-content: start;
  align-self: stretch;

  @media (max-width: 991px) {
    max-width: 100%;
    flex-wrap: wrap;
  }
`

const CardWrapper = styled.div`
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 1);
  border: 1px solid rgba(230, 230, 255, 1);
  padding: 16px;
  width: 100%;
`

const StatLabel = styled.div`
  color: rgba(184, 184, 210, 1);
  font-size: 14px;
  font-weight: 500;
  letter-spacing: -0.42px;
`

const StatValue = styled.div`
  color: rgba(41, 41, 51, 1);
  font-size: 18px;
  font-weight: 600;
  letter-spacing: -0.54px;
  margin-top: 6px;
`

export default VotingRoundStats
