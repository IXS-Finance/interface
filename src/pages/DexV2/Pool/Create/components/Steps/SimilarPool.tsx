// SimilarPool.tsx
import React from 'react'
import { orderBy, take } from 'lodash'

import BalCard from 'pages/DexV2/common/Card'
import BalStack from 'pages/DexV2/common/BalStack'
import AssetSet from 'pages/DexV2/common/AssetSet'
import TokenPills from 'pages/DexV2/common/TokenPills'
import useNumbers, { FNumFormats } from 'hooks/dex-v2/useNumbers'
import BalBtn from 'pages/DexV2/common/popovers/BalBtn'
import { usePoolCreation } from 'state/dexV2/poolCreation/hooks/usePoolCreation'
import BalAlert from 'pages/DexV2/common/BalAlert'
import { Box, Flex } from 'rebass'
import styled from 'styled-components'

interface SimilarPoolProps {}

const SimilarPool: React.FC<SimilarPoolProps> = () => {
  const { fNum } = useNumbers()
  const { similarPools, isLoadingSimilarPools, existingPool, resetPoolCreationState, setStep, proceed, goBack } =
    usePoolCreation()

  // Compute the title: if an existing pool is found, notify user; otherwise, show similar pools exist.
  const title = existingPool ? 'This pool already exists' : 'Similar Pools Exist'

  // Compute relevant similar pools: sort by totalLiquidity descending, then take the first 4.
  const relevantSimilarPools = take(
    orderBy(similarPools, (p) => Number(p.totalLiquidity), 'desc'),
    4
  )

  // Cancel function: reset pool creation state and go back to step 0.
  const cancel = () => {
    resetPoolCreationState()
    setStep(0)
  }

  return (
    <BalCard shadow="xl" noBorder noPad>
      <Flex flexDirection="column" p="4" css={{ background: '#F3F3FF' }}>
        <Box color="rgba(41, 41, 51, 0.9)" fontSize="20px" fontWeight={600} css={{ textTransform: 'capitalize' }}>
          {title}
        </Box>

        {existingPool && (
          <Box color="#666680" fontSize="15px" fontWeight={400} mt="3" lineHeight="150%">
            There’s already another pool with exactly the same tokens and fee structure. It’s recommended to add your
            liquidity to the other pool or to go back and change your Pool Creation parameters in a material way to
            avoid fractured liquidity and lower profits for both pools.
          </Box>
        )}
      </Flex>

      <Flex flexDirection="column" p="4" css={{ gap: '16px' }}>
        {isLoadingSimilarPools ? (
          <div /> // You might render a loader here.
        ) : existingPool ? (
          <Flex flexDirection="column" css={{ background: '#F7F7FA', borderRadius: '8px', padding: '16px' }}>
            <Flex
              alignItems="center"
              css={{
                gap: '8px',
                borderBottom: '1px solid #E6E6FF',
                paddingBottom: '24px',
                marginBottom: '24px',
              }}
            >
              <Box width="45px">
                <AssetSet width={35} addresses={existingPool.tokensList} />
              </Box>

              <Box fontSize="14px" fontWeight={500}>
                {existingPool.name}
              </Box>
            </Flex>

            <TokenPills tokens={existingPool.tokens} />

            <Flex alignSelf="stretch" css={{ gap: '16px' }}>
              <Flex
                backgroundColor="#fff"
                flexDirection="column"
                css={{ flex: 1, border: '1px solid #E6E6FF', borderRadius: '8px', padding: '16px 24px' }}
              >
                <Label>Pool value</Label>
                <Value>{fNum(existingPool.totalLiquidity, FNumFormats.fiat)}</Value>
              </Flex>
              <Flex
                backgroundColor="#fff"
                flexDirection="column"
                css={{ flex: 1, border: '1px solid #E6E6FF', borderRadius: '8px', padding: '16px 24px' }}
              >
                <Label>Vol (24h)</Label>
                <Value>{fNum(existingPool.volumeSnapshot || '0', FNumFormats.fiat)}</Value>
              </Flex>
              <Flex
                backgroundColor="#fff"
                flexDirection="column"
                css={{ flex: 1, border: '1px solid #E6E6FF', borderRadius: '8px', padding: '16px 24px' }}
              >
                <Label>Fees</Label>
                <Value>{fNum(existingPool.swapFee, FNumFormats.percent)}</Value>
              </Flex>
            </Flex>
          </Flex>
        ) : (
          <Flex flexDirection="column" css={{ gap: '16px', height: '500px', overflowY: 'auto' }}>
            {relevantSimilarPools.map((p) => (
              <Flex
                key={p.id}
                flexDirection="column"
                css={{ background: '#F7F7FA', borderRadius: '8px', padding: '16px' }}
              >
                <Flex
                  alignItems="center"
                  css={{
                    gap: '8px',
                    borderBottom: '1px solid #E6E6FF',
                    paddingBottom: '24px',
                    marginBottom: '24px',
                  }}
                >
                  <Box width="45px">
                    <AssetSet width={35} addresses={p.tokensList} />
                  </Box>

                  <Box fontSize="14px" fontWeight={500}>
                    {p.name}
                  </Box>
                </Flex>

                <TokenPills tokens={p.tokens} />

                <Flex alignSelf="stretch" css={{ gap: '16px' }}>
                  <Flex
                    backgroundColor="#fff"
                    flexDirection="column"
                    css={{ flex: 1, border: '1px solid #E6E6FF', borderRadius: '8px', padding: '16px 24px' }}
                  >
                    <Label>Pool value</Label>
                    <Value>{fNum(p.totalLiquidity, FNumFormats.fiat)}</Value>
                  </Flex>
                  <Flex
                    backgroundColor="#fff"
                    flexDirection="column"
                    css={{ flex: 1, border: '1px solid #E6E6FF', borderRadius: '8px', padding: '16px 24px' }}
                  >
                    <Label>Vol (24h)</Label>
                    <Value>{fNum(p.volumeSnapshot || '0', FNumFormats.fiat)}</Value>
                  </Flex>
                  <Flex
                    backgroundColor="#fff"
                    flexDirection="column"
                    css={{ flex: 1, border: '1px solid #E6E6FF', borderRadius: '8px', padding: '16px 24px' }}
                  >
                    <Label>Fees</Label>
                    <Value>{fNum(p.swapFee, FNumFormats.percent)}</Value>
                  </Flex>
                </Flex>
              </Flex>
            ))}
          </Flex>
        )}
        {!existingPool && (
          <BalAlert type="warning" block title="Are you sure you want to continue?">
            You can continue to create your pool anyway, but you’ll have to pay pool creation gas costs and liquidity
            will be fractured which is likely to result in your new pool being less profitable.
          </BalAlert>
        )}
        <BalStack horizontal expandChildren>
          <BalBtn block outline color="blue" onClick={cancel}>
            Cancel
          </BalBtn>
          {!existingPool && (
            <BalBtn block onClick={proceed}>
              Continue anyway
            </BalBtn>
          )}
        </BalStack>
      </Flex>
    </BalCard>
  )
}

export default SimilarPool

const Line = styled.div`
  border-top: 1px solid #e6e6ff;
  margin-top: 24px;
  margin-bottom: 24px;
`

const Label = styled.span`
  color: #b8b8d2;
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  letter-spacing: -0.42px;
`

const Value = styled.span`
  color: rgba(41, 41, 51, 0.9);
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  letter-spacing: -0.42px;
  margin-top: 4px;
`
