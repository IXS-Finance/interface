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

const initialState: TokenListsState = {
  allTokenLists: {},
  isTestMode: process.env.NODE_ENV === 'test',
  activeListKeys: [uris.Balancer.Allowlisted],
}

const tokenListsSlice = createSlice({
  name: 'tokenLists',
  initialState,
  reducers: {},
})

export const {} = tokenListsSlice.actions

export default tokenListsSlice.reducer
