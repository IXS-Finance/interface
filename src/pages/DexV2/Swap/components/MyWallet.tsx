import React, { useMemo } from 'react'
import styled from 'styled-components'

// Import your custom hooks and utilities
import { isMainnet } from 'hooks/dex-v2/useNetwork'
import { configService } from 'services/config/config.service'
import { AnyPool } from 'services/pool/types'
import MyWalletSubheader from './MyWalletSubheader'
import useNativeBalance from 'hooks/dex-v2/useNativeBalance'
import { usePoolHelpers } from 'hooks/dex-v2/usePoolHelpers'
import { includesAddress } from 'lib/utils'
import { useUserTokens } from 'state/dexV2/pool/useUserTokens'
import { useSwapState } from 'state/dexV2/swap/useSwapState'
import useWeb3 from 'hooks/dex-v2/useWeb3'
import AssetSet from 'pages/DexV2/common/AssetSet'
import { Box } from 'rebass'

// Define the component props.
type Props = {
  excludedTokens?: string[]
  pool?: AnyPool
  onAssetClick?: (tokenAddress: string, isPoolToken: boolean) => void
}

const MyWallet: React.FC<Props> = ({ excludedTokens = [], pool, onAssetClick }) => {
  // Custom hooks (assumed to be available in your React app)
  const { isWalletReady, startConnectWithInjectedProvider } = useWeb3()
  const { setTokenInAddress } = useSwapState()
  const { isDeepPool, isPreMintedBptPool, poolJoinTokens } = usePoolHelpers(pool)
  const {
    isLoadingBalances,
    tokensWithBalance,
    tokensWithBalanceFrom,
    tokensWithoutBalanceFrom,
    tokensWithBalanceNotIn,
  } = useUserTokens()
  const { hasNativeBalance, nativeBalance, nativeCurrency } = useNativeBalance()

  const networkName = configService.network.name

  // Computed messages
  const noNativeCurrencyMessage = `You’ll need some ${nativeCurrency} for gas fees in order to transact on ${networkName}.`

  const noNativeCurrencyMessageEthereum = `You’ll need some ${nativeCurrency} for gas fees in order to do most basic transactions on ${networkName}. However, you may continue to swap any tokens you’ve previously approved for use on Balancer with this wallet, by using the ‘swap gasless’ option.`

  const noTokensMessage = `You don't have any tokens in your connected wallet on ${networkName}`

  // Handler for asset clicks.
  const handleAssetClick = (tokenAddress: string) => {
    setTokenInAddress(tokenAddress)
    const isPoolToken = includesAddress(poolJoinTokens, tokenAddress)
    if (onAssetClick) {
      onAssetClick(tokenAddress, isPoolToken)
    }
  }

  return (
    <Card>
      <Container>
        <HeaderContainer>
          <Box css={{ fontSize: 16, fontWeight: 700 }}>My Wallet</Box>
          {isLoadingBalances ? (
            <LoadingBlock />
          ) : (
            <BalanceInfo>
              {!hasNativeBalance ? (
                <div>
                  <RedText>
                    {nativeBalance} {nativeCurrency}
                  </RedText>
                  {/* Simple tooltip using the title attribute */}
                  {isWalletReady && (
                    <span
                      title={isMainnet ? noNativeCurrencyMessageEthereum : noNativeCurrencyMessage}
                      style={{ marginLeft: '4px', cursor: 'help' }}
                    >
                      &#9888;
                    </span>
                  )}
                </div>
              ) : (
                <div>
                  {nativeBalance} {nativeCurrency}
                </div>
              )}
            </BalanceInfo>
          )}
        </HeaderContainer>

        <ContentContainer>
          {isLoadingBalances ? (
            <LoadingBlock />
          ) : isWalletReady ? (
            pool ? (
              <>
                {isDeepPool && (
                  <MyWalletSubheader
                    style={{
                      fontSize: '0.875rem',
                      borderBottom: '1px solid #e0e0e0',
                      color: '#6b7280',
                    }}
                  >
                    Pool tokens (lowest price impact)
                  </MyWalletSubheader>
                )}
                <SectionMarginTop>
                  <AssetSet
                    balAssetProps={{ button: true }}
                    width={275}
                    wrap
                    size={30}
                    addresses={[...tokensWithBalanceFrom(poolJoinTokens), ...tokensWithoutBalanceFrom(poolJoinTokens)]}
                    disabledAddresses={tokensWithoutBalanceFrom(poolJoinTokens)}
                    maxAssetsPerLine={7}
                    onClick={handleAssetClick}
                  />
                </SectionMarginTop>
                {isDeepPool && isPreMintedBptPool && tokensWithBalanceNotIn(poolJoinTokens).length > 0 && (
                  <>
                    <MyWalletSubheader
                      style={{
                        margin: '1.25rem 0',
                        fontSize: '0.875rem',
                        borderTop: '1px solid #e0e0e0',
                        borderBottom: '1px solid #e0e0e0',
                        color: '#6b7280',
                      }}
                    >
                      Other tokens (higher price impact)
                    </MyWalletSubheader>
                    <AssetSet
                      balAssetProps={{ button: true }}
                      width={275}
                      wrap
                      size={30}
                      addresses={tokensWithBalanceNotIn(poolJoinTokens)}
                      maxAssetsPerLine={7}
                      onClick={handleAssetClick}
                    />
                  </>
                )}
              </>
            ) : (
              <SectionMarginTop>
                <AssetSet
                  balAssetProps={{ button: true }}
                  width={275}
                  wrap
                  size={30}
                  addresses={tokensWithBalance}
                  maxAssetsPerLine={7}
                  onClick={handleAssetClick}
                />
              </SectionMarginTop>
            )
          ) : (
            <div style={{ display: 'flex', marginTop: '1rem', width: '100%', fontWeight: 500 }}>
              <WalletLink onClick={startConnectWithInjectedProvider}>Connect your wallet</WalletLink>
            </div>
          )}
          {tokensWithBalance.length === 0 && <HiddenText>{noTokensMessage}.</HiddenText>}
        </ContentContainer>
      </Container>
    </Card>
  )
}

export default MyWallet

// -----

// Styled components for the layout.
const Card = styled.div`
  max-width: 72rem;
  margin: 0 auto;
  padding: 0;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
`

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background: transparent;
`

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.75rem;
  padding-bottom: 0;
  border-bottom: 1px solid #e0e0e0;

  @media (min-width: 1024px) {
    padding-bottom: 0.75rem;
  }
`

const BalanceInfo = styled.div`
  font-weight: 600;

  @media (min-width: 1024px) {
    font-weight: 400;
  }
`

const RedText = styled.span`
  color: #e53e3e;
  cursor: pointer;

  &:hover {
    color: #c53030;
  }
`

const ContentContainer = styled.div`
  padding: 0 0.75rem 0.75rem;
  flex: 1;
`

const SectionMarginTop = styled.div`
  margin-top: 1.25rem;
`

const LoadingBlock = styled.div`
  width: 3rem;
  height: 2rem;
  background: #f0f0f0;
`

const WalletLink = styled.button`
  background: none;
  border: none;
  color: blue;
  cursor: pointer;
  font-weight: 500;
`

const HiddenText = styled.p`
  font-size: 0.875rem;
  opacity: 0;
  color: #6b7280;
  transition: opacity 0.3s;
`
