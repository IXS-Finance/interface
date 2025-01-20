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
  tokens: TokenType[]
}

export type JoinExitsType = {
  user: {
    id: string
  }
  type: string
  pool: PoolType
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
