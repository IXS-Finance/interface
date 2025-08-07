import { Token } from '@ixswap1/sdk-core'
import { AccreditationRequest, AccreditationStatusEnum } from 'components/Vault/enum'
import { useActiveWeb3React } from 'hooks/web3'
import { useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import apiService from 'services/apiService'
import { tokens } from 'services/apiUrls'
import { AppDispatch, AppState } from 'state'
import { WrappedTokenInfo } from 'state/lists/wrappedTokenInfo'
import { useUserSecTokens } from 'state/user/hooks'
import { SecToken } from 'types/secToken'
import { fetchSecTokenList } from './actions'

export function useSecTokenState(): AppState['secTokens'] {
  return useSelector<AppState, AppState['secTokens']>((state) => state.secTokens)
}

export const getSecTokensList = async () => {
  try {
    const result = await apiService.get(tokens.all)
    return result?.data || []
  } catch (error) {
    console.error('Failed to fetch sec tokens list:', error)
    return []
  }
}
export const useIsSecToken = (address?: string) => {
  const { secTokens } = useSecTokens()
  return useMemo(() => Boolean(address && Boolean(secTokens[address])), [address, secTokens])
}

export const isSecurityPair = ({
  token0,
  token1,
  secTokens,
}: {
  token0: Token | undefined
  token1: Token | undefined
  secTokens: { [address: string]: Token }
}) => {
  if (!token0 || !token1) {
    return false
  }
  return Boolean(secTokens[token0.address] || secTokens[token1.address])
}
export const useAreBothSecTokens = ({ address0, address1 }: { address0?: string; address1?: string }) => {
  const sec0 = useIsSecToken(address0)
  const sec1 = useIsSecToken(address1)
  return useMemo(() => sec0 && sec1, [sec0, sec1])
}
export const useSecTokenId = ({ currencyId }: { currencyId?: string }): number | undefined => {
  const { secTokens } = useSecTokens()
  const token = secTokens[currencyId ?? '']

  return (token as any)?.tokenInfo?.id
}

export const useSecToken = ({ currencyId }: { currencyId?: string }): SecToken | undefined => {
  const { secTokens } = useSecTokens()
  const token = secTokens[currencyId ?? '']

  return token as any
}

export const useSecTokenById = (id?: number): SecToken | undefined => {
  const { tokens } = useSecTokenState()

  const token = (tokens || []).find((token) => token.id === id)

  return token
}

const listCache: WeakMap<SecToken[], SecTokenAddressMap> | null =
  typeof WeakMap !== 'undefined' ? new WeakMap<SecToken[], SecTokenAddressMap>() : null

export const useSecTokens = () => {
  const { tokens } = useSecTokenState()
  const secMap = listToSecTokenMap(listCache, tokens)
  const secTokens = useSecTokensFromMap(secMap)

  return { secTokens }
}

export const useAllSecTokens = () => {
  const { tokens } = useSecTokenState()
  const secMap = listToSecTokenMap(listCache, tokens)
  const secTokens = useAllSecTokensFromMap(secMap)

  return { secTokens }
}

export function useFetchSecTokenListCallback(): (sendDispatch?: boolean) => Promise<SecToken[]> {
  const dispatch = useDispatch<AppDispatch>()

  // note: prevent dispatch if using for list search or unsupported list
  return useCallback(
    async (sendDispatch = true) => {
      sendDispatch && dispatch(fetchSecTokenList.pending())
      return getSecTokensList()
        .then((tokenList) => {
          sendDispatch && dispatch(fetchSecTokenList.fulfilled({ tokenList }))
          return tokenList
        })
        .catch((error) => {
          sendDispatch && dispatch(fetchSecTokenList.rejected({ errorMessage: error.message }))
          throw error
        })
    },
    [dispatch]
  )
}

export type SecTokenAddressMap = {
  readonly [x: number]: Readonly<{
    [tokenAddress: string]: {
      token: WrappedTokenInfo
    }
  }>
}

export function listToSecTokenMap(
  cache: WeakMap<SecToken[], SecTokenAddressMap> | null,
  list?: null | SecToken[]
): SecTokenAddressMap {
  if (!list) return {}
  const result = cache?.get(list)
  if (result) return result
  const map = list.reduce<SecTokenAddressMap>((tokenMap, tokenInfo) => {
    const token = new WrappedTokenInfo(tokenInfo, undefined)

    if (!token.address) {
      return tokenMap
    }

    if (tokenMap[token?.chainId]?.[token?.address] !== undefined) {
      console.error(new Error(`Duplicate token! ${token?.address}`))
      return tokenMap
    }
    return {
      ...tokenMap,
      [token.chainId]: {
        ...tokenMap[token.chainId],
        [token.address]: {
          token,
          list,
          platform: tokenInfo.platform,
        },
      },
    }
  }, {})
  cache?.set(list, map)
  return map
}

// reduce token map into standard address <-> Token mapping, optionally include user added tokens
export function useSecTokensFromMap(tokenMap: SecTokenAddressMap): { [address: string]: WrappedTokenInfo } {
  const { chainId } = useActiveWeb3React()

  return useMemo(() => {
    if (!tokenMap || chainId === undefined) return {}
    if (!tokenMap[chainId]) return {}
    // reduce to just tokens
    const mapWithoutUrls = Object.keys(tokenMap[chainId]).reduce<{ [address: string]: WrappedTokenInfo }>(
      (newMap, address) => {
        newMap[address] = tokenMap[chainId][address].token
        return newMap
      },
      {}
    )

    return mapWithoutUrls
  }, [tokenMap, chainId])
}


export function useAllSecTokensFromMap(tokenMap: SecTokenAddressMap): { [address: string]: WrappedTokenInfo } {
  return useMemo(() => {
    if (!tokenMap) return {}

    // Accumulate tokens across all chains
    const allTokens = Object.keys(tokenMap).reduce<{ [address: string]: WrappedTokenInfo }>((accumulatedTokens, chainId) => {
      const tokensForChain = tokenMap[chainId as unknown as keyof SecTokenAddressMap];

      if (tokensForChain) {
        Object.keys(tokensForChain).forEach((address) => {
          accumulatedTokens[address] = tokensForChain[address].token;
        });
      }

      return accumulatedTokens;
    }, {});

    return allTokens;
  }, [tokenMap]);
}


export function useAccreditationStatus(currencyId?: string) {
  const { secTokens: userSecTokens } = useUserSecTokens()
  const { secTokens } = useSecTokens()
  const token = userSecTokens[currencyId ?? ''] ?? secTokens[currencyId ?? '']
  const tokenInfo = (token as any)?.tokenInfo

  return useMemo(() => {
    const accreditationRequest: AccreditationRequest | null = tokenInfo?.accreditationRequest || null
    const isApproved =
      accreditationRequest?.custodianStatus === AccreditationStatusEnum.APPROVED &&
      accreditationRequest?.brokerDealerStatus === AccreditationStatusEnum.APPROVED
    const platform = tokenInfo?.platform || null

    return {
      isApproved,
      accreditationRequest,
      platform,
      custodianStatus: accreditationRequest?.custodianStatus ?? '',
      brokerDealerStatus: accreditationRequest?.brokerDealerStatus ?? '',
      message: accreditationRequest?.message ?? '',
    }
  }, [tokenInfo?.accreditationRequest, tokenInfo?.platform])
}