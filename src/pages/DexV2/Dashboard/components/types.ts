import { BigNumber } from 'ethers'
import { Address } from 'viem'

export type FeeAndBribeRewardPerRow = {
  feeRewards: BigNumber[]
  feeTokens: Address[]
  bribeRewards: BigNumber[]
  bribeTokens: Address[]
}
