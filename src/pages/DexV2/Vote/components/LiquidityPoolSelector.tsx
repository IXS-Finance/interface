import React from 'react'
import { Flex } from 'rebass'
import styled from 'styled-components'

interface PoolRowProps {
  poolImage: string
  poolName: string
  poolType: string
  feePercentage: string
  infoIcon: string
  tvlAmount: string
  feesAmount: string
  feesTokens: string
  incentivesAmount?: string
  incentivesTokens?: string
  incentivesLabel?: string
  incentivesAction?: string
  totalRewardsAmount: string
  totalRewardsLabel: string
  aprPercentage: string
  aprTrendIcon: string
  votesPercentage: string
  votesAmount: string
  selectIcon: string
}

const PoolHeader = () => {
  return (
    <Flex justifyContent="space-between" alignItems="center" mb="32px">
      <TitleSection>
        <Title>Select Liquidity Pools for Voting</Title>
        <InfoIcon
          src="https://cdn.builder.io/api/v1/image/assets/2fee40ad791a4d8d9f5a8c7717832989/4c6fcca4b8ec92940647be870007194ef36e67ff?placeholderIfAbsent=true"
          alt="Info"
        />
      </TitleSection>
      <SearchSection>
        <SearchText>Symbol or address</SearchText>
        <SearchIcon
          src="https://cdn.builder.io/api/v1/image/assets/2fee40ad791a4d8d9f5a8c7717832989/1dadf1269dac5077059f9c4814f64c59624465cf?placeholderIfAbsent=true"
          alt="Search"
        />
      </SearchSection>
    </Flex>
  )
}

const PoolTableHeader = () => {
  return (
    <HeaderContainer>
      <Column>Pools</Column>
      <Column>Fees</Column>
      <Column>Incentives</Column>
      <Column>Total Rewards</Column>
      <Column>vAPR</Column>
    </HeaderContainer>
  )
}

const PoolRow = ({
  poolImage,
  poolName,
  poolType,
  feePercentage,
  infoIcon,
  tvlAmount,
  feesAmount,
  feesTokens,
  incentivesAmount,
  incentivesTokens,
  incentivesLabel,
  incentivesAction,
  totalRewardsAmount,
  totalRewardsLabel,
  aprPercentage,
  aprTrendIcon,
  votesPercentage,
  votesAmount,
  selectIcon,
}: PoolRowProps) => {
  return (
    <RowContainer>
      <PoolInfo>
        <PoolDetails>
          <div>
            <PoolLogo src={poolImage} alt={poolName} />
            <PoolNameSection>
              <PoolName>{poolName}</PoolName>
              <PoolTypeInfo>
                <span>{poolType}</span>
                <span>{feePercentage}</span>
                <img src={infoIcon} alt="Info" />
              </PoolTypeInfo>
            </PoolNameSection>
          </div>
          <Divider />
          <TvlText>
            TVL <TvlAmount>{tvlAmount}</TvlAmount>
          </TvlText>
        </PoolDetails>
      </PoolInfo>

      <FeesSection>
        <Amount>{feesAmount}</Amount>
        <Divider />
        <TokenAmount>{feesTokens}</TokenAmount>
      </FeesSection>

      <IncentivesSection>
        {incentivesAmount ? (
          <>
            <Amount>{incentivesAmount}</Amount>
            <Divider />
            <TokenAmount>{incentivesTokens}</TokenAmount>
          </>
        ) : (
          <>
            <NoIncentives>{incentivesLabel}</NoIncentives>
            <Divider />
            <AddIncentives>{incentivesAction}</AddIncentives>
          </>
        )}
      </IncentivesSection>

      <RewardsSection>
        <Amount>{totalRewardsAmount}</Amount>
        <Divider />
        <RewardsLabel>{totalRewardsLabel}</RewardsLabel>
      </RewardsSection>

      <AprSection>
        <AprHeader>
          <AprPercentage>{aprPercentage}</AprPercentage>
          <img src={aprTrendIcon} alt="Trend" />
        </AprHeader>
        <Divider />
        <VotesInfo>
          <span>{votesPercentage}</span>
          <VotesAmount>{votesAmount}</VotesAmount>
        </VotesInfo>
        <SelectButton>
          <SelectIcon src={selectIcon} alt="" />
          <span>Select</span>
        </SelectButton>
      </AprSection>
    </RowContainer>
  )
}

const Pagination = () => {
  return (
    <PaginationContainer>
      <PaginationContent>
        <PaginationIcon
          src="https://cdn.builder.io/api/v1/image/assets/2fee40ad791a4d8d9f5a8c7717832989/6937ddf0-c0d4-4dec-b666-df4389a0efbb?placeholderIfAbsent=true"
          alt=""
        />
        <span>1-5 of 45</span>
      </PaginationContent>
    </PaginationContainer>
  )
}

export const LiquidityPoolSelector = () => {
  return (
    <Container>
      <ContentWrapper>
        <PoolHeader />
        <TableSection>
          <PoolTableHeader />
          <PoolRow
            poolImage="https://cdn.builder.io/api/v1/image/assets/2fee40ad791a4d8d9f5a8c7717832989/5bcd03608093c612976a347c2cebf73674dbb0f1?placeholderIfAbsent=true"
            poolName="IXS - USDC"
            poolType="Basic Volatile"
            feePercentage="0.3%"
            infoIcon="https://cdn.builder.io/api/v1/image/assets/2fee40ad791a4d8d9f5a8c7717832989/3e6491bb023b2011254f1ef8bb4e49195f155c40?placeholderIfAbsent=true"
            tvlAmount="$12,596.86"
            feesAmount="$30.04"
            feesTokens="5,461.07 IXS"
            incentivesAmount="$5,284.83"
            incentivesTokens="960,656.02 IXS"
            totalRewardsAmount="$5,314.87"
            totalRewardsLabel="Fees + Incentives"
            aprPercentage="165.82%"
            aprTrendIcon="https://cdn.builder.io/api/v1/image/assets/2fee40ad791a4d8d9f5a8c7717832989/af8ef3758e21ab63d18dfeb3f0c08ae8620815d0?placeholderIfAbsent=true"
            votesPercentage="0.0421% Votes"
            votesAmount="347,677.19 vIXS"
            selectIcon="https://cdn.builder.io/api/v1/image/assets/2fee40ad791a4d8d9f5a8c7717832989/ed5aa2c6bdd4ca6c8d9de4453e8e8dfc266972cd?placeholderIfAbsent=true"
          />
          <PoolRow
            poolImage="https://cdn.builder.io/api/v1/image/assets/2fee40ad791a4d8d9f5a8c7717832989/14251b4ac29a5a0b8a7330f752aa5aacacf5a5a3?placeholderIfAbsent=true"
            poolName="OP - USDC"
            poolType="Basic Volatile"
            feePercentage="0.3%"
            infoIcon="https://cdn.builder.io/api/v1/image/assets/2fee40ad791a4d8d9f5a8c7717832989/3e6491bb023b2011254f1ef8bb4e49195f155c40?placeholderIfAbsent=true"
            tvlAmount="$12,596.86"
            feesAmount="$161.8"
            feesTokens="5,461.07 IXS"
            incentivesLabel="No available incentives"
            incentivesAction="Add incentives"
            totalRewardsAmount="$161.8"
            totalRewardsLabel="Fees + Incentives"
            aprPercentage="121.58%"
            aprTrendIcon="https://cdn.builder.io/api/v1/image/assets/2fee40ad791a4d8d9f5a8c7717832989/c8f763c3ceeb42cab91e7c74da30d9063c453b3f?placeholderIfAbsent=true"
            votesPercentage="0.0421% Votes"
            votesAmount="347,677.19 vIXS"
            selectIcon="https://cdn.builder.io/api/v1/image/assets/2fee40ad791a4d8d9f5a8c7717832989/ed5aa2c6bdd4ca6c8d9de4453e8e8dfc266972cd?placeholderIfAbsent=true"
          />
          <PoolRow
            poolImage="https://cdn.builder.io/api/v1/image/assets/2fee40ad791a4d8d9f5a8c7717832989/b87209d17e0e5060c42c515cfd7b202c1a6cce95?placeholderIfAbsent=true"
            poolName="APT - USDT"
            poolType="Basic Volatile"
            feePercentage="0.3%"
            infoIcon="https://cdn.builder.io/api/v1/image/assets/2fee40ad791a4d8d9f5a8c7717832989/6688e16f17ac8603b2a43377365d83c9d8655767?placeholderIfAbsent=true"
            tvlAmount="$12,596.86"
            feesAmount="$1,343.14"
            feesTokens="5,461.07 IXS"
            incentivesAmount="$112.02"
            incentivesTokens="960,656.02 IXS"
            totalRewardsAmount="$113.36"
            totalRewardsLabel="Fees + Incentives"
            aprPercentage="127.61%"
            aprTrendIcon="https://cdn.builder.io/api/v1/image/assets/2fee40ad791a4d8d9f5a8c7717832989/46fdaca13d8367da194b565f056a168a188a0bea?placeholderIfAbsent=true"
            votesPercentage="0.0421% Votes"
            votesAmount="347,677.19 vIXS"
            selectIcon="https://cdn.builder.io/api/v1/image/assets/2fee40ad791a4d8d9f5a8c7717832989/ed5aa2c6bdd4ca6c8d9de4453e8e8dfc266972cd?placeholderIfAbsent=true"
          />
          <PoolRow
            poolImage="https://cdn.builder.io/api/v1/image/assets/2fee40ad791a4d8d9f5a8c7717832989/4ecbc5e9b4d111a991a86de96a529be6fce1e372?placeholderIfAbsent=true"
            poolName="HBAR - USDC"
            poolType="Basic Volatile"
            feePercentage="0.3%"
            infoIcon="https://cdn.builder.io/api/v1/image/assets/2fee40ad791a4d8d9f5a8c7717832989/6688e16f17ac8603b2a43377365d83c9d8655767?placeholderIfAbsent=true"
            tvlAmount="$12,596.86"
            feesAmount="$144.73"
            feesTokens="5,461.07 IXS"
            incentivesAmount="$2,284.83"
            incentivesTokens="960,656.02 IXS"
            totalRewardsAmount="$2,314.87"
            totalRewardsLabel="Fees + Incentives"
            aprPercentage="148.41%"
            aprTrendIcon="https://cdn.builder.io/api/v1/image/assets/2fee40ad791a4d8d9f5a8c7717832989/2830ad0dfdebc2a2b6bb62286c5d1c43f53766b2?placeholderIfAbsent=true"
            votesPercentage="0.0421% Votes"
            votesAmount="347,677.19 vIXS"
            selectIcon="https://cdn.builder.io/api/v1/image/assets/2fee40ad791a4d8d9f5a8c7717832989/ed5aa2c6bdd4ca6c8d9de4453e8e8dfc266972cd?placeholderIfAbsent=true"
          />
        </TableSection>
        <Pagination />
      </ContentWrapper>
    </Container>
  )
}

// Styled Components
const Container = styled.section`
  background-color: #fff;
  display: flex;
  padding: 80px 210px;
  flex-direction: column;
  align-items: stretch;
  font-family: Inter, -apple-system, Roboto, Helvetica, sans-serif;

  @media (max-width: 991px) {
    padding: 80px 20px;
  }
`

const ContentWrapper = styled.div`
  align-self: center;
  width: 100%;
  max-width: 1180px;

  @media (max-width: 991px) {
    max-width: 100%;
  }
`

const TableSection = styled.div`
  margin-top: 32px;
  width: 100%;
`

const HeaderContainer = styled.header`
  display: flex;
  width: 100%;
  padding: 20px 0;
  align-items: stretch;
  gap: 16px;

  @media (max-width: 991px) {
    max-width: 100%;
    flex-wrap: wrap;
  }
`

const TitleSection = styled.div`
  display: flex;
  min-width: 240px;
  align-items: center;
  gap: 8px;
  font-size: 32px;
  color: #292933;
  font-weight: 700;
  letter-spacing: -0.96px;
  line-height: 1.2;

  @media (max-width: 991px) {
    max-width: 100%;
  }
`

const Title = styled.div`
  font-size: 32px;
  margin: 0;

  @media (max-width: 991px) {
    max-width: 100%;
  }
`

const InfoIcon = styled.img`
  width: 16px;
  height: 16px;
  object-fit: contain;
`

const SearchSection = styled.div`
  border-radius: 8px;
  background-color: #fff;
  border: 1px solid #e6e6ff;
  display: flex;
  min-width: 240px;
  min-height: 48px;
  padding: 0 16px;
  align-items: center;
  gap: 40px 100px;
  font-size: 14px;
  color: #8f8fb2;
  font-weight: 500;
  letter-spacing: -0.28px;
  line-height: 48px;
  justify-content: space-between;
  width: 380px;
`

const SearchText = styled.span`
  white-space: nowrap;
`

const SearchIcon = styled.img`
  width: 24px;
  height: 24px;
  object-fit: contain;
`

const Column = styled.div`
  width: 200px;
  white-space: nowrap;

  &:first-child {
    min-width: 250px;
  }

  @media (max-width: 991px) {
    white-space: initial;
  }
`

const RowContainer = styled.div`
  border-bottom: 1px solid rgba(230, 230, 255, 0.6);
  display: flex;
  width: 100%;
  padding: 20px 0;
  align-items: stretch;
  gap: 16px;

  @media (max-width: 991px) {
    max-width: 100%;
    flex-wrap: wrap;
  }
`

const PoolInfo = styled.div`
  flex: 1;
  min-width: 240px;
`

const PoolDetails = styled.div`
  border-radius: 8px;
  background-color: #fff;
  border: 1px solid #e6e6ff;
  padding: 16px;
  font-size: 14px;
  letter-spacing: -0.42px;
`

const PoolLogo = styled.img`
  width: 72px;
  aspect-ratio: 1.8;
  object-fit: contain;
`

const PoolNameSection = styled.div`
  display: flex;
  flex-direction: column;
`

const PoolName = styled.h3`
  margin: 0;
  color: #292933;
  font-weight: 600;
`

const PoolTypeInfo = styled.div`
  display: flex;
  margin-top: 4px;
  align-items: center;
  gap: 4px;
  font-weight: 500;
  color: #8f8fb2;
`

const Divider = styled.div`
  background-color: #f0f0ff;
  height: 1px;
  margin: 12px 0;
  width: 100%;
`

const TvlText = styled.div`
  color: #b8b8d2;
`

const TvlAmount = styled.span`
  font-weight: 600;
  color: #292933;
`

const BaseSection = styled.div`
  border-radius: 8px;
  background-color: #fff;
  border: 1px solid #e6e6ff;
  padding: 16px;
  width: 200px;
`

const FeesSection = styled(BaseSection)``
const IncentivesSection = styled(BaseSection)``
const RewardsSection = styled(BaseSection)``
const AprSection = styled(BaseSection)``

const Amount = styled.div`
  color: #292933;
  font-size: 18px;
  font-weight: 600;
  letter-spacing: -0.54px;
`

const TokenAmount = styled.div`
  color: #b8b8d2;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: -0.42px;
`

const NoIncentives = styled.div`
  color: #b8b8d2;
  font-weight: 500;
`

const AddIncentives = styled.div`
  color: #6666ff;
  font-weight: 600;
  cursor: pointer;
`

const RewardsLabel = styled.div`
  color: #b8b8d2;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: -0.42px;
`

const AprHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 18px;
  color: #292933;
  letter-spacing: -0.54px;
`

const AprPercentage = styled.div`
  font-weight: 600;
`

const VotesInfo = styled.div`
  color: #b8b8d2;
  font-weight: 500;
`

const VotesAmount = styled.div`
  margin-top: 6px;
`

const SelectButton = styled.button`
  display: flex;
  margin-top: 12px;
  width: 100%;
  align-items: center;
  gap: 6px;
  color: #6666ff;
  justify-content: flex-end;
  background: none;
  border: none;
  cursor: pointer;
  font-weight: 600;
  padding: 0;
`

const SelectIcon = styled.img`
  width: 5px;
  aspect-ratio: 1.67;
  object-fit: contain;
`

const PaginationContainer = styled.div`
  display: flex;
  margin-top: 10px;
  min-height: 64px;
  width: 100%;
  padding: 24px 0;
  flex-direction: column;
  align-items: flex-end;
  font-size: 13px;
  color: #b8b8cc;
  font-weight: 500;
  letter-spacing: -0.26px;
  justify-content: center;

  @media (max-width: 991px) {
    max-width: 100%;
  }
`

const PaginationContent = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
  width: 97px;

  @media (max-width: 991px) {
    padding-right: 20px;
  }
`

const PaginationIcon = styled.img`
  width: 24px;
  height: 24px;
  object-fit: contain;
`
