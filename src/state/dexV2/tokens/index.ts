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
  injectedTokens: TokenInfoMap;
}

const initialState: TokensState = {
  balances: {},
  allowances: {},
  tokens: {},
  prices: {},
  wrappedNativeAsset: null,
  spenders: [],
  balanceLoading: false,
  allowanceLoading: false,
  loading: false,
  injectedTokens: {},
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
  async ({ tokens, account }: BalanceInputPayload) => {
    const addresses = Object.keys(tokens) as string[]
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
      acc[address] = formatUnits(balances[i].toString(), tokens[address].decimals)
      return acc
    }, {})

    return balancesMap
  }
)

export const fetchTokensAllowwances = createAsyncThunk(
  'tokens/fetchTokensAlowances',
  async ({ tokens, account, contractAddress }: AllowanceInputPayload, { dispatch }) => {
    try {
      dispatch(setAllowanceLoading(true))
      const addresses = Object.keys(tokens) as string[]
      // @ts-ignore
      const result = await multicall(wagmiConfig, {
        // @ts-ignore
        contracts: addresses.map((address) => ({
          address,
          abi: erc20Abi,
          functionName: 'allowance',
          args: [account, contractAddress],
        })),
      })

      const allowances = result.map((v: any) => v.result)
      const allowancesMap = addresses.reduce<AllowanceMap>((acc, address, i) => {
        acc[address] = formatUnits(allowances[i].toString(), tokens[address].decimals)
        return acc
      }, {})

      dispatch(setAllowanceLoading(false))
      return { [contractAddress]: allowancesMap }
    } catch (error) {
      console.error('Failed to fetch allowances for:', account, error);
      dispatch(setAllowanceLoading(false))
      return {};
    }
  }
)

export const fetchTokenPrices = createAsyncThunk('tokens/fetchTokenPrices', async (tokens: TokenInfoMap) => {
  const addresses = Object.keys(tokens) as string[]
  // const prices = await Promise.all(
  //   addresses.map(async (address) => {
  //     const response = await fetch(
  //       `https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=${address}&vs_currencies=usd`
  //     )
  //     const data = await response.json()
  //     return data[address.toLowerCase()].usd
  //   })
  // )

  return addresses.reduce<TokenPrices>((acc, address, i) => {
    acc[address] = 1
    if (tokens[address].symbol === 'WETH') {
      acc[address] = 3000
    }
    if (tokens[address].symbol === 'TIXS') {
      acc[address] = 0.4
    }
    return acc
  }, {})
})

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
    setTokensState (state, action) {
      const newState = { ...state, ...action.payload }

      return newState
    }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchTokensFromListTokens.fulfilled, (state, action) => {
      state.tokens = action.payload
    })
    builder.addCase(fetchTokensBalances.fulfilled, (state, action) => {
      state.balances = action.payload
    })
    builder.addCase(fetchTokensAllowwances.fulfilled, (state, action) => {
      state.allowances = { ...state.allowances, ...action.payload }
    })
    builder.addCase(fetchTokenPrices.fulfilled, (state, action) => {
      state.prices = action.payload
    })
  },
})

export const { setTokens, setSpenders, setAllowanceLoading, setBalanceLoading, setTokensState } = tokensSlice.actions

export const selectWrappedNativeAsset = (state: { tokens: TokensState }) =>
  state.tokens.tokens[TOKENS.Addresses.wNativeAsset]

export default tokensSlice.reducer
