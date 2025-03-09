// src/store/tokensSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { getAddress } from '@ethersproject/address'
import { getChainId, multicall } from '@wagmi/core'

import { TokenListMap, TokenInfoMap, TokenInfo } from 'types/TokenList'
import { wagmiConfig } from 'components/Web3Provider'
import config from 'lib/config'
import { erc20Abi, formatUnits } from 'viem'
import { ContractAllowancesMap } from 'services/token/concerns/allowances.concern'

export type BalanceMap = { [address: string]: string }
export type AllowanceMap = { [address: string]: string }
export type TokenPrices = { [address: string]: number }

const initTokenPrices: TokenPrices = {
  ['0x4a2b0767ACEE85C7825F09F48A9347285F58a5C2']: 2700,
  ['0xb6cd7297d7f0D761C5C395383219333d47F47b2a']: 1,
  ['0x8e3b0aEEF4b75d5aF86eF027fFe2d7C2AeC21CA4']: 1,
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
  allowanceQueryRefetching: boolean
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
  allowanceQueryRefetching: false,
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
