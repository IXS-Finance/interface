import { useCallback, useEffect, useMemo } from 'react'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { Percent, Token } from '@ixswap1/sdk-core'
import { Pair } from '@ixswap1/v2-sdk'
import { t } from '@lingui/macro'
import JSBI from 'jsbi'
import flatMap from 'lodash.flatmap'
import { useQueryClient } from '@tanstack/react-query'

import { ERROR_ACCREDITATION_STATUSES } from 'components/Vault/enum'
import { IXS_ADDRESS, IXS_GOVERNANCE_ADDRESS } from 'constants/addresses'
import { SupportedLocale } from 'constants/locales'
import useIXSCurrency from 'hooks/useIXSCurrency'
import apiService from 'services/apiService'
import { auth, broker, kyc, tokens } from 'services/apiUrls'
import { useChooseBrokerDealerModalToggle, useShowError } from 'state/application/hooks'
import { LOGIN_STATUS, useLogin, useUserisLoggedIn } from 'state/auth/hooks'
import { useAuthState } from 'state/auth/hooks'
import { useKYCState } from 'state/kyc/hooks'
import { WrappedTokenInfo } from 'state/lists/wrappedTokenInfo'
import {
  listToSecTokenMap,
  SecTokenAddressMap,
  useAccreditationStatus,
  useSecToken,
  useSecTokensFromMap,
} from 'state/secTokens/hooks'
import { clearSwapState } from 'state/swap/actions'
import { clearSwapHelperState } from 'state/swapHelper/actions'
import { useSimpleTokenBalanceWithLoading } from 'state/wallet/hooks'
import { SecToken } from 'types/secToken'
import { KYCStatuses } from 'pages/KYC/enum'
import { routes } from 'utils/routes'

import { BASES_TO_TRACK_LIQUIDITY_FOR, PINNED_PAIRS } from '../../constants/routing'
import { useAllTokens, useCurrency } from '../../hooks/Tokens'
import { useActiveWeb3React } from '../../hooks/web3'
import { AppDispatch, AppState } from '../index'
import {
  addSerializedPair,
  addSerializedToken,
  fetchUserSecTokenList,
  passAccreditation,
  removeSerializedToken,
  saveAccount,
  SerializedPair,
  SerializedToken,
  toggleURLWarning,
  updateUserDarkMode,
  updateUserDeadline,
  updateUserExpertMode,
  updateUserLocale,
  updateUserSingleHopOnly,
  updateUserSlippageTolerance,
  getMe,
} from './actions'
import { ROLES } from 'constants/roles'
import { setWalletState } from 'state/wallet'

function serializeToken(token: Token): SerializedToken {
  // TO DO - refactor
  return token as SerializedToken

  // return {
  //   chainId: token.chainId,
  //   address: token.address,
  //   decimals: token.decimals,
  //   symbol: token.symbol,
  //   name: token.name,
  // }
}

function deserializeToken(serializedToken: SerializedToken): Token {
  // TO DO - refactor

  if (!serializedToken.tokenInfo) {
    return new Token(
      serializedToken.chainId,
      serializedToken.address,
      serializedToken.decimals,
      serializedToken.symbol,
      serializedToken.name
    )
  }

  return new WrappedTokenInfo(serializedToken.tokenInfo, serializedToken.list)
}

export function useIsDarkMode(): boolean {
  const { userDarkMode, matchesDarkMode } = useSelector<
    AppState,
    { userDarkMode: boolean | null; matchesDarkMode: boolean }
  >(
    ({ user: { matchesDarkMode, userDarkMode } }) => ({
      userDarkMode,
      matchesDarkMode,
    }),
    shallowEqual
  )

  return userDarkMode === null ? matchesDarkMode : userDarkMode
}

export function useDarkModeManager(): [boolean, () => void] {
  const dispatch = useDispatch<AppDispatch>()
  const darkMode = useIsDarkMode()

  const toggleSetDarkMode = useCallback(() => {
    dispatch(updateUserDarkMode({ userDarkMode: !darkMode }))
  }, [darkMode, dispatch])

  return [darkMode, toggleSetDarkMode]
}

export function useUserLocale(): SupportedLocale | null {
  return useSelector<AppState, AppState['user']['userLocale']>((state) => state.user.userLocale)
}
export function useUserSecTokenState(): SecToken[] | null {
  return useSelector<AppState, AppState['user']['userSecTokens']>((state) => state.user.userSecTokens)
}
export function useUserAccountState(): string {
  return useSelector<AppState, AppState['user']['account']>((state) => state.user.account)
}
export function useUserSecTokenLoading(): boolean {
  return useSelector<AppState, AppState['user']['loadingSecTokenRequest']>((state) => state.user.loadingSecTokenRequest)
}
export function useGetSecTokenAuthorization() {
  return useSelector<AppState, AppState['user']['secTokenAuthorizations']>((state) => state.user.secTokenAuthorizations)
}
export function useUserState() {
  return useSelector<AppState, AppState['user']>((state) => state.user)
}
export function useUserLocaleManager(): [SupportedLocale | null, (newLocale: SupportedLocale) => void] {
  const dispatch = useDispatch<AppDispatch>()
  const locale = useUserLocale()

  const setLocale = useCallback(
    (newLocale: SupportedLocale) => {
      dispatch(updateUserLocale({ userLocale: newLocale }))
    },
    [dispatch]
  )

  return [locale, setLocale]
}

export function useIsExpertMode(): boolean {
  return useSelector<AppState, AppState['user']['userExpertMode']>((state) => state.user.userExpertMode)
}

export function useExpertModeManager(): { expertMode: boolean; toggleExpertMode: () => void } {
  const dispatch = useDispatch<AppDispatch>()
  const expertMode = useIsExpertMode()

  const toggleSetExpertMode = useCallback(() => {
    dispatch(updateUserExpertMode({ userExpertMode: !expertMode }))
  }, [expertMode, dispatch])

  return { expertMode, toggleExpertMode: toggleSetExpertMode }
}

export function useUserSingleHopOnly(): [boolean, (newSingleHopOnly: boolean) => void] {
  const dispatch = useDispatch<AppDispatch>()

  const singleHopOnly = useSelector<AppState, AppState['user']['userSingleHopOnly']>(
    (state) => state.user.userSingleHopOnly
  )

  const setSingleHopOnly = useCallback(
    (newSingleHopOnly: boolean) => {
      dispatch(updateUserSingleHopOnly({ userSingleHopOnly: newSingleHopOnly }))
    },
    [dispatch]
  )

  return [singleHopOnly, setSingleHopOnly]
}

export function useSetUserSlippageTolerance(): (slippageTolerance: Percent | 'auto') => void {
  const dispatch = useDispatch<AppDispatch>()

  return useCallback(
    (userSlippageTolerance: Percent | 'auto') => {
      let value: 'auto' | number
      try {
        value =
          userSlippageTolerance === 'auto' ? 'auto' : JSBI.toNumber(userSlippageTolerance.multiply(10_000).quotient)
      } catch (error) {
        value = 'auto'
      }
      dispatch(
        updateUserSlippageTolerance({
          userSlippageTolerance: value,
        })
      )
    },
    [dispatch]
  )
}

/**
 * Return the user's slippage tolerance, from the redux store, and a function to update the slippage tolerance
 */
export function useUserSlippageTolerance(): Percent | 'auto' {
  const userSlippageTolerance = useSelector<AppState, AppState['user']['userSlippageTolerance']>((state) => {
    return state.user.userSlippageTolerance
  })

  return useMemo(
    () => (userSlippageTolerance === 'auto' ? 'auto' : new Percent(userSlippageTolerance, 10_000)),
    [userSlippageTolerance]
  )
}

/**
 * Same as above but replaces the auto with a default value
 * @param defaultSlippageTolerance the default value to replace auto with
 */
export function useUserSlippageToleranceWithDefault(defaultSlippageTolerance: Percent): Percent {
  const allowedSlippage = useUserSlippageTolerance()
  return useMemo(
    () => (allowedSlippage === 'auto' ? defaultSlippageTolerance : allowedSlippage),
    [allowedSlippage, defaultSlippageTolerance]
  )
}

export function useUserTransactionTTL(): [number, (slippage: number) => void] {
  const dispatch = useDispatch<AppDispatch>()
  const userDeadline = useSelector<AppState, AppState['user']['userDeadline']>((state) => {
    return state.user.userDeadline
  })

  const setUserDeadline = useCallback(
    (userDeadline: number) => {
      dispatch(updateUserDeadline({ userDeadline }))
    },
    [dispatch]
  )

  return [userDeadline, setUserDeadline]
}

export function useAddUserToken(): (token: Token) => void {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback(
    (token: Token) => {
      dispatch(addSerializedToken({ serializedToken: serializeToken(token) }))
    },
    [dispatch]
  )
}

export function useRemoveUserAddedToken(): (chainId: number, address: string) => void {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback(
    (chainId: number, address: string) => {
      dispatch(removeSerializedToken({ chainId, address }))
    },
    [dispatch]
  )
}

export function useUserAddedTokens(): Token[] {
  const { chainId } = useActiveWeb3React()
  const serializedTokensMap = useSelector<AppState, AppState['user']['tokens']>(({ user: { tokens } }) => tokens)

  return useMemo(() => {
    if (!chainId) return []
    return Object.values(serializedTokensMap?.[chainId] ?? {}).map(deserializeToken)
  }, [serializedTokensMap, chainId])
}

function serializePair(pair: Pair): SerializedPair {
  return {
    token0: serializeToken(pair.token0),
    token1: serializeToken(pair.token1),
  }
}

export function usePairAdder(): (pair: Pair) => void {
  const dispatch = useDispatch<AppDispatch>()

  return useCallback(
    (pair: Pair) => {
      dispatch(addSerializedPair({ serializedPair: serializePair(pair) }))
    },
    [dispatch]
  )
}

export function useURLWarningVisible(): boolean {
  return useSelector((state: AppState) => state.user.URLWarningVisible)
}

export function useURLWarningToggle(): () => void {
  const dispatch = useDispatch()
  return useCallback(() => dispatch(toggleURLWarning()), [dispatch])
}

/**
 * Given two tokens return the liquidity token that represents its liquidity shares
 * @param tokenA one of the two tokens
 * @param tokenB the other token
 */
export function toV2LiquidityToken([tokenA, tokenB]: [Token, Token]): Token {
  return new Token(tokenA.chainId, Pair.getAddress(tokenA, tokenB), 18, 'IXS-V2', 'IXSwap V2')
}

/**
 * Returns all the pairs of tokens that are tracked by the user for the current chain ID.
 */
export function useTrackedTokenPairs(): [Token, Token][] {
  const { chainId } = useActiveWeb3React()
  const tokens = useAllTokens()

  // pinned pairs
  const pinnedPairs = useMemo(() => (chainId ? PINNED_PAIRS[chainId] ?? [] : []), [chainId])

  // pairs for every token against every base
  const generatedPairs: [Token, Token][] = useMemo(
    () =>
      chainId
        ? flatMap(Object.keys(tokens), (tokenAddress) => {
            const token = tokens[tokenAddress]
            // for each token on the current chain,
            return (
              // loop though all bases on the current chain
              (BASES_TO_TRACK_LIQUIDITY_FOR[chainId] ?? [])
                // to construct pairs of the given token with each base
                .map((base) => {
                  if (base.address === token.address) {
                    return null
                  } else {
                    return [base, token]
                  }
                })
                .filter((p): p is [Token, Token] => p !== null)
            )
          })
        : [],
    [tokens, chainId]
  )

  // pairs saved by users
  const savedSerializedPairs = useSelector<AppState, AppState['user']['pairs']>(({ user: { pairs } }) => pairs)

  const userPairs: [Token, Token][] = useMemo(() => {
    if (!chainId || !savedSerializedPairs) return []
    const forChain = savedSerializedPairs[chainId]
    if (!forChain) return []

    return Object.keys(forChain).map((pairId) => {
      return [deserializeToken(forChain[pairId].token0), deserializeToken(forChain[pairId].token1)]
    })
  }, [savedSerializedPairs, chainId])

  const combinedList = useMemo(
    () => userPairs.concat(generatedPairs).concat(pinnedPairs),
    [generatedPairs, pinnedPairs, userPairs]
  )

  return useMemo(() => {
    // dedupes pairs of tokens in the combined list
    const keyed = combinedList.reduce<{ [key: string]: [Token, Token] }>((memo, [tokenA, tokenB]) => {
      const sorted = tokenA?.sortsBefore?.(tokenB)
      const key = sorted ? `${tokenA.address}:${tokenB.address}` : `${tokenB.address}:${tokenA.address}`
      if (memo[key]) return memo
      memo[key] = sorted ? [tokenA, tokenB] : [tokenB, tokenA]
      return memo
    }, {})

    return Object.keys(keyed).map((key) => keyed[key])
  }, [combinedList])
}

export const getUserSecTokensList = async () => {
  const result = await apiService.get(tokens.fromUser)
  return result.data
}

const listCache: WeakMap<SecToken[], SecTokenAddressMap> | null =
  typeof WeakMap !== 'undefined' ? new WeakMap<SecToken[], SecTokenAddressMap>() : null

export const useUserSecTokens = () => {
  const userSecTokens = useUserSecTokenState()
  const secMap = listToSecTokenMap(listCache, userSecTokens)
  const secTokens = useSecTokensFromMap(secMap)
  return { secTokens }
}

export const useAccreditedToken = ({ currencyId }: { currencyId?: string }) => {
  const { secTokens } = useUserSecTokens()
  const secToken = useSecToken({ currencyId })
  const currency = useCurrency(currencyId)
  return useMemo(() => {
    if (currencyId && currency && secToken && !secTokens[currencyId]) {
      return undefined
    }
    return currency
  }, [currencyId, secTokens, secToken, currency])
}

export const useIXSBalance = () => {
  const { account, chainId } = useActiveWeb3React()
  const currency = useIXSCurrency()
  const balance = useSimpleTokenBalanceWithLoading(account, currency, IXS_ADDRESS[chainId ?? 1])
  return balance
}

export const useIXSGovBalance = () => {
  const { account, chainId } = useActiveWeb3React()
  const currency = useCurrency(IXS_GOVERNANCE_ADDRESS[chainId ?? 1])

  const balance = useSimpleTokenBalanceWithLoading(account, currency, IXS_GOVERNANCE_ADDRESS[chainId ?? 1])
  return balance
}

export function useFetchUserSecTokenListCallback(): (sendDispatch?: boolean) => Promise<SecToken[]> {
  const dispatch = useDispatch<AppDispatch>()

  // note: prevent dispatch if using for list search or unsupported list
  return useCallback(
    async (sendDispatch = true) => {
      sendDispatch && dispatch(fetchUserSecTokenList.pending())
      return getUserSecTokensList()
        .then((tokenList) => {
          sendDispatch && dispatch(fetchUserSecTokenList.fulfilled({ tokenList }))
          return tokenList
        })
        .catch((error) => {
          sendDispatch && dispatch(fetchUserSecTokenList.rejected({ errorMessage: error.message }))
          throw error
        })
    },
    [dispatch]
  )
}

export const postPassAccreditation = async ({ tokenId, isKyc }: { tokenId: number; isKyc: boolean }) => {
  const result = await apiService.post(kyc.getAccreditation(tokenId, isKyc), {})
  return result.data
}

export const restartAccreditation = async ({ accreditationId }: { accreditationId: number }) => {
  const result = await apiService.post(kyc.restartAccreditation(accreditationId), {})
  return result.data
}

export const chooseBrokerDealer = async ({ pairId }: { pairId: number }) => {
  const result = await apiService.post(broker.choose(pairId), {})
  return result.data
}

export function usePassAccreditation(
  currencyId?: string,
  onSuccess?: () => void
): (tokenId: number, brokerDealerPairId: number, isKyc: boolean) => Promise<void> {
  const dispatch = useDispatch<AppDispatch>()
  const login = useLogin({ mustHavePreviousLogin: false })
  const fetchTokens = useFetchUserSecTokenListCallback()
  const toggle = useChooseBrokerDealerModalToggle()
  const showError = useShowError()
  const { brokerDealerStatus, custodianStatus, accreditationRequest } = useAccreditationStatus(currencyId)
  // note: prevent dispatch if using for list search or unsupported list
  return useCallback(
    async (tokenId: number, brokerDealerPairId: number, isKyc: boolean) => {
      dispatch(passAccreditation.pending())
      try {
        const status = await login()
        if (status === LOGIN_STATUS.SUCCESS) {
          await chooseBrokerDealer({ pairId: brokerDealerPairId })
          if (
            accreditationRequest &&
            (ERROR_ACCREDITATION_STATUSES.includes(brokerDealerStatus) ||
              ERROR_ACCREDITATION_STATUSES.includes(custodianStatus))
          ) {
            await restartAccreditation({ accreditationId: accreditationRequest.id })
          }
          await postPassAccreditation({ tokenId, isKyc })
        } else {
          showError(`Could not get accredited because of login. Please try again`)
          dispatch(passAccreditation.rejected({ errorMessage: 'Could not get accredited because of login.' }))
          return
        }
        await fetchTokens()
        dispatch(passAccreditation.fulfilled())
        toggle()
        onSuccess && onSuccess()
      } catch (error) {
        showError(`Failed to pass accreditation ${String((error as any)?.message)}`)
        dispatch(passAccreditation.rejected({ errorMessage: String((error as any)?.message) }))
      }
    },
    [
      dispatch,
      login,
      fetchTokens,
      toggle,
      showError,
      accreditationRequest,
      brokerDealerStatus,
      custodianStatus,
      onSuccess,
    ]
  )
}

export function useAccount() {
  const savedAccount = useUserAccountState()
  const { account } = useActiveWeb3React()
  const dispatch = useDispatch<AppDispatch>()
  const login = useLogin({ mustHavePreviousLogin: true })
  const getUserSecTokens = useFetchUserSecTokenListCallback()
  const isLoggedIn = useUserisLoggedIn()
  const queryClient = useQueryClient()

  const { loginError, token } = useAuthState()

  //when there is an authorization error, then we clear the contents of the savedAccount
  const checkAuthError = useCallback(() => {
    if (loginError) {
      dispatch(saveAccount({ account: '' }))
    }
  }, [loginError, dispatch])

  const authenticate = useCallback(async () => {
    try {
      dispatch(setWalletState({ isSignLoading: true }))
      const status = await login(true)
      if (status == LOGIN_STATUS.SUCCESS && isLoggedIn) {
        getUserSecTokens()
      }
    } catch (error) {
      console.error(error)
    } finally {
      dispatch(setWalletState({ isSignLoading: false }))
    }
  }, [login, getUserSecTokens, isLoggedIn, queryClient, account])

  useEffect(() => {
    const timerFunc = setTimeout(checkAuthError, 20000)

    return () => clearTimeout(timerFunc)
  }, [checkAuthError])

  useEffect(() => {
    if (account && account !== savedAccount) {
      localStorage.removeItem('Disclaimer')
      localStorage.removeItem('SDisclaimer')
      localStorage.removeItem('referralCode')
      dispatch(saveAccount({ account }))
      dispatch(clearSwapState())
      dispatch(clearSwapHelperState())
    }
  }, [account, savedAccount, dispatch])

  useEffect(() => {
    if (token) {
      getUserSecTokens()
    }
  }, [token, getUserSecTokens, queryClient, account])

  return { authenticate }
}

export const me = async () => {
  const result = await apiService.get(auth.me)
  return result.data
}

export function useGetMe() {
  const { account } = useActiveWeb3React()
  const queryClient = useQueryClient()
  const dispatch = useDispatch<AppDispatch>()
  const callback = useCallback(async () => {
    try {
      dispatch(getMe.pending())
      const data = await me()
      dispatch(getMe.fulfilled({ data }))
      return data
    } catch (error: any) {
      dispatch(getMe.rejected({ errorMessage: 'Could not get me' }))
      return null
    }
  }, [dispatch, queryClient, account])
  return callback
}

export const useRawRole = () => {
  const { me } = useUserState()
  return me?.role as ROLES
}

export const useRole = () => {
  const role = useRawRole()
  return useMemo(
    () => ({
      isAdmin: role === ROLES.ADMIN,
      isOperator: role === ROLES.OPERATOR,
      isTokenManager: role === ROLES.TOKEN_MANAGER,
      isOfferManager: role === ROLES.OFFER_MANAGER,
      isUser: role === ROLES.USER,
      isMasterTenant: role === ROLES.MASTER_TENANT,
    }),
    [role]
  )
}

export const useKyc = () => {
  const { kyc } = useKYCState()
  const status = kyc?.status
  return {
    isCorporate: Boolean(kyc?.corporate),
    isIndividual: Boolean(kyc?.individual),
    isAccredited: Boolean(kyc?.individual?.accredited || kyc?.corporate?.accredited),
    isApproved: status === KYCStatuses.APPROVED,
    isRejected: status === KYCStatuses.REJECTED,
    isChangeRequested: status === KYCStatuses.CHANGES_REQUESTED,
    isPending: status === KYCStatuses.PENDING,
    isNotSubmitted: status === KYCStatuses.NOT_SUBMITTED || status === undefined,
    isDraft: status === KYCStatuses.DRAFT,
    isInProgress: status === KYCStatuses.IN_PROGRESS,
  }
}
