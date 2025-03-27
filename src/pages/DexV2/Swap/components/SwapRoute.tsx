import React, { useEffect, useState } from 'react'
import BigNumber from 'bignumber.js'
import { getAddress } from '@ethersproject/address'
import { AddressZero } from '@ethersproject/constants'
import { ChevronDown, ChevronUp, Triangle } from 'react-feather'
import styled from 'styled-components'

import { SubgraphPoolBase, SwapV2 } from '@ixswap1/dex-v2-sdk'
import { SorReturn } from 'lib/utils/balancer/helpers/sor/sorManager'
import { NATIVE_ASSET_ADDRESS, WRAPPED_NATIVE_ASSET_ADDRESS } from 'constants/dexV2/tokens'
import { isSameAddress } from 'lib/utils'
import { Box, Flex } from 'rebass'
import { useTokens } from 'state/dexV2/tokens/hooks/useTokens'
import Asset from 'pages/DexV2/common/Asset'
import BalCard from 'pages/DexV2/common/BalCard'
import useNumbers, { FNumFormats } from 'hooks/dex-v2/useNumbers'
import { networkSlug } from 'hooks/dex-v2/useNetwork'

interface Props {
  addressIn: string
  addressOut: string
  amountIn: string
  amountOut: string
  pools: SubgraphPoolBase[]
  sorReturn: SorReturn
  setHopCount?: (count: number) => void
}

interface Asset {
  address: string
  share: number
}

interface Hop {
  pool: {
    address: string
    id: string
    tokens: Asset[]
  }
  tokenIn: string
  tokenOut: string
  amount: BigNumber
}

interface Route {
  share: number
  hops: Hop[]
}

function getV2Routes(
  addressIn: string,
  addressOut: string,
  pools: SubgraphPoolBase[],
  swaps: SwapV2[],
  addresses: string[]
): Route[] {
  addressIn = addressIn === NATIVE_ASSET_ADDRESS ? WRAPPED_NATIVE_ASSET_ADDRESS : getAddress(addressIn)
  addressOut = addressOut === NATIVE_ASSET_ADDRESS ? WRAPPED_NATIVE_ASSET_ADDRESS : getAddress(addressOut)

  if (!pools.length || !swaps.length || !addresses.length || addresses.length === 1) {
    return []
  }

  // Calculate the total swap amount using all swaps (multihops have a value of 0)
  const totalSwapAmount = swaps.reduce((total, rawHops) => {
    return total.plus(rawHops.amount || '0')
  }, new BigNumber(0))

  // Contains direct and multihops
  const routes: Route[] = []
  // Contains every token > token hop
  const allHops: Hop[] = []
  for (let i = 0; i < swaps.length; i++) {
    const swap = swaps[i]
    const rawPool = pools.find((pool) => pool.id === swap.poolId)

    if (rawPool) {
      const tokenIn =
        addresses[swap.assetInIndex] === AddressZero
          ? WRAPPED_NATIVE_ASSET_ADDRESS
          : getAddress(addresses[swap.assetInIndex])
      const tokenOut =
        addresses[swap.assetOutIndex] === AddressZero
          ? WRAPPED_NATIVE_ASSET_ADDRESS
          : getAddress(addresses[swap.assetOutIndex])

      const isDirectSwap = tokenIn === addressIn && tokenOut === addressOut

      const pool = {
        address: rawPool.address,
        id: rawPool.id,
        tokens: rawPool.tokens
          .map((token) => {
            return {
              address: getAddress(token.address),
              share: parseFloat(token.weight || '') || 1 / rawPool.tokens.length,
            }
          })
          .sort((a, b) => {
            if (isSameAddress(a.address, tokenIn) || isSameAddress(b.address, tokenOut)) {
              return -1
            }
            if (isSameAddress(a.address, tokenOut) || isSameAddress(b.address, tokenIn)) {
              return 1
            }
            return a.share - b.share
          })
          .filter((_token, index, tokens) => {
            // Show first 2 and last 2 tokens
            return index < 2 || index > tokens.length - 3
          }),
      }

      const hop = {
        pool,
        tokenIn,
        tokenOut,
        amount: new BigNumber(swap.amount || '0'),
      }

      allHops.push(hop)

      if (isDirectSwap) {
        // Direct swaps are pushed to routes array immediately
        const share = hop.amount.div(totalSwapAmount).toNumber()
        const route = {
          share,
          hops: [hop],
        } as Route
        routes.push(route)
      } else {
        // Only multihops that have a previous partner in sequence are pushed to routes
        if (tokenOut === addressOut && swap.amount === '0') {
          // TokenOut with amount of 0 for multihop means it's a swapExactIn and previous swap is partner of hop
          const swapAmount = new BigNumber(allHops[i - 1].amount)
          const share = swapAmount.div(totalSwapAmount).toNumber()
          const route = {
            share,
            hops: [allHops[i - 1], hop],
          } as Route
          routes.push(route)
        } else if (tokenIn === addressIn && swap.amount === '0') {
          // TokenIn with amount of 0 for multihop means it's a swapExactOut and previous swap is partner of hop
          const swapAmount = new BigNumber(allHops[i - 1].amount)
          const share = swapAmount.div(totalSwapAmount).toNumber()
          const route = {
            share,
            hops: [hop, allHops[i - 1]],
          } as Route
          routes.push(route)
        }
      }
    }
  }

  return routes
}

const SwapRoute: React.FC<Props> = (props) => {
  const { getToken } = useTokens()
  const { fNum } = useNumbers()

  const [visible, setVisible] = useState(false)

  // Compute routes on every render instead of memoizing
  let routes: Route[] = []
  if (props.sorReturn.hasSwaps) {
    const pools = props.pools as SubgraphPoolBase[]
    const swaps = props.sorReturn.result.swaps
    const addresses = props.sorReturn.result.tokenAddresses
    const addressIn = props.addressIn as string
    const addressOut = props.addressOut as string
    routes = getV2Routes(addressIn, addressOut, pools, swaps, addresses)
  }

  // Compute input asset details on every render
  const input = (() => {
    if (!props.addressOut) {
      return {}
    }
    const symbol = getToken(props.addressIn).symbol
    return {
      amount: props.amountIn,
      address: props.addressIn,
      symbol,
    }
  })()

  // Compute output asset details on every render
  const output = (() => {
    if (!props.addressOut) {
      return {}
    }
    const symbol = getToken(props.addressOut).symbol
    return {
      amount: props.amountOut,
      address: props.addressOut,
      symbol,
    }
  })()

  function toggleVisible() {
    setVisible(!visible)
  }

  function formatShare(share: number): string {
    return fNum(share, FNumFormats.percent)
  }

  useEffect(() => {
    props.setHopCount &&  props.setHopCount(routes.length)
  }, [routes.length])

  if (!routes || routes.length === 0) return null

  console.log('routes', routes)
  return (
    <Card shadow="none">
      <ToggleHeader onClick={toggleVisible}>
        <Box css={{ fontSize: 14, color: '#B8B8D2', fontWeight: 500 }}>Swap Route</Box>
        <Flex alignItems="center" color="#B8B8D2" ml="4px">
          {visible ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </Flex>
      </ToggleHeader>
      {visible && (
        <ContentWrapper>
          {routes.length === 0 ? (
            <div style={{ marginTop: '20px', fontSize: '0.875rem', color: 'var(--color-secondary)' }}>
              No data available
            </div>
          ) : (
            <>
              <TokenInfoContainer>
                <div>
                  <div style={{ fontWeight: 'bold' }}>{input.amount}</div>
                  <div>{input.symbol}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 'bold' }}>{output.amount}</div>
                  <div>{output.symbol}</div>
                </div>
              </TokenInfoContainer>
              <AssetsWrapper>
                <PairLine />
                <AssetsIcons>
                  <Asset address={input.address} size={36} />
                  <Asset address={output.address} size={36} />
                </AssetsIcons>
              </AssetsWrapper>
              <TriangleContainer routesLength={routes.length}>
                <Triangle size={8} fill="currentColor" style={{ transform: 'rotate(180deg)' }} />
                <Triangle size={8} fill="currentColor" />
              </TriangleContainer>
              <RoutesContainer>
                {/* Background layers for each route */}
                {routes.map((route, index) => {
                  const bgStyle = {
                    height: `${20 + 70 * index}px`,
                    width: `calc(100% - ${4 * (routes.length - index - 1)}px + 1px)`,
                    margin: `0 ${2 * (routes.length - index - 1) - 1}px`,
                  }
                  return <RouteBackground key={`bg-${index}`} style={bgStyle} />
                })}
                <div style={{ position: 'relative', zIndex: 10 }}>
                  {routes.map((route, idx) => (
                    <RouteItem key={route.hops[0]?.pool?.address} first={idx === 0}>
                      <IconWrapper>
                        <Triangle size={8} fill="currentColor" style={{ transform: 'rotate(90deg)' }} />
                      </IconWrapper>
                      <HopsContainer>
                        {route.hops.map((hop, hIndex) => (
                          <HopContainer key={hop?.pool?.address} first={hIndex === 0}>
                            <HopLink
                              href={`/#/${networkSlug}/pool/${hop.pool.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {hop.pool.tokens.map((token) => (
                                <Asset
                                  key={token.address}
                                  address={token.address}
                                  size={20}
                                  style={{ marginLeft: hIndex === 0 ? 0 : '6px' }}
                                />
                              ))}
                            </HopLink>
                          </HopContainer>
                        ))}
                      </HopsContainer>
                      <ShareText>{formatShare(route.share)}</ShareText>
                    </RouteItem>
                  ))}
                </div>
              </RoutesContainer>
            </>
          )}
        </ContentWrapper>
      )}
    </Card>
  )
}

export default SwapRoute

const Card = styled(BalCard)`
  /* You can override styles here if needed; the shadow is controlled via props */
`

const ToggleHeader = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  color: var(--color-secondary);
`

const ContentWrapper = styled.div`
  margin-top: 20px; /* mt-5 */
`

const TokenInfoContainer = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem; /* text-xs */
`

const AssetsWrapper = styled.div`
  position: relative;
  margin-top: 8px; /* mt-2 */
`

const PairLine = styled.div`
  position: absolute;
  margin: 0 36px; /* mx-9 (9*4px = 36px) */
  height: 50%; /* h-1/2 */
  border-bottom: 1px dashed #6b7280; /* border-gray-500 + border-dashed */
  width: calc(100% - 72px); /* from scoped style in Vue */
`

const AssetsIcons = styled.div`
  display: flex;
  justify-content: space-between;
  position: relative;
  z-index: 10;
`

const TriangleContainer = styled.div<{ routesLength: number }>`
  display: flex;
  justify-content: space-between;
  margin: 8px ${(props) => 12 + props.routesLength}px;
`

const RoutesContainer = styled.div`
  position: relative;
  margin: 6px 16px; /* my-1.5 (6px) and mx-4 (16px) */
`

const RouteBackground = styled.div`
  position: absolute;
  border-right: 1px solid #6b7280;
  border-bottom: 1px solid #6b7280;
  border-left: 1px solid #6b7280;
  border-radius: 0 0 4px 4px; /* rounded-b-md approximation */
`

const RouteItem = styled.div<{ first: boolean }>`
  display: flex;
  justify-content: space-between;
  margin-top: ${(props) => (props.first ? '0' : '36px')}; /* mt-9 for non-first items */
`

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-left: 16px; /* ml-4 */
  width: 16px; /* w-4 */
`

const HopsContainer = styled.div`
  display: flex;
`

const HopContainer = styled.div<{ first: boolean }>`
  display: flex;
  margin-left: ${(props) => (props.first ? '0' : '16px')}; /* first:ml-0 vs ml-4 */
  background: white;
  border: 1px solid #f3f4f6; /* border-gray-100 */
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: background-color 0.2s, border-color 0.2s;

  &:hover {
    background: #f9fafb; /* hover:bg-gray-50 */
    border-color: #e5e7eb; /* hover:border-gray-300 */
  }
`

const HopLink = styled.a`
  display: flex;
  padding: 6px; /* p-1.5 */
  text-decoration: none;
`

const ShareText = styled.div`
  margin-right: 16px; /* mr-4 */
  width: 40px; /* w-10 */
  font-size: 0.75rem; /* text-xs */
  text-align: right;
  color: var(--color-secondary);
`
