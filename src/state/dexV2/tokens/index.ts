// src/store/tokensSlice.ts
import { createSlice } from '@reduxjs/toolkit'
import { getChainId } from '@wagmi/core'
import _merge from 'lodash/merge'

import { TokenInfoMap, TokenInfo } from 'types/TokenList'
import { wagmiConfig } from 'components/Web3Provider'
import config from 'lib/config'
import { ContractAllowancesMap } from 'services/token/concerns/allowances.concern'

export type BalanceMap = { [address: string]: string }
export type AllowanceMap = { [address: string]: string }
export type TokenPrices = { [address: string]: number }

interface TokensState {
  balances: BalanceMap
  allowances: ContractAllowancesMap
  allowanceQueryRefetching: boolean
  balanceQueryRefetching: boolean
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
  allowances: {},
  allowanceQueryRefetching: false,
  balances: {},
  balanceQueryRefetching: false,
  tokens: {},
  prices: {},
  wrappedNativeAsset: null,
  spenders: [networkConfig.addresses.vault],
  balanceLoading: false,
  allowanceLoading: false,
  loading: false,
  injectedTokens: {},
  injectedPrices: {},
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
    //Add more ContractAllowancesMap to current allowances
    setAllowances(state, action) {
      state.allowances = _merge(state.allowances, action.payload)
    },
  },
})

export const { setTokens, setSpenders, setAllowanceLoading, setBalanceLoading, setTokensState, setAllowances } =
  tokensSlice.actions

export const selectWrappedNativeAsset = (state: { tokens: TokensState }) =>
  state.tokens.tokens[TOKENS.Addresses.wNativeAsset]

export default tokensSlice.reducer
