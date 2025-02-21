import { pick } from 'lodash'

// import localStorageKeys from 'constants/local-storage.keys'
// import { lsSet } from 'lib/utils'
import TokenListService, { tokenListService } from 'services/token-list/token-list.service'
import { TokenList, TokenListMap } from 'types/TokenList'
import useNetwork from 'hooks/dex-v2/useNetwork'
import { useTokenListsState } from './hooks'
import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { setTokenListsState } from '.'

/** TYPES */
export interface TokenListsState {
  activeListKeys: string[]
}

const useTokenLists = () => {
  const { uris } = tokenListService
  const { networkId } = useNetwork()
  const dispatch = useDispatch()

  /**
   * STATE
   */
  const state = useTokenListsState()

  const tokensListPromise = import(`assets/data/tokenlists/tokens-${networkId}.json`)

  /**
   * All active (toggled) tokenlists
   */
  const activeTokenLists: TokenListMap = pick(state.allTokenLists, state.activeListKeys)

  /**
   * All allowlisted tokens from tokenlists repo
   */
  const balancerTokenList: TokenList = state.allTokenLists[uris.Balancer.Allowlisted]

  /**
   * All Balancer token lists mapped by URI.
   */
  const balancerTokenLists: TokenListMap = pick(state.allTokenLists, uris.Balancer.All)

  /**
   * Approved token lists mapped by URI.
   * Approved means tokens are compliant and can be presented in the UI.
   * This excludes lists like the Balancer vetted list.
   */
  const approvedTokenLists: TokenListMap = pick(state.allTokenLists, uris.Approved)
  /**
   * Adds a token list to the active lists which
   * makes additonal tokens available in the token search modal.
   */
  function toggleTokenList(uri: string): void {
    if (!uris.Approved.includes(uri)) return

    if (state.activeListKeys.includes(uri)) {
      // Deactivate token list
      state.activeListKeys.splice(state.activeListKeys.indexOf(uri), 1)
    } else {
      // Activate token list
      state.activeListKeys.push(uri)
    }

    // lsSet(localStorageKeys.TokenLists.Toggled, state.activeListKeys)
  }

  /**
   * Given a token list URI checks if the related token
   * list has been toggled via the token search modal.
   */
  function isActiveList(uri: string): boolean {
    return state.activeListKeys.includes(uri)
  }

  useEffect(() => {
    const getData = async () => {
      const module = await tokensListPromise
      const tokenLists = module.default as TokenListMap

      // filter token lists by network id
      dispatch(setTokenListsState({ allTokenLists: TokenListService.filterTokensList(tokenLists, networkId) }))
    }

    if (networkId) {
      getData()
    }
  }, [networkId])

  return {
    // state
    ...state,
    tokensListPromise,
    // computed
    activeTokenLists,
    balancerTokenLists,
    approvedTokenLists,
    balancerTokenList,
    // methods
    toggleTokenList,
    isActiveList,
  }
}

export default useTokenLists
