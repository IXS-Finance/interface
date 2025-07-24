import React, { useEffect } from 'react'
import styled from 'styled-components'
import { Box, Flex } from 'rebass'
import { useHistory, useParams } from 'react-router-dom'

import useWeb3 from 'hooks/dex-v2/useWeb3'
import { useTokens } from 'state/dexV2/tokens/hooks/useTokens'
import useNumbers, { FNumFormats } from 'hooks/dex-v2/useNumbers'
import { Pool, PoolToken } from 'services/pool/types'
import { bnum } from 'lib/utils'
import { fiatValueOf } from 'hooks/dex-v2/usePoolHelpers'
import BalCard from 'pages/DexV2/common/Card'
import Asset from 'pages/DexV2/common/Asset'
import Copy from 'components/AccountDetails/Copy'
import useExitPool from 'state/dexV2/pool/useExitPool'
import BalBtn from 'pages/DexV2/common/popovers/BalBtn'
import { routes } from 'utils/routes'
import { shortAddress } from 'utils'
import { removeBptFrom } from 'hooks/dex-v2/usePoolHelpers'
import { useTokenBreakdown } from './useTokenBreakdown'

interface MyPoolBalancesCardProps {
  pool: Pool
  missingPrices: boolean
  titleTokens: PoolToken[]
  isStableLikePool: boolean
}

const MyPoolBalancesCard: React.FC<MyPoolBalancesCardProps> = (props) => {
  const { pool, titleTokens } = props
  const { balanceFor, getToken } = useTokens()
  const { fNum } = useNumbers()
  const params = useParams<any>()
  const history = useHistory()
  const { isWalletReady, explorerLinks: explorer } = useWeb3()
  const rootPool = removeBptFrom(pool)
  const tokenData = useTokenBreakdown(rootPool)

  const poolId = (params.id as string).toLowerCase()
  const hasBpt = pool?.address ? bnum(balanceFor(pool?.address)).gt(0) : false
  const bptBalance = bnum(balanceFor(pool.address)).plus('0').toString()
  const fiatValue = (() => {
    return fiatValueOf(pool, bptBalance)
  })()

  function symbolFor(titleTokenIndex: number): string {
    const token = titleTokens[titleTokenIndex]
    return getToken(token.address)?.symbol || token.symbol || '---'
  }

  const handleAddLiquidity = () => {
    const path = routes.dexV2PoolAddLiquidity.replace(':id', poolId)
    history.push(path)
  }

  const handleWithdraw = () => {
    const path = routes.dexV2PoolWithdraw.replace(':id', poolId)
    history.push(path)
  }

  return (
    <Flex flexDirection="column" css={{ gap: '20px' }}>
      <BalCard shadow="none" noBorder className="p-4">
        <Title>My pool balance</Title>
        <Value> {isWalletReady ? fNum(fiatValue, FNumFormats.fiat) : '-'}</Value>

        <div>
          {titleTokens.map(({ address, weight }, i) => {
            const userFiatLabel = tokenData[address]?.userFiatLabel || ''
            const userBalanceLabel = tokenData[address]?.userBalanceLabel || ''
            return (
              <Flex
                key={i}
                alignItems="center"
                justifyContent="space-between"
                css={{
                  gap: '8px',
                  padding: '1rem 0',
                  borderBottom: '1px solid rgba(230, 230, 255, 0.6)',
                  fontSize: '14px',
                  color: 'rgba(41, 41, 51, 0.90)',
                  fontWeight: 500,
                }}
              >
                <Flex css={{ gap: 10 }} alignItems={'center'}>
                  <Asset address={address} size={24} />
                  <Flex flexDirection="column">
                    <div> {symbolFor(i)}</div>
                    <Box css={{ color: '#B8B8D2' }}>{fNum(weight || '0', FNumFormats.percent)}</Box>
                  </Flex>
                </Flex>

                <Flex flexDirection="column">
                  <Box textAlign="right">
                    {userBalanceLabel && !Number.isNaN(userBalanceLabel) ? userBalanceLabel : '-'}
                  </Box>
                  <Box textAlign="right" css={{ color: '#B8B8D2' }}>
                    {userFiatLabel && !Number.isNaN(userFiatLabel) ? userFiatLabel : '-'}
                  </Box>
                </Flex>
              </Flex>
            )
          })}
        </div>

        <Box mt={3}>
          <Box color="#B8B8D2" fontSize="14px" fontWeight={500}>
            Pool address
          </Box>
          <Flex alignItems="center" color="rgba(41, 41, 51, 0.90)" fontSize="14px" fontWeight={500} mt="4px">
            <a href={explorer.addressLink(pool?.address || '')} target="_blank" rel="noreferrer">
              {shortAddress(pool?.address || '')}
            </a>

            <Box ml="4px" css={{ cursor: 'pointer' }}>
              <Copy toCopy={pool?.address || ''} />
            </Box>
          </Flex>
        </Box>

        <Box mt={4}>
          <Grid>
            <BalBtn color="blue" outline disabled={!hasBpt} onClick={handleWithdraw}>
              Withdraw
            </BalBtn>

            <BalBtn color="blue" onClick={handleAddLiquidity}>
              Add Liquidity
            </BalBtn>
          </Grid>
        </Box>
      </BalCard>
    </Flex>
  )
}

export default MyPoolBalancesCard

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
`

const Title = styled.div`
  color: rgba(41, 41, 51, 0.9);
  font-family: Inter;
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  letter-spacing: -0.48px;
`

const Value = styled.div`
  color: rgba(41, 41, 51, 0.9);
  text-align: right;
  font-family: Inter;
  font-size: 32px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  letter-spacing: -0.96px;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(230, 230, 255, 0.6);
`
