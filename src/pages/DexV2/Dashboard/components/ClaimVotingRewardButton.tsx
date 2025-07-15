import { Address } from 'viem'
import { PinnedContentButton } from 'components/Button'
import useTransactions from 'hooks/dex-v2/useTransactions'
import { Voter } from 'services/balancer/contracts/voter'
import { useState } from 'react'
import Loader from 'components/Loader'
import useEthers from 'hooks/dex-v2/useEthers'
import { FeeAndBribeRewardPerRow } from './types'

const ClaimVotingRewardButton = ({
  gaugeAddress,
  votingReward,
  tokenId,
  refetch,
}: {
  gaugeAddress: Address
  tokenId: string
  votingReward?: FeeAndBribeRewardPerRow
  refetch: () => void
}) => {
  const [loading, setLoading] = useState(false)
  const { addTransaction } = useTransactions()
  const { txListener } = useEthers()

  const feeTokenAddresses = votingReward?.feeTokens
  const bribeTokenAddresses = votingReward?.bribeTokens
  const isClaimable =
    votingReward?.bribeRewards?.some((reward) => reward.gt(0)) ||
    votingReward?.feeRewards?.some((reward) => reward.gt(0))

  const handleClaim = async () => {
    if (!feeTokenAddresses || !bribeTokenAddresses) return

    setLoading(true)
    try {
      const voter = new Voter()
      const [feeVotingReward, bribeVotingReward] = await Promise.all([
        voter.gaugeToFees(gaugeAddress),
        voter.gaugeToBribe(gaugeAddress),
      ])

      const tx = await voter.claimFees(
        [feeVotingReward, bribeVotingReward],
        [feeTokenAddresses, bribeTokenAddresses],
        tokenId
      )

      txListener(tx, {
        onTxConfirmed: async (receipt) => {
          refetch()
        },
        onTxFailed: () => {},
      })
      addTransaction({
        id: tx.hash,
        type: 'tx',
        action: 'claim',
        summary: 'Claim voting rewards',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <PinnedContentButton
      style={{
        width: 'auto',
        paddingTop: 12,
        paddingBottom: 12,
      }}
      onClick={() => handleClaim()}
      disabled={loading || !isClaimable}
    >
      {loading ? <Loader size="12px" /> : null} Claim
    </PinnedContentButton>
  )
}

export default ClaimVotingRewardButton
