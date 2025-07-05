import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { getChainId } from '@wagmi/core'
import { getAddress } from '@ethersproject/address'

import { TokenInfoMap, TokenInfo } from 'types/TokenList'
import { wagmiConfig } from 'components/Web3Provider'
import { networkConfig } from 'hooks/dex-v2/useNetwork'

interface TokenListsState {
  isTestMode: boolean
  allTokens: TokenInfoMap
}


function mapTokens(allTokens: TokenInfo[]): TokenInfoMap {
  const isEmpty = allTokens.length === 0
  if (isEmpty) return {}

  const tokens: TokenInfo[] = allTokens

  const tokensMap = tokens.reduce<TokenInfoMap>((acc, token) => {
    const address: string = getAddress(token.address)

    // Don't include if already included
    if (acc[address]) return acc

    // Don't include if not on app network
    if (token.chainId !== networkConfig.chainId) return acc

    acc[address] = token
    return acc
  }, {})

  return tokensMap
}

export const fetchTokenLists = createAsyncThunk('tokenLists/fetchTokenLists', async () => {
  const chainId = getChainId(wagmiConfig)
  const tokensListPromise = import(`assets/data/tokenlists/tokens-${chainId}.json`)
  const module = await tokensListPromise
  const tokenLists = module.default
  const allTokens = mapTokens(tokenLists)

  return allTokens
})

const initialState: TokenListsState = {
  allTokens: {},
  isTestMode: process.env.NODE_ENV === 'test',
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
      state.allTokens = action.payload
    })
  },
})

export const { setTokenListsState } = tokenListsSlice.actions

export default tokenListsSlice.reducer
