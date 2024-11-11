// src/store/tokenListsSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { getChainId } from '@wagmi/core'

import { wagmiConfig } from 'components/Web3Provider'

export interface Version {
  readonly major: number
  readonly minor: number
  readonly patch: number
}

export interface Tags {
  readonly [tagId: string]: {
    readonly name: string
    readonly description: string
  }
}

export interface TokenInfo {
  readonly chainId: number
  readonly address: string
  readonly name: string
  readonly decimals: number
  readonly symbol: string
  readonly logoURI?: string
  readonly tags?: string[]
  readonly extensions?: {
    readonly [key: string]: string | number | boolean | null
  }
}

export interface TokenList {
  readonly name: string
  readonly timestamp: string
  readonly version: Version
  readonly tokens: TokenInfo[]
  readonly keywords?: string[]
  readonly tags?: Tags
  readonly logoURI?: string
}

export type TokenListMap = { [address: string]: TokenList }

interface TokenListsState {
  allTokenLists: TokenListMap
  isTestMode: boolean
}

const chainId = getChainId(wagmiConfig)

function filterTokensList(tokensList: TokenListMap, networkId: any): TokenListMap {
  return Object.keys(tokensList).reduce((acc: TokenListMap, key) => {
    const data = tokensList[key]
    if (data.tokens)
      acc[key] = {
        ...data,
        tokens: data.tokens.filter((token) => token.chainId === networkId),
      }
    return acc
  }, {})
}

const initialState: TokenListsState = {
  allTokenLists: {},
  isTestMode: process.env.NODE_ENV === 'test',
}

export const fetchTokenLists = createAsyncThunk('tokenLists/fetchTokenLists', async () => {
  const tokensListPromise = import(`assets/data/tokenlists/tokens-${chainId}.json`)

  const module = await tokensListPromise

  const tokenLists = module.default as TokenListMap
  return filterTokensList(tokenLists, chainId)
})

const tokenListsSlice = createSlice({
  name: 'tokenLists',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchTokenLists.fulfilled, (state, action) => {
      state.allTokenLists = action.payload
    })
  },
})

export const {} = tokenListsSlice.actions

export default tokenListsSlice.reducer
