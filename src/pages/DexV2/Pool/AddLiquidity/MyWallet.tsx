import React, { FC, useMemo } from 'react'
import { useParams } from 'react-router-dom'

import { useMyWallet } from './useMyWallet'
import BalCard from 'pages/DexV2/common/Card'
import { Box, Flex } from 'rebass'
import { useUserTokens } from 'state/dexV2/pool/useUserTokens'
import useNativeBalance from 'hooks/dex-v2/useNativeBalance'
import LoadingBlock from 'pages/DexV2/common/LoadingBlock'
import { configService } from 'services/config/config.service'
import AssetSet from 'pages/DexV2/common/AssetSet'
import { includesAddress } from 'lib/utils'
import { usePoolHelpers } from 'hooks/dex-v2/usePoolHelpers'
import { useSwapState } from 'state/dexV2/swap/useSwapState'

const MyWallet: FC = () => {
  const params = useParams<any>()
  const poolId = (params.id as string).toLowerCase()
  const networkName = configService.network.name
  const { setTokenInAddress } = useSwapState()
  const { handleMyWalletTokenClick, pool } = useMyWallet(poolId)
  const { poolJoinTokens, isDeepPool } = usePoolHelpers(pool)
  const { isLoadingBalances, tokensWithBalance, tokensWithBalanceFrom, tokensWithoutBalanceFrom } = useUserTokens()
  const { hasNativeBalance, nativeBalance, nativeCurrency } = useNativeBalance()

  const noTokensMessage = useMemo(() => {
    return `You don't have any tokens in your connected wallet on ${networkName}`
  }, [networkName])

  function handleAssetClick(tokenAddress: string) {
    setTokenInAddress(tokenAddress)
    const isPoolToken = includesAddress(poolJoinTokens, tokenAddress)
    handleMyWalletTokenClick(tokenAddress, isPoolToken)
  }

  return (
    <div>
      <BalCard noPad shadow="none" growContent>
        <Flex flexDirection="column" css={{ height: '100%', width: '100%' }}>
          <Flex
            justifyContent={['flex-start', 'space-between']}
            px={3}
            pt={3}
            pb={[0, 3]}
            css={{ borderBottom: '1px solid #EAF0F6' }}
          >
            <Box css={{ fontSize: 16, fontWeight: 700 }}>My Wallet</Box>
            {!isLoadingBalances ? (
              <>
                {!hasNativeBalance ? (
                  <Box
                    mr="0.125rem" // equivalent to Tailwind's mr-0.5 (0.125rem)
                    sx={{
                      color: '#ef4444', // Tailwind text-red-500
                      '&:hover': {
                        color: '#dc2626', // Tailwind hover:text-red-700
                      },
                    }}
                  >
                    {nativeBalance} {nativeCurrency}
                    {/* <BalTooltip
              v-if="isWalletReady"
              :text="
                isMainnet
                  ? noNativeCurrencyMessageEthereum
                  : noNativeCurrencyMessage
              "
              iconSize="sm"
              :iconName="'alert-triangle'"
              :iconClass="'text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors'"
              width="72"
              class="relative top-0.5"
            /> */}
                  </Box>
                ) : (
                  <div>
                    {nativeBalance} {nativeCurrency}
                  </div>
                )}
              </>
            ) : (
              <LoadingBlock className="w-12 h-8" />
            )}
          </Flex>

          <Box px={3} pb={3} height="100%" className="my-wallet" css={{ zIndex: 0 }}>
            {isLoadingBalances ? <LoadingBlock className="mt-4 h-8" /> : null}
            <div>
              {pool ? (
                <>
                  {isDeepPool ? (
                    <Box
                      sx={{
                        py: 2,
                        px: 3,
                        mx: -3,
                        border: '1px solid',
                        borderColor: '#E5E7EB',
                      }}
                    >
                      Pool tokens (lowest price impact)
                    </Box>
                  ) : null}

                  <Box mt="5px">
                    <AssetSet
                      balAssetProps={{ button: true }}
                      width={275}
                      wrap
                      size={30}
                      addresses={[
                        ...tokensWithBalanceFrom(poolJoinTokens),
                        ...tokensWithoutBalanceFrom(poolJoinTokens),
                      ]}
                      disabledAddresses={tokensWithoutBalanceFrom(poolJoinTokens)}
                      maxAssetsPerLine={7}
                      onClick={handleAssetClick}
                    />
                  </Box>
                </>
              ) : (
                <Box mt="3px">
                  <AssetSet
                    balAssetProps={{ button: true }}
                    width={275}
                    wrap
                    size={30}
                    addresses={tokensWithBalance}
                    maxAssetsPerLine={7}
                    onClick={handleAssetClick}
                  />
                </Box>
              )}

              {tokensWithBalance.length === 0 ? (
                <Box
                  fontSize={1}
                  sx={{
                    opacity: 0,
                    color: 'gray',
                  }}
                >
                  {noTokensMessage}.
                </Box>
              ) : null}
            </div>
          </Box>
        </Flex>
      </BalCard>
    </div>
  )
}

export default MyWallet
