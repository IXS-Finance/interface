// src/store/tokensSlice.ts
import { createSlice } from '@reduxjs/toolkit'
import { getChainId } from '@wagmi/core'

import { TokenInfoMap, TokenInfo } from 'types/TokenList'
import { wagmiConfig } from 'components/Web3Provider'
import config from 'lib/config'
import { ContractAllowancesMap } from 'services/token/concerns/allowances.concern'

export type BalanceMap = { [address: string]: string }
export type AllowanceMap = { [address: string]: string }
export type TokenPrices = { [address: string]: number }

const initTokenPrices: TokenPrices = {
  ['0x4a2b0767ACEE85C7825F09F48A9347285F58a5C2']: 2700,
  ['0xb6cd7297d7f0D761C5C395383219333d47F47b2a']: 1,
  ['0x8e3b0aEEF4b75d5aF86eF027fFe2d7C2AeC21CA4']: 1,
  ['0x949546713004ee02537292b1F41046f705909191']: 0.3,
  ['0x8a1887973f72D43B023EA2EF848BB3614664cE5b']: 0.71,
  ['0xbeD7ef47506556B96839E6607DDEe9B49de55fDB']: 5.8,
  ['0xdba068f4486C9d7409976AdECF43417403aD1121']: 0.69,
  ['0x00A276Ae9b8A3Ca5128B7aba8EAeF62E4C59F871']: 25,
}
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
    //Add more ContractAllowancesMap to current allowances
    setAllowances(state, action) {
      state.allowances = { ...state.allowances, ...action.payload }
    },
  },
})

export const { setTokens, setSpenders, setAllowanceLoading, setBalanceLoading, setTokensState, setAllowances } =
  tokensSlice.actions

export const selectWrappedNativeAsset = (state: { tokens: TokensState }) =>
  state.tokens.tokens[TOKENS.Addresses.wNativeAsset]

export default tokensSlice.reducer
