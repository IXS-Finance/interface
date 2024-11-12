// src/store/tokensSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { getAddress } from '@ethersproject/address'
import { getChainId, multicall } from '@wagmi/core'

import { TokenListMap, TokenInfoMap, TokenInfo } from 'types/TokenList'
import { wagmiConfig } from 'components/Web3Provider'
import config from 'lib/config'
import { erc20Abi } from 'viem'

export type BalanceMap = { [address: string]: string }

interface TokensState {
  balances: BalanceMap
  tokens: TokenInfoMap
  wrappedNativeAsset: TokenInfo | null
}

interface BalanceInputPayload {
  addresses: string[]
  account: string
}

const initialState: TokensState = {
  balances: {},
  tokens: {},
  wrappedNativeAsset: null,
}

const chainId = getChainId(wagmiConfig)
const networkConfig = config[chainId]
const TOKENS = networkConfig.tokens

const mapTokenListTokens = (tokenListMap: TokenListMap): TokenInfoMap => {
  const isEmpty = Object.keys(tokenListMap).length === 0
  if (isEmpty) return {}

  const tokens = [...Object.values(tokenListMap)].map((list: any) => list.tokens).flat()

  const tokensMap = tokens.reduce<TokenInfoMap>((acc, token) => {
    const address: string = getAddress(token.address)

    // Don't include if already included
    if (acc[address]) return acc

    // Don't include if not on app network
    if (token.chainId !== chainId) return acc

    acc[address] = token
    return acc
  }, {})

  return tokensMap
}

export const fetchTokensFromListTokens = createAsyncThunk(
  'tokens/fetchTokensFromListTokens',
  async (tokenLists: TokenListMap) => {
    return mapTokenListTokens(tokenLists)
  }
)

export const fetchTokensBalances = createAsyncThunk(
  'tokens/fetchTokensBalances',
  async ({ addresses, account }: BalanceInputPayload) => {
    // @ts-ignore
    const result = await multicall(wagmiConfig, {
      // @ts-ignore
      contracts: addresses.map((address) => ({
        address,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [account],
      })),
    })

    const balances = result.map((v: any) => v.result)
    const balancesMap = addresses.reduce<BalanceMap>((acc, address, i) => {
      acc[address] = balances[i].toString()
      return acc
    }, {})

    return balancesMap
  }
)

const tokensSlice = createSlice({
  name: 'tokens',
  initialState,
  reducers: {
    setTokens(state, action) {
      state.tokens = action.payload
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchTokensFromListTokens.fulfilled, (state, action) => {
      state.tokens = action.payload
    })
    builder.addCase(fetchTokensBalances.fulfilled, (state, action) => {
      state.balances = action.payload
    })
  },
})

export const { setTokens } = tokensSlice.actions

export const selectWrappedNativeAsset = (state: { tokens: TokensState }) =>
  state.tokens.tokens[TOKENS.Addresses.wNativeAsset]

export default tokensSlice.reducer
