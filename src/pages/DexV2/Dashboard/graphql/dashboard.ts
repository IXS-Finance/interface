import { BigNumber } from 'ethers'
import { Address } from 'viem'

export type TokenType = {
  id: string
  symbol: string
  address: Address
  decimals: string
  balance: string
  weight: string
  managedBalance: string
  cashBalance: string
}

export type PoolType = {
  id: string
  address: Address
  name: string
  totalLiquidity: string
  totalShares: string
  gauge: {
    address: Address
  }
  tokensList: string[]
  tokens: TokenType[]
}

export type JoinExitsType = {
  user: {
    id: string
  }
  type: string
  pool: PoolType
}

interface LpVotes {
  lp: string;
  weight: BigNumber;
}

export interface VeNFT {
  id: BigNumber;
  account: string;
  decimals: bigint;
  amount: bigint;
  voting_amount: BigNumber;
  governance_amount: BigNumber;
  rebase_amount: BigNumber;
  expires_at: BigNumber;
  voted_at: BigNumber;
  votes: LpVotes[];
  token: string;
  permanent: boolean;
  delegate_id: BigNumber;
  managed_id: BigNumber;
}

export interface LockItem {
  id: string;
  amount: string;
  votingAmount: string;
  expiresAt: string;
  votedAt: string;
  decimals: number;
  token: string;
}

export const GET_LIQUIDITY_POSITIONS = `
  query GetDexV2Dashboard($account: ID!) {
    joinExits(where: { user: $account, type: Join }) {
      user {
        id
      }
      type
      pool {
        id
        address
        name
        totalLiquidity
        totalShares
        tokensList
        gauge {
          address
        }
        tokens {
          id
          symbol
          address
          decimals
          balance
          weight
          managedBalance
          cashBalance
        }
      }
    }
  }
`
