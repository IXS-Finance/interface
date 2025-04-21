import React, { useMemo } from 'react'
import { Box, Chip, Grid, Stack, Tooltip } from '@mui/material'
import { TYPE } from 'theme'
import styled from 'styled-components'
import { Card } from './Card'
import { ReactComponent as InfoIcon } from 'assets/images/info.svg'
import { ReactComponent as UnlockIcon } from 'assets/images/dex-v2/unlock.svg'
import useLocksQuery from 'hooks/dex-v2/queries/useLocksQuery'
import useWeb3 from 'hooks/dex-v2/useWeb3'
import { BigNumber, utils } from 'ethers'
import useVotingQuery from 'hooks/dex-v2/queries/useVotingQuery'
import { Address } from 'viem'
import CurrencyLogoSet from 'components/CurrencyLogoSet'
import { useTokens } from 'state/dexV2/tokens/hooks/useTokens'
import useFlattenedLocks from 'hooks/dex-v2/queries/useFlattenedLocks'
import { LockedData } from 'services/balancer/contracts/ve-sugar'
import { PinnedContentButton } from 'components/Button'

const VotingRewards = () => {
  return (
    <Box>
      <Stack mb={3} direction="row" alignItems="center" gap={1}>
        <TYPE.label>Voting Rewards</TYPE.label>
        <Tooltip title="Info">
          <InfoIcon />
        </Tooltip>
      </Stack>
      <Box mb={1}>
        <TableBody />
      </Box>
    </Box>
  )
}

type VotePool = {
  lp: Address
  weight: BigNumber
}

type VoteItem = {
  id: string
  rewardToken: Address
  pools: VotePool[]
}

const TableBody = () => {
  const { account } = useWeb3()
  const { lockRewards } = useLocksQuery(account)
  const { flattenedLocks } = useFlattenedLocks(account)

  const lockHasVotes = useMemo(() => {
    if (!lockRewards) return []

    return lockRewards
      .filter((reward) => reward.votes.length > 0)
      .map((reward) => ({
        id: reward.id,
        rewardToken: reward.token,
        pools: reward.votes,
      }))
  }, [lockRewards])

  return (
    <Grid container direction="column" spacing={0.5}>
      {lockHasVotes?.map((votedLockReward) => (
        <VotingRewardPerVote
          key={votedLockReward.id}
          votedLockReward={votedLockReward}
          lockData={flattenedLocks[votedLockReward.id]}
        />
      ))}
    </Grid>
  )
}

type FeeAndBribeRewardPerRow = {
  tokens: Address[]
  fees: BigNumber[]
  bribes: BigNumber[]
}

const VotingRewardPerVote = ({ votedLockReward, lockData }: { votedLockReward: VoteItem; lockData: LockedData }) => {
  const pools = votedLockReward.pools
  const poolAddresses = pools.map((pool) => pool.lp)

  const { data: votingRewardsPerPool } = useVotingQuery(poolAddresses, votedLockReward.id)

  return (
    <>
      {pools?.map((poolAddress, i) => {
        const votingReward = {
          tokens: votingRewardsPerPool?.tokens[i],
          fees: votingRewardsPerPool?.feeRewards[i],
          bribes: votingRewardsPerPool?.bribeRewards[i],
        } as FeeAndBribeRewardPerRow
        return (
          <Grid item key={`vote-${votedLockReward.id}-pool-${poolAddress}`}>
            <VotingRewardRow votingReward={votingReward} lockData={lockData} />
          </Grid>
        )
      })}
    </>
  )
}

const VotingRewardRow = ({
  votingReward,
  lockData,
}: {
  votingReward: FeeAndBribeRewardPerRow
  lockData: LockedData
}) => {
  const { getToken } = useTokens()
  const inputTokenAddresses = votingReward?.tokens
  const inputTokens = inputTokenAddresses?.map((tokenAddress) => getToken(tokenAddress))
  const pairName = inputTokens?.map((token) => token.symbol).join('/')

  return (
    <Card>
      <Grid container spacing={1}>
        <Grid item xs={3}>
          <Stack direction="row" gap={4}>
            <Box width={40}>
              <CurrencyLogoSet tokens={inputTokenAddresses} size={36} margin={false} />
            </Box>
            <Box>
              <TYPE.label fontSize={16}>{pairName}</TYPE.label>
              <Stack direction="row" alignItems="center" gap={1}>
                <TYPE.subHeader1 color="yellow69">Weighted</TYPE.subHeader1>
                <Dot />
                <Tooltip title="Info">
                  <InfoIcon width={12} />
                </Tooltip>
              </Stack>
            </Box>
          </Stack>
        </Grid>
        <Grid item xs={6}>
          <Stack direction="row" gap={1} mb={1}>
            <TYPE.black fontSize={14}>Lock #{lockData.id}</TYPE.black>
            <UnlockIcon />
          </Stack>
          <TYPE.black fontSize={14} color="">
            {lockData.amount} IXS locked
          </TYPE.black>
        </Grid>
        <Grid item xs={3}>
          <Stack direction="row" gap={2} alignItems="start" justifyContent="flex-end">
            <Stack gap={0.5}>
              {inputTokenAddresses?.map((tokenAddress, i) => {
                const token = getToken(tokenAddress)
                return (
                  <Stack
                    key={`fee-${tokenAddress}`}
                    direction="row"
                    alignItems="center"
                    justifyContent="flex-end"
                    gap={1}
                  >
                    <TYPE.black fontSize={14}>
                      {utils.formatUnits(votingReward.fees[i], token.decimals)}{' '}
                      <FeeAndBribeRewardTokenSymbol>{token.symbol}</FeeAndBribeRewardTokenSymbol>
                    </TYPE.black>
                    <FeeAndBribeRewardLabel size="small" label="Fee" variant="outlined" />
                  </Stack>
                )
              })}
              {inputTokenAddresses?.map((tokenAddress, i) => {
                const token = getToken(tokenAddress)
                return (
                  <Stack
                    key={`incentive-${tokenAddress}`}
                    direction="row"
                    alignItems="center"
                    justifyContent="flex-end"
                    gap={1}
                  >
                    <TYPE.black fontSize={14}>
                      {utils.formatUnits(votingReward.bribes[i], token.decimals)}{' '}
                      <FeeAndBribeRewardTokenSymbol>{token.symbol}</FeeAndBribeRewardTokenSymbol>
                    </TYPE.black>
                    <FeeAndBribeRewardLabel size="small" label="Incentive" variant="outlined" />
                  </Stack>
                )
              })}
            </Stack>

            <PinnedContentButton
              style={{
                width: 'auto',
                paddingTop: 12,
                paddingBottom: 12,
              }}
              onClick={() => {}}
            >
              Claim
            </PinnedContentButton>
          </Stack>
        </Grid>
      </Grid>
    </Card>
  )
}

const Dot = styled.div`
  width: 2px;
  height: 2px;
  border-radius: 50%;
  background: ${({ theme }) => theme.text6};
`

const FeeAndBribeRewardLabel = styled(Chip)`
  border: 1px solid ${({ theme }) => theme.bg24} !important;
  span {
    color: ${({ theme }) => theme.text6};
  }
`
const FeeAndBribeRewardTokenSymbol = styled.span`
  color: ${({ theme }) => theme.text6};
`

export default VotingRewards
