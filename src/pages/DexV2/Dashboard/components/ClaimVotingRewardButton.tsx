import { Address } from 'viem'
import { PinnedContentButton } from 'components/Button'
import useTransactions from 'hooks/dex-v2/useTransactions'
import { Voter } from 'services/balancer/contracts/voter'
import { useState } from 'react'
import Loader from 'components/Loader'

const ClaimVotingRewardButton = ({
  gaugeAddress,
  feeTokenAddresses,
  bribeTokenAddresses,
  tokenId,
}: {
  gaugeAddress: Address
  tokenId: string
  feeTokenAddresses?: Address[]
  bribeTokenAddresses?: Address[]
}) => {
  const [loading, setLoading] = useState(false)
  const { addTransaction } = useTransactions()

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
      disabled={loading}
    >
      {loading ? <Loader size="12px" /> : null} Claim
    </PinnedContentButton>
  )
}

export default ClaimVotingRewardButton
