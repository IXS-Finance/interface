import { pick } from 'lodash'

// import localStorageKeys from 'constants/local-storage.keys'
// import { lsSet } from 'lib/utils'
import TokenListService, { tokenListService } from 'services/token-list/token-list.service'
import { TokenList, TokenListMap } from 'types/TokenList'
import useNetwork from 'hooks/dex-v2/useNetwork'
import { useTokenListsState } from './hooks'
import { useEffect, useMemo, useState } from 'react'

/** TYPES */
export interface TokenListsState {
  activeListKeys: string[]
}

const useTokenLists = () => {
  const { uris } = tokenListService
  const { networkId } = useNetwork()

  /**
   * STATE
   */
  const state = useTokenListsState()
  const [allTokenLists, setAllTokenLists] = useState<any>({})

  const tokensListPromise = import(`assets/data/tokenlists/tokens-${networkId}.json`)

  /**
   * All active (toggled) tokenlists
   */
  const activeTokenLists = useMemo(
    (): TokenListMap => pick(allTokenLists, state.activeListKeys),
    [JSON.stringify(allTokenLists), JSON.stringify(state.activeListKeys)]
  )

  /**
   * All allowlisted tokens from tokenlists repo
   */
  const balancerTokenList = useMemo(
    (): TokenList => allTokenLists[uris.Balancer.Allowlisted],
    [JSON.stringify(allTokenLists)]
  )

  /**
   * All Balancer token lists mapped by URI.
   */
  const balancerTokenLists = useMemo(
    (): TokenListMap => pick(allTokenLists, uris.Balancer.All),
    [JSON.stringify(allTokenLists), JSON.stringify(uris.Balancer.All)]
  )

  /**
   * Approved token lists mapped by URI.
   * Approved means tokens are compliant and can be presented in the UI.
   * This excludes lists like the Balancer vetted list.
   */
  const approvedTokenLists = useMemo(
    (): TokenListMap => pick(allTokenLists, uris.Approved),
    [JSON.stringify(allTokenLists)]
  )

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
      setAllTokenLists(TokenListService.filterTokensList(tokenLists, networkId))
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
    allTokenLists,
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
