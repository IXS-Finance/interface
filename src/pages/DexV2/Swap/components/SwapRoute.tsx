import React, { useState } from 'react'
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

interface Props {
  addressIn: string
  addressOut: string
  amountIn: string
  amountOut: string
  pools: SubgraphPoolBase[]
  sorReturn: SorReturn
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

  return (
    <div>
      {routes.length > 0 ? (
        <div>
          <Flex alignItems="center" style={{ gap: 8, cursor: 'pointer' }} onClick={toggleVisible}>
            <Box css={{ fontSize: 12, color: '#b8b8d' }}>Swap Route</Box>
            <Flex alignItems="center">{visible ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</Flex>
          </Flex>

          {visible ? (
            <Box mt="18px">
              <div>
                <Flex justifyContent="space-between">
                  <div>
                    <div className="font-semibold">{input.amount}</div>
                    <div>{input.symbol}</div>
                  </div>
                  <Flex alignItems="flex-end" flexDirection="column">
                    <div className="font-semibold">{output.amount}</div>
                    <div>{output.symbol}</div>
                  </Flex>
                </Flex>

                <Box mt="8px" css={{ position: 'relative' }}>
                  <PairLine />
                  <Flex justifyContent="space-between" css={{ position: 'relative', zIndex: 10 }}>
                    <Asset address={input.address} size={36} />
                    <Asset address={output.address} size={36} />
                  </Flex>
                </Box>
              </div>
              <Flex justifyContent="space-between" style={{ margin: `8px ${12 + routes.length}px` }}>
                <Triangle size={8} fill="currentColor" style={{ transform: 'rotate(180deg)' }} />
                <Triangle size={8} fill="currentColor" />
              </Flex>
              <Box css={{ position: 'relative' }} mx="16px" my="3px">
                {routes.map((route, index) => (
                  <RouteBox
                    key={index}
                    style={{
                      height: `${18 + 70 * index}px`,
                      width: `calc(100% - ${4 * (routes.length - index - 1)}px + 1px)`,
                      margin: `0 ${2 * (routes.length - index - 1) - 1}px`,
                    }}
                  />
                ))}

                <Box css={{ position: 'relative', zIndex: 10 }}>
                  {routes.map((route, index) => (
                    <HopsContainer key={index}></HopsContainer>
                  ))}
                </Box>
              </Box>
            </Box>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

export default SwapRoute

const PairLine = styled.div`
  position: absolute;
  margin: 0 2.25rem;
  height: 50%;
  border-bottom: 1px dashed #6b7280;
  width: calc(100% - 72px);
`

const RouteBox = styled.div`
  position: absolute;
  border-radius: 0 0 0.375rem 0.375rem;
  border-right: 1px solid #6b7280;
  border-bottom: 1px solid #6b7280;
  border-left: 1px solid #6b7280;
`

const HopsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 36px;

  &:fist-child {
    margin-top: 0;
  }
`
