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
import useLiquidityPool from '../hooks/useLiquidityPool'
import ClaimVotingRewardButton from './ClaimVotingRewardButton'

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
  console.log('lockRewards', lockRewards)

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
  feeRewards: BigNumber[]
  feeTokens: Address[]
  bribeRewards: BigNumber[]
  bribeTokens: Address[]
}

const VotingRewardPerVote = ({ votedLockReward, lockData }: { votedLockReward: VoteItem; lockData: LockedData }) => {
  const pools = votedLockReward.pools
  const { gaugesByPool } = useLiquidityPool()
  const poolAddresses = pools.map((pool) => pool.lp)

  const { data: votingRewardsPerPool } = useVotingQuery(poolAddresses, votedLockReward.id)

  return (
    <>
      {pools?.map((poolAddress, i) => {
        const votingReward = {
          feeTokens: votingRewardsPerPool?.feeTokens[i],
          feeRewards: votingRewardsPerPool?.feeRewards[i],
          bribeRewards: votingRewardsPerPool?.bribeRewards[i],
          bribeTokens: votingRewardsPerPool?.bribeTokens[i],
        } as FeeAndBribeRewardPerRow
        const gaugeAddress = gaugesByPool[poolAddress.lp.toLowerCase() as Address]
        return (
          <Grid item key={`vote-${votedLockReward.id}-pool-${poolAddress}`}>
            <VotingRewardRow votingReward={votingReward} lockData={lockData} gaugeAddress={gaugeAddress} />
          </Grid>
        )
      })}
    </>
  )
}

const VotingRewardRow = ({
  votingReward,
  lockData,
  gaugeAddress,
}: {
  votingReward?: FeeAndBribeRewardPerRow
  lockData: LockedData
  gaugeAddress: Address
}) => {
  console.log('gaugeAddress', gaugeAddress)

  const { getToken } = useTokens()
  const feeTokenAddresses = votingReward?.feeTokens
  const bribeTokenAddresses = votingReward?.bribeTokens
  const feeTokens = feeTokenAddresses?.map((tokenAddress) => getToken(tokenAddress))
  const pairName = feeTokens?.map((token) => token.symbol).join('/')

  const isClaimable = useMemo(() => {
    return (
      gaugeAddress &&
      (votingReward?.bribeRewards?.some((reward) => reward.gt(0)) ||
        votingReward?.feeRewards?.some((reward) => reward.gt(0)))
    )
  }, [
    gaugeAddress,
    JSON.stringify(votingReward?.bribeRewards?.map((r) => r.toString())),
    JSON.stringify(votingReward?.feeRewards?.map((r) => r.toString())),
  ])

  return (
    <Card>
      <Grid container spacing={1}>
        <Grid item xs={4}>
          <Stack direction="row" gap={3}>
            <Box>
              <CurrencyLogoSet tokens={feeTokenAddresses} size={36} margin={false} />
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
        <Grid item xs={4}>
          <Stack direction="row" gap={1} mb={1}>
            <TYPE.black fontSize={14}>Lock #{lockData.id}</TYPE.black>
            <UnlockIcon />
          </Stack>
          <TYPE.black fontSize={14} color="blue5">
            {lockData.amount} IXS locked
          </TYPE.black>
        </Grid>
        <Grid item xs={4}>
          <Stack direction="row" gap={2} alignItems="start" justifyContent="flex-end">
            <Stack gap={0.5}>
              {feeTokenAddresses?.map((tokenAddress, i) => {
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
                      {utils.formatUnits(votingReward?.feeRewards[i] ?? 0, token.decimals)}{' '}
                      <FeeAndBribeRewardTokenSymbol>{token.symbol}</FeeAndBribeRewardTokenSymbol>
                    </TYPE.black>
                    <FeeAndBribeRewardLabel size="small" label="Fee" variant="outlined" />
                  </Stack>
                )
              })}
              {bribeTokenAddresses?.map((tokenAddress, i) => {
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
                      {utils.formatUnits(votingReward?.bribeRewards[i] ?? 0, token.decimals)}{' '}
                      <FeeAndBribeRewardTokenSymbol>{token.symbol}</FeeAndBribeRewardTokenSymbol>
                    </TYPE.black>
                    <FeeAndBribeRewardLabel size="small" label="Incentive" variant="outlined" />
                  </Stack>
                )
              })}
            </Stack>

            {isClaimable ? (
              <ClaimVotingRewardButton
                gaugeAddress={gaugeAddress}
                tokenId={lockData.id}
                feeTokenAddresses={feeTokenAddresses}
                bribeTokenAddresses={bribeTokenAddresses}
              />
            ) : null}
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
