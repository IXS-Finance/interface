import { bnum } from 'lib/utils'
import { Pool } from 'services/pool/types'
import useNumbers from './useNumbers'
import { useTokens } from 'state/dexV2/tokens/hooks/useTokens'

export function useUserPoolPercentage(pool: Pool) {
  const { balanceFor } = useTokens()

  const { fNum } = useNumbers()

  // Calculate the user's total balance in BPT.
  const bptBalance = bnum(balanceFor(pool.address)).plus('0')

  // Compute the percentage of the pool owned by the user.
  const userPoolPercentage = bptBalance.div(bnum(pool.totalShares)).multipliedBy(100)

  // Format the percentage value as a label.
  const userPoolPercentageLabel =
    fNum(userPoolPercentage.toString(), {
      maximumFractionDigits: 4,
      minimumFractionDigits: 0,
    }) + '%'

  return {
    userPoolPercentage,
    userPoolPercentageLabel,
  }
}
