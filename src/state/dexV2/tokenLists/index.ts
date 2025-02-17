// src/store/tokenListsSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { getChainId } from '@wagmi/core'

import { TokenListMap } from 'types/TokenList'
import { wagmiConfig } from 'components/Web3Provider'
import { fetchTokensFromListTokens } from '../tokens'
import { tokenListService } from 'services/token-list/token-list.service'

interface TokenListsState {
  allTokenLists: TokenListMap
  isTestMode: boolean
  activeListKeys: string[]
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

const { uris } = tokenListService

const initialState: TokenListsState = {
  allTokenLists: {},
  isTestMode: process.env.NODE_ENV === 'test',
  activeListKeys: [uris.Balancer.Allowlisted],
}

export const fetchTokenLists = createAsyncThunk('tokenLists/fetchTokenLists', async (_, thunkAPI) => {
  const tokensListPromise = import(`assets/data/tokenlists/tokens-${chainId}.json`)

  const module = await tokensListPromise

  const tokenLists = module.default as TokenListMap

  const result = filterTokensList(tokenLists, chainId)

  thunkAPI.dispatch(fetchTokensFromListTokens(result))

  return result
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
