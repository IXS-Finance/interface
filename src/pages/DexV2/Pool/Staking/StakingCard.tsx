import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { getAddress } from '@ethersproject/address'
import { Box, Flex } from 'rebass'

import { bnum } from 'lib/utils'
import { Pool } from 'services/pool/types'
import { fNum as numF } from 'lib/balancer/utils/numbers'
import useNumbers, { FNumFormats } from 'hooks/dex-v2/useNumbers'
import { StakeAction } from './hooks/useStakePreview'
import { usePoolStaking } from 'state/dexV2/poolStaking/usePoolStaking'
import BalBtn from 'pages/DexV2/common/popovers/BalBtn'
import { useTokens } from 'state/dexV2/tokens/hooks/useTokens'
import { Lock, Unlock } from 'react-feather'
import BalCard from 'pages/DexV2/common/Card'
import LoadingBlock from 'pages/DexV2/common/LoadingBlock'
import StakePreviewModal from './StakePreviewModal'
import Tooltip from 'pages/DexV2/common/Tooltip'
import { parseUnits } from 'viem'
import { LP_DECIMALS } from './constants'
import usePoolDayDatas from 'hooks/dex-v2/pools/usePoolDayDatas'
import { getPoolAprValue } from 'lib/utils/poolApr'
import useGauges from 'hooks/dex-v2/pools/useGauges'
import useEmissionApr from 'hooks/dex-v2/useEmissionApr'

type Props = {
  pool: Pool
}

const StakingCard: React.FC<Props> = ({ pool }) => {
  const { poolDayDatasFor } = usePoolDayDatas()
  const [isStakePreviewVisible, setIsStakePreviewVisible] = useState(false)
  const [stakeAction, setStakeAction] = useState<StakeAction>('stake')

  const { fNum } = useNumbers()
  const { isLoading, gaugeFor } = useGauges()
  const { balanceFor, allowanceFor, injectSpenders, refetchAllowances } = useTokens()

  const gaugeAddress = gaugeFor(pool.address)?.address

  const { stakedBalance, unstakeBalance, isFetchingStakedBalance, isStakablePool, injectCurrentPool } = usePoolStaking({
    gaugeAddress,
  })

  const fiatValueOfStakedShares = bnum(pool.totalLiquidity)
    .div(pool.totalShares)
    .times((stakedBalance || 0).toString())
    .toString()

  const fiatValueOfUnstakedShares = bnum(pool.totalLiquidity)
    .div(pool.totalShares)
    .times(balanceFor(pool.address))
    .toString()

  const isStakeDisabled =
    fiatValueOfUnstakedShares === '0' ||
    !gaugeAddress ||
    (gaugeAddress && allowanceFor(pool.address, gaugeAddress) === undefined)

  const isUnstakeDisabled = Boolean(fiatValueOfStakedShares === '0' || !gaugeAddress)

  // METHODS
  function showStakePreview() {
    if (fiatValueOfUnstakedShares === '0') return
    setStakeAction('stake')
    setIsStakePreviewVisible(true)
  }

  function showUnstakePreview() {
    if (stakedBalance === '0') return
    setStakeAction('unstake')
    setIsStakePreviewVisible(true)
  }

  function handlePreviewClose() {
    setIsStakePreviewVisible(false)
  }

  useEffect(() => {
    if (pool) {
      injectCurrentPool(pool)
    }
  }, [JSON.stringify(pool)])

  useEffect(() => {
    if (!gaugeAddress) return

    injectSpenders([gaugeAddress])
    refetchAllowances()
  }, [gaugeAddress])

  const emissionAprValue = useEmissionApr(pool)
  const poolApr = getPoolAprValue(pool, poolDayDatasFor(pool.address))

  if (isLoading) {
    return <LoadingBlock darker rounded="lg" style={{ height: 238 }} />
  }

  if (!isStakablePool) {
    return null
  }

  return (
    <BalCard shadow="none" noBorder className="p-4">
      <Flex justifyContent="space-between">
        <Title>Staking LP Token</Title>
        <Title>{numF('apr', poolApr)}</Title>
      </Flex>
      <Flex justifyContent="space-between" mt="4px">
        <Description>Start earning rewards</Description>
        <Description>APR</Description>
      </Flex>

      <Line />

      <Flex alignItems="center" justifyContent="space-between">
        <Box fontSize="14px" fontWeight={500} color="rgba(41, 41, 51, 0.90)">
          Staked LP Tokens
        </Box>
        <Flex alignItems="center">
          {isFetchingStakedBalance ? (
            <BalLoadingBlock style={{ height: '1.25rem' }} />
          ) : (
            <>
              <Box fontSize="14px" fontWeight={500} color="#B8B8D2" mr="4px">
                {fNum(fiatValueOfStakedShares, FNumFormats.fiat)}
              </Box>
              <Tooltip text="The fiat value of LP tokens you have staked in this pool." />
            </>
          )}
        </Flex>
      </Flex>

      <Line />

      <Flex alignItems="center" justifyContent="space-between">
        <Box fontSize="14px" fontWeight={500} color="rgba(41, 41, 51, 0.90)">
          Unstaked LP Tokens
        </Box>
        <Flex alignItems="center">
          {isFetchingStakedBalance ? (
            <BalLoadingBlock style={{ height: '1.25rem' }} />
          ) : (
            <>
              <Box fontSize="14px" fontWeight={500} color="#B8B8D2" mr="4px">
                {fNum(fiatValueOfUnstakedShares, FNumFormats.fiat)}
              </Box>
              <Tooltip text="The fiat value of LP tokens you can stake." />
            </>
          )}
        </Flex>
      </Flex>

      <Line />

      <Grid>
        <BalBtn
          color="red"
          disabled={isUnstakeDisabled}
          onClick={showUnstakePreview}
          style={{ fontSize: '14px', width: '100%' }}
        >
          <Unlock size={14} />
          <span style={{ marginLeft: 4 }}>Unstake</span>
        </BalBtn>

        <BalBtn
          color="blue"
          disabled={!!isStakeDisabled}
          onClick={showStakePreview}
          style={{ fontSize: '14px', width: '100%' }}
        >
          <Lock size={14} />
          <span style={{ marginLeft: 4 }}>Stake</span>
        </BalBtn>
      </Grid>

      {isStakePreviewVisible && gaugeAddress ? (
        <StakePreviewModal
          isVisible={isStakePreviewVisible}
          pool={pool}
          emissionApr={emissionAprValue}
          gaugeAddress={gaugeAddress}
          currentShares={balanceFor(getAddress(pool.address))}
          stakedBalance={parseUnits(stakedBalance, LP_DECIMALS)}
          unstakeBalance={parseUnits(unstakeBalance, LP_DECIMALS)}
          action={stakeAction}
          onClose={handlePreviewClose}
          onSuccess={handlePreviewClose}
        />
      ) : null}
    </BalCard>
  )
}

export default StakingCard

const BalLoadingBlock = styled.div`
  background: #eee;
  border-radius: 4px;
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

const Description = styled.div`
  color: #b8b8d2;
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  letter-spacing: -0.42px;
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
`

const Line = styled.div`
  border-top: solid 1px rgba(230, 230, 255, 0.6);
  margin-top: 1rem;
  padding-top: 1rem;
`
