// src/store/tokenListsSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { getChainId } from '@wagmi/core'
import { getAddress } from '@ethersproject/address'

import { TokenInfoMap, TokenListMap, TokenInfo } from 'types/TokenList'
import { wagmiConfig } from 'components/Web3Provider'
import { tokenListService } from 'services/token-list/token-list.service'
import { networkConfig } from 'hooks/dex-v2/useNetwork'

interface TokenListsState {
  allTokenLists: TokenListMap
  isTestMode: boolean
  activeListKeys: string[]
  allTokens: TokenInfoMap
}

const { uris } = tokenListService

/**
 * METHODS
 */
/**
 * Create token map from a token list tokens array.const isEmpty = Object.keys(person).length === 0;
 */
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
    acc[address.toLowerCase()] = token
    return acc
  }, {})

  return tokensMap
}

export const fetchTokenLists = createAsyncThunk('tokenLists/fetchTokenLists', async () => {
  const data: any = await tokenListService.get(
    `https://raw.githubusercontent.com/IX-Swap/ixs-tokenlist-v2/refs/heads/master/baseSepolia.json`
  )
  const allTokens = mapTokens([...data.cryptos, ...data.rwas])

  return allTokens
})

const initialState: TokenListsState = {
  allTokenLists: {},
  isTestMode: process.env.NODE_ENV === 'test',
  activeListKeys: [uris.Balancer.Allowlisted],
  allTokens: {},
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
