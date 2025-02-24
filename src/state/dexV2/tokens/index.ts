// src/store/tokensSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { getAddress } from '@ethersproject/address'
import { getChainId, multicall } from '@wagmi/core'

import { TokenListMap, TokenInfoMap, TokenInfo } from 'types/TokenList'
import { wagmiConfig } from 'components/Web3Provider'
import config from 'lib/config'
import { erc20Abi, formatUnits } from 'viem'

export type BalanceMap = { [address: string]: string }
export type AllowanceMap = { [address: string]: string }
export type ContractAllowancesMap = { [address: string]: AllowanceMap }
export type TokenPrices = { [address: string]: number }

const initTokenPrices: TokenPrices = {
  ['0x4a2b0767ACEE85C7825F09F48A9347285F58a5C2']: 2700,
  ['0x142953B2F88D0939FD9f48F4bFfa3A2BFa21e4F8']: 1,
  ['0xA9c2c7D5E9bdA19bF9728384FFD3cF71Ada5dfcB']: 1,
  ['0x949546713004ee02537292b1F41046f705909191']: 0.3,
}

interface BalanceInputPayload {
  tokens: TokenInfoMap
  account: string
}

interface AllowanceInputPayload {
  tokens: TokenInfoMap
  account: string
  contractAddress: string
}

interface TokensState {
  balances: BalanceMap
  allowances: ContractAllowancesMap
  tokens: TokenInfoMap
  prices: TokenPrices
  wrappedNativeAsset: TokenInfo | null
  spenders: string[]
  balanceLoading: boolean
  allowanceLoading: boolean
  loading: boolean
  injectedTokens: TokenInfoMap
  injectedPrices: TokenPrices
}

const chainId = getChainId(wagmiConfig)
const networkConfig = config[chainId]
const TOKENS = networkConfig.tokens

const initialState: TokensState = {
  balances: {},
  allowances: {},
  tokens: {},
  prices: {},
  wrappedNativeAsset: null,
  spenders: [networkConfig.addresses.vault],
  balanceLoading: false,
  allowanceLoading: false,
  loading: false,
  injectedTokens: {},
  injectedPrices: initTokenPrices,
}

const tokensSlice = createSlice({
  name: 'tokens',
  initialState,
  reducers: {
    setTokens(state, action) {
      state.tokens = action.payload
    },
    setSpenders(state, action) {
      state.spenders = [...state.spenders, ...action.payload]
    },
    setBalanceLoading(state, action) {
      state.balanceLoading = action.payload
    },
    setAllowanceLoading(state, action) {
      state.allowanceLoading = action.payload
    },
    setTokensState(state, action) {
      const newState = { ...state, ...action.payload }

      return newState
    },
  },
})

export const { setTokens, setSpenders, setAllowanceLoading, setBalanceLoading, setTokensState } = tokensSlice.actions

export const selectWrappedNativeAsset = (state: { tokens: TokensState }) =>
  state.tokens.tokens[TOKENS.Addresses.wNativeAsset]

export default tokensSlice.reducer
