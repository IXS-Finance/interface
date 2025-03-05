// src/store/tokenListsSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { getChainId } from '@wagmi/core'

import { TokenListMap } from 'types/TokenList'
import { wagmiConfig } from 'components/Web3Provider'
import { tokenListService } from 'services/token-list/token-list.service'

interface TokenListsState {
  allTokenLists: TokenListMap
  isTestMode: boolean
  activeListKeys: string[]
}

const { uris } = tokenListService
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

export const fetchTokenLists = createAsyncThunk('tokenLists/fetchTokenLists', async () => {
  const tokensListPromise = import(`assets/data/tokenlists/tokens-${chainId}.json`)

  const module = await tokensListPromise

  const tokenLists = module.default as TokenListMap
  return filterTokensList(tokenLists, chainId)
})

const initialState: TokenListsState = {
  allTokenLists: {},
  isTestMode: process.env.NODE_ENV === 'test',
  activeListKeys: [uris.Balancer.Allowlisted],
}

const tokenListsSlice = createSlice({
  name: 'tokenLists',
  initialState,
  reducers: {
    setTokenListsState(state, action) {
      return { ...state, ...action.payload }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchTokenLists.fulfilled, (state, action) => {
      state.allTokenLists = action.payload
    })
  },
})

export const { setTokenListsState } = tokenListsSlice.actions

export default tokenListsSlice.reducer
