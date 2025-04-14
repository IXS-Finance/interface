import React from 'react'
import styled from 'styled-components'
import Portal from '@reach/portal'

import { ReactComponent as CrossIcon } from 'assets/launchpad/svg/close.svg'

interface VotingPoolProps {
  poolName: string
  poolType: string
  fee: string
  votingApr: string
  votes: string
  estRewards: string
  votingPower: string
  percentage: number
  logoUrl: string
  infoIconUrl: string
  aprIconUrl: string
}

interface VotingPowerControlProps {
  votingPower: string
  percentage: number
}

const VotingPowerControl: React.FC<VotingPowerControlProps> = ({ votingPower, percentage }) => {
  return (
    <PowerControlContainer>
      <PowerControlHeader>
        <InfoSection>
          <PowerLabel>Voting Power</PowerLabel>
          <PowerValue>{votingPower}</PowerValue>
        </InfoSection>
        <PercentageBox>
          <PercentageValue>{percentage}</PercentageValue>
          <PercentageSymbol>%</PercentageSymbol>
        </PercentageBox>
      </PowerControlHeader>

      <Divider />

      <PercentageControls>
        <PercentageButton active={percentage === 0} />
        <PercentageButton active={percentage === 25}>25%</PercentageButton>
        <PercentageButton active={percentage === 50}>50%</PercentageButton>
        <PercentageButton active={percentage === 75}>75%</PercentageButton>
        <PercentageButton active={percentage === 100}>100%</PercentageButton>
      </PercentageControls>
    </PowerControlContainer>
  )
}

const VotingPool: React.FC<VotingPoolProps> = ({
  poolName,
  poolType,
  fee,
  votingApr,
  votes,
  estRewards,
  votingPower,
  percentage,
  logoUrl,
  infoIconUrl,
  aprIconUrl,
}) => {
  return (
    <PoolContainer>
      <PoolInfo>
        <PoolHeader>
          <PoolLogo src={logoUrl} alt={poolName} />
          <PoolDetails>
            <PoolName>{poolName}</PoolName>
            <PoolTypeRow>
              <PoolType>{poolType}</PoolType>
              <PoolFee>{fee}</PoolFee>
              <InfoIcon src={infoIconUrl} alt="Info" />
            </PoolTypeRow>
          </PoolDetails>
        </PoolHeader>
      </PoolInfo>

      <MetricsContainer>
        <MetricBox>
          <MetricLabel>Voting APR</MetricLabel>
          <MetricValueRow>
            <MetricValue>{votingApr}</MetricValue>
            <MetricIcon src={aprIconUrl} alt="APR Info" />
          </MetricValueRow>
          <Divider />
          <MetricFooter>{`Votes ${votes}`}</MetricFooter>
        </MetricBox>

        <MetricBox>
          <MetricLabel>Est. Rewards</MetricLabel>
          <MetricValue>{estRewards}</MetricValue>
          <Divider />
          <MetricFooter>{`Out of ${votes}`}</MetricFooter>
        </MetricBox>

        <VotingPowerControl votingPower={votingPower} percentage={percentage} />
      </MetricsContainer>
    </PoolContainer>
  )
}

const LockHeader: React.FC = () => {
  return (
    <HeaderContainer>
      <HeaderContent>
        <LockInfo>
          <LogoWrapper>
            <Logo
              src="https://cdn.builder.io/api/v1/image/assets/2fee40ad791a4d8d9f5a8c7717832989/1d10ed749d0d7e12072633f75ab828346dc6d163?placeholderIfAbsent=true"
              alt="Lock logo"
            />
          </LogoWrapper>
          <InfoContainer>
            <TitleRow>
              <LockTitle>Lock #63492</LockTitle>
              <InfoIcon
                src="https://cdn.builder.io/api/v1/image/assets/2fee40ad791a4d8d9f5a8c7717832989/28e9544cb2b2e21dcbe6c5a47707339645f33a10?placeholderIfAbsent=true"
                alt="Info"
              />
            </TitleRow>
            <LockDetails>0.0048 IXS Locked for 4 years</LockDetails>
            <ActionLinks>
              <ActionLink>Increase</ActionLink>
              <ActionLink>Extend</ActionLink>
              <ActionLink>Clear Votes</ActionLink>
            </ActionLinks>
          </InfoContainer>
        </LockInfo>
        <VotingPowerInfo>
          <PowerLabel>Total Voting Power</PowerLabel>
          <PowerValue>100.0% available</PowerValue>
        </VotingPowerInfo>
      </HeaderContent>
    </HeaderContainer>
  )
}

interface Props {
  isVisible: boolean
  onClose: () => void
  onSuccess: () => void
}

const VotingModal: React.FC<Props> = ({ isVisible, onClose, onSuccess }) => {
  const handleClose = () => {
    onClose()
  }

  const handleSuccess = () => {
    onSuccess()
  }

  if (!isVisible) return null

  return (
    <Portal>
      <ModalBackdrop>
        <ModalContainer>
          <ExitIconContainer onClick={onClose}>
            <CrossIcon />
          </ExitIconContainer>
          <Container>
            <Wrapper>
              <LockHeader />

              <PoolsContainer>
                <VotingPool
                  poolName="IXS - USDC"
                  poolType="Basic Volatile"
                  fee="0.3%"
                  votingApr="107.13%"
                  votes="43,358"
                  estRewards="$0.00"
                  votingPower="0.0 IXS"
                  percentage={100}
                  logoUrl="https://cdn.builder.io/api/v1/image/assets/2fee40ad791a4d8d9f5a8c7717832989/1d10ed749d0d7e12072633f75ab828346dc6d163?placeholderIfAbsent=true"
                  infoIconUrl="https://cdn.builder.io/api/v1/image/assets/2fee40ad791a4d8d9f5a8c7717832989/083be3d4afce0cfe804239349fda6041f639e978?placeholderIfAbsent=true"
                  aprIconUrl="https://cdn.builder.io/api/v1/image/assets/2fee40ad791a4d8d9f5a8c7717832989/386ae92cfc950091d7ed0bb9dc6840ab79dfb144?placeholderIfAbsent=true"
                />

                <VotingPool
                  poolName="OP - USDC"
                  poolType="Basic Volatile"
                  fee="0.3%"
                  votingApr="108.52%"
                  votes="43,358"
                  estRewards="$0.00"
                  votingPower="0.0 IXS"
                  percentage={25}
                  logoUrl="https://cdn.builder.io/api/v1/image/assets/2fee40ad791a4d8d9f5a8c7717832989/1196ea8477397f03efc98814464794f25a9e50db?placeholderIfAbsent=true"
                  infoIconUrl="https://cdn.builder.io/api/v1/image/assets/2fee40ad791a4d8d9f5a8c7717832989/ad9cd43b174e1a9db2bef99f3643e1189528837a?placeholderIfAbsent=true"
                  aprIconUrl="https://cdn.builder.io/api/v1/image/assets/2fee40ad791a4d8d9f5a8c7717832989/cf4ad0aafa86607672a569902f41500cab4526eb?placeholderIfAbsent=true"
                />

                <VotingPool
                  poolName="APT - USDT"
                  poolType="Basic Volatile"
                  fee="0.3%"
                  votingApr="125.18%"
                  votes="43,358"
                  estRewards="$0.00"
                  votingPower="0.0 IXS"
                  percentage={75}
                  logoUrl="https://cdn.builder.io/api/v1/image/assets/2fee40ad791a4d8d9f5a8c7717832989/0aa486b37101b752102b4f6837a4ec1809bbfac1?placeholderIfAbsent=true"
                  infoIconUrl="https://cdn.builder.io/api/v1/image/assets/2fee40ad791a4d8d9f5a8c7717832989/4f8a5d011bae2cdf0738ffa686ee2fdb7df33b75?placeholderIfAbsent=true"
                  aprIconUrl="https://cdn.builder.io/api/v1/image/assets/2fee40ad791a4d8d9f5a8c7717832989/cf4ad0aafa86607672a569902f41500cab4526eb?placeholderIfAbsent=true"
                />
              </PoolsContainer>
            </Wrapper>
          </Container>
        </ModalContainer>
      </ModalBackdrop>
    </Portal>
  )
}

export default VotingModal

// Styled Components
const Container = styled.section`
  padding-left: 40px;
  padding-right: 40px;
  @media (max-width: 991px) {
    padding-left: 20px;
    padding-right: 20px;
  }
`

const Wrapper = styled.div`
  width: 100%;
  @media (max-width: 991px) {
    max-width: 100%;
  }
`

const HeaderContainer = styled.header`
  border-radius: 8px;
  background-color: rgba(247, 247, 250, 1);
  display: flex;
  width: 100%;
  padding: 32px 24px;
  align-items: start;
  gap: 6px;
  @media (max-width: 991px) {
    max-width: 100%;
    padding: 32px 20px;
  }
`

const HeaderContent = styled.div`
  display: flex;
  min-width: 240px;
  width: 100%;
  align-items: center;
  gap: 40px 100px;
  justify-content: space-between;
  flex-wrap: wrap;
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

const LogoWrapper = styled.div`
  align-self: stretch;
  display: flex;
  margin: auto 0;
  align-items: center;
  gap: -8px;
  width: 40px;
`

const Logo = styled.img`
  aspect-ratio: 1;
  object-fit: contain;
  object-position: center;
  width: 40px;
  border-radius: 50%;
  align-self: stretch;
  margin: auto;
`

const InfoContainer = styled.div`
  align-self: stretch;
  margin: auto 0;
  font-family: Inter, -apple-system, Roboto, Helvetica, sans-serif;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: -0.42px;
  width: 202px;
`

const TitleRow = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  gap: 6px;
  color: rgba(41, 41, 51, 1);
`

const LockTitle = styled.h2`
  align-self: stretch;
  margin: auto 0;
  font-size: inherit;
  font-weight: inherit;
`

const InfoIcon = styled.img`
  aspect-ratio: 0.75;
  object-fit: contain;
  object-position: center;
  width: 9px;
  align-self: stretch;
  margin: auto 0;
  flex-shrink: 0;
`

const LockDetails = styled.p`
  color: rgba(184, 184, 210, 1);
  margin-top: 6px;
`

const ActionLinks = styled.div`
  display: flex;
  margin-top: 6px;
  width: 100%;
  align-items: center;
  gap: 6px;
  color: rgba(102, 102, 255, 1);
`

const ActionLink = styled.button`
  align-self: stretch;
  margin: auto 0;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  cursor: pointer;
`

const VotingPowerInfo = styled.div`
  align-self: stretch;
  display: flex;
  margin: auto 0;
  flex-direction: column;
  align-items: flex-end;
  font-family: Inter, -apple-system, Roboto, Helvetica, sans-serif;
`

const PoolsContainer = styled.div`
  display: flex;
  margin-top: 16px;
  width: 100%;
  flex-direction: column;
  gap: 16px;
`

const PoolContainer = styled.article`
  display: flex;
  width: 100%;
  align-items: stretch;
  gap: 16px;
  font-family: Inter, -apple-system, Roboto, Helvetica, sans-serif;
  justify-content: start;
  flex-wrap: wrap;
  @media (max-width: 991px) {
    max-width: 100%;
  }
`

const PoolInfo = styled.div`
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 1);
  border: 1px solid rgba(230, 230, 255, 1);
  display: flex;
  min-width: 240px;
  padding: 16px 24px;
  flex-direction: column;
  align-items: stretch;
  font-size: 14px;
  letter-spacing: -0.42px;
  justify-content: center;
  flex: 1;
  @media (max-width: 991px) {
    padding: 16px 20px;
  }
`

const PoolHeader = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  gap: 8px;
`

const PoolLogo = styled.img`
  aspect-ratio: 1.8;
  object-fit: contain;
  object-position: center;
  width: 72px;
  align-self: stretch;
  margin: auto 0;
  flex-shrink: 0;
`

const PoolDetails = styled.div`
  align-self: stretch;
  display: flex;
  margin: auto 0;
  flex-direction: column;
`

const PoolName = styled.h3`
  color: rgba(41, 41, 51, 1);
  font-weight: 600;
  margin: 0;
`

const PoolTypeRow = styled.div`
  display: flex;
  margin-top: 4px;
  align-items: center;
  gap: 4px;
  font-weight: 500;
`

const PoolType = styled.span`
  color: rgba(143, 143, 178, 1);
`

const PoolFee = styled.span`
  color: rgba(184, 184, 210, 1);
`

const MetricsContainer = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
`

const MetricBox = styled.div`
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 1);
  border: 1px solid rgba(230, 230, 255, 1);
  padding: 16px;
  width: 200px;
`

const MetricLabel = styled.div`
  color: rgba(184, 184, 210, 1);
  font-size: 14px;
  font-weight: 500;
  letter-spacing: -0.42px;
`

const MetricValueRow = styled.div`
  display: flex;
  margin-top: 8px;
  width: 100%;
  align-items: center;
  gap: 40px;
  justify-content: space-between;
`

const MetricValue = styled.div`
  font-size: 18px;
  color: rgba(41, 41, 51, 1);
  font-weight: 600;
  letter-spacing: -0.54px;
  margin-top: 8px;
`

const MetricIcon = styled.img`
  aspect-ratio: 1;
  object-fit: contain;
  object-position: center;
  width: 16px;
  flex-shrink: 0;
`

const PowerControlContainer = styled.div`
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 1);
  border: 1px solid rgba(230, 230, 255, 1);
  align-self: start;
  min-width: 240px;
  padding: 16px;
  width: 300px;
`

const PowerControlHeader = styled.div`
  display: flex;
  width: 100%;
  align-items: start;
  gap: 12px;
`

const InfoSection = styled.div`
  flex: 1;
  flex-basis: 32px;
`

const PowerLabel = styled.div`
  color: rgba(184, 184, 210, 1);
  font-size: 14px;
  font-weight: 500;
  letter-spacing: -0.42px;
`

const PowerValue = styled.div`
  margin-top: 8px;
  font-size: 18px;
  color: rgba(41, 41, 51, 1);
  font-weight: 600;
  letter-spacing: -0.54px;
`

const PercentageBox = styled.div`
  border-radius: 8px;
  background-color: rgba(247, 247, 250, 1);
  display: flex;
  padding: 16px;
  align-items: stretch;
  gap: 40px;
  font-size: 18px;
  font-weight: 600;
  letter-spacing: -0.54px;
  flex: 1;
  @media (max-width: 991px) {
    white-space: initial;
  }
`

const PercentageValue = styled.div`
  color: rgba(41, 41, 51, 1);
  margin: auto 0;
`

const PercentageSymbol = styled.div`
  color: rgba(184, 184, 210, 1);
  width: 17px;
`

const Divider = styled.img`
  border-top: solid 1px #e6e6ff;
`

const PercentageControls = styled.div`
  display: flex;
  margin-top: 12px;
  width: 100%;
  align-items: start;
  gap: 8px;
  font-size: 14px;
  color: rgba(184, 184, 210, 1);
  font-weight: 500;
  letter-spacing: -0.42px;
  @media (max-width: 991px) {
    white-space: initial;
  }
`

interface PercentageButtonProps {
  active?: boolean
}

const PercentageButton = styled.button<PercentageButtonProps>`
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 1);
  border: 1px solid ${(props) => (props.active ? 'rgba(102, 102, 255, 0.3)' : 'rgba(230, 230, 255, 1)')};
  color: ${(props) => (props.active ? '#6666ff' : 'inherit')};
  min-height: 33px;
  padding: 8px 10px;
  flex: 1;
  cursor: pointer;
  font: inherit;

  &:first-child {
    width: 47px;
    flex-basis: 19px;
  }
`

const MetricFooter = styled.div`
  margin-top: 12px;
  font-size: 14px;
  color: rgba(184, 184, 210, 1);
  font-weight: 500;
  letter-spacing: -0.42px;
`

const ModalBackdrop = styled.div<{ width?: string; height?: string }>`
  display: grid;
  place-content: center;
  width: 100vw;
  height: 100vh;
  background: rgba(143, 143, 204, 0.2);
  backdrop-filter: blur(5px);
  position: fixed;
  top: 0;
  left: 0;
  z-index: 10;
`

const ModalContainer = styled.div`
  display: flex;
  flex-flow: column nowrap;
  gap: 1rem;
  position: relative;
  width: 1180px;
  background: ${(props) => props.theme.launchpad.colors.background};
  border-radius: 16px;
  padding: 2rem;
`

export const ExitIconContainer = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  cursor: pointer;

  svg {
    fill: ${(props) => props.theme.launchpad.colors.text.body};
  }
`
