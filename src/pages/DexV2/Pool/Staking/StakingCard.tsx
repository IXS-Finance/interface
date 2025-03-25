import React, { useEffect, useState } from 'react'
import styled, { keyframes } from 'styled-components'
import { getAddress } from '@ethersproject/address'
import { formatUnits } from '@ethersproject/units'
import { bnum } from 'lib/utils'
import { Pool } from 'services/pool/types'
import useNumbers, { FNumFormats } from 'hooks/dex-v2/useNumbers'
import { StakeAction } from './hooks/useStakePreview'
import useNetwork from 'hooks/dex-v2/useNetwork'
import { usePoolWarning } from 'hooks/dex-v2/usePoolWarning'
import { deprecatedDetails } from 'hooks/dex-v2/usePoolHelpers'
import { usePoolStaking } from 'state/dexV2/poolStaking/usePoolStaking'
import BalBtn from 'pages/DexV2/common/popovers/BalBtn'
import { useTokens } from 'state/dexV2/tokens/hooks/useTokens'
import BalStack from 'pages/DexV2/common/BalStack'
import BalTooltip from 'pages/DexV2/common/BalTooltip'
import { Check, Lock, Unlock, X } from 'react-feather'
import BalCard from 'pages/DexV2/common/Card'
import LoadingBlock from 'pages/DexV2/common/LoadingBlock'
import StakePreviewModal from './StakePreviewModal'
import usePoolGaugeQuery, { PoolGauge } from 'hooks/dex-v2/queries/usePoolGaugeQuery'
import { LiquidityGauge } from 'services/balancer/contracts/contracts/liquidity-gauge'
import useWeb3 from 'hooks/dex-v2/useWeb3'
import { Box, Flex } from 'rebass'
import { isQueryLoading } from 'hooks/dex-v2/queries/useQueryHelpers'
import { Tooltip } from './Tooltip'

// ─── MAIN COMPONENT PROPS & DEFINITION ─────────────────────────────
type Props = {
  pool: Pool
  onSetRestakeVisibility: (value: boolean) => void
}

const StakingCard: React.FC<Props> = ({ pool, onSetRestakeVisibility }) => {
  const [isStakePreviewVisible, setIsStakePreviewVisible] = useState(false)
  const [stakeAction, setStakeAction] = useState<StakeAction>('stake')
  const [stakedBalance, setStakedBalance] = useState('0')
  const [isFetchingStakedBalance, setIsFetchingStakedBalance] = useState(false)

  // COMPOSABLES (hooks)
  const { fNum } = useNumbers()
  const { balanceFor, getToken } = useTokens()
  const poolGaugeQuery = usePoolGaugeQuery(pool.id)
  const { account } = useWeb3()

  const { isRefetchingStakedShares, stakedShares, preferentialGaugeAddress, isStakablePool, injectPoolGaugeQuery } =
    usePoolStaking()
  const { isAffected } = usePoolWarning(pool.id)
  const { networkId } = useNetwork()

  const isLoadingStakingData = poolGaugeQuery ? isQueryLoading(poolGaugeQuery) : false

  console.log('pool', pool)

  useEffect(() => {
    injectPoolGaugeQuery(poolGaugeQuery)
  }, [poolGaugeQuery?.data])

  useEffect(() => {
    async function getBalance() {
      setIsFetchingStakedBalance(true)
      const gauge = new LiquidityGauge(preferentialGaugeAddress)
      const balanceBpt = await gauge.balance(account)
      const stackedBalance = formatUnits(balanceBpt.toString(), pool?.onchain?.decimals || 18)
      setStakedBalance(stackedBalance)
      setIsFetchingStakedBalance(false)
    }
    if (preferentialGaugeAddress) {
      getBalance()
    }
  }, [preferentialGaugeAddress])

  const fiatValueOfStakedShares = bnum(pool.totalLiquidity)
    .div(pool.totalShares)
    .times((stakedBalance || 0).toString())
    .toString()

  const fiatValueOfUnstakedShares = bnum(pool.totalLiquidity)
    .div(pool.totalShares)
    .times(balanceFor(getAddress(pool.address)))
    .toString()

  const isStakeDisabled = Boolean(
    deprecatedDetails(pool.id) || fiatValueOfUnstakedShares === '0' || !preferentialGaugeAddress
  )

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

  if (isLoadingStakingData) {
    return <LoadingBlock darker rounded="lg" style={{ height: 238 }} />
  }

  if (!isStakablePool) {
    return null
  }

  return (
    <BalCard shadow="none" noBorder className="p-4">
      <Flex justifyContent="space-between">
        <Title>Staking LP Token</Title>
        <Title>24.8%</Title>
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
          disabled={stakedBalance === '0'}
          onClick={showUnstakePreview}
          style={{ fontSize: '14px', width: '100%' }}
        >
          <Unlock size={14} />
          <span style={{ marginLeft: 4 }}>Unstake</span>
        </BalBtn>

        <BalBtn
          color="blue"
          disabled={isStakeDisabled}
          onClick={showStakePreview}
          style={{ fontSize: '14px', width: '100%' }}
        >
          <Lock size={14} />
          <span style={{ marginLeft: 4 }}>Stake</span>
        </BalBtn>
      </Grid>

      {/* {hasNonPrefGaugeBalance && !isAffected ? (
          <BalStack horizontal spacing="sm" style={{ marginTop: '8px' }}>
            <BalBtn color="gradient" onClick={() => onSetRestakeVisibility(true)}>
              {t('restake')}
            </BalBtn>
            <BalBtn outline color="blue" disabled={fiatValueOfStakedShares === '0'} onClick={showUnstakePreview}>
              {t('unstake')}
            </BalBtn>
          </BalStack>
        ) : (
          <BalStack horizontal spacing="sm" style={{ marginTop: '8px' }}>
            <BalBtn color="gradient" disabled={isStakeDisabled} onClick={showStakePreview}>
              {t('stake')}
            </BalBtn>
            <BalBtn outline color="blue" disabled={fiatValueOfStakedShares === '0'} onClick={showUnstakePreview}>
              {t('unstake')}
            </BalBtn>
          </BalStack>
        )} */}
      {/* {hasNonPrefGaugeBalance && networkId === 'MAINNET' && (
                    <BalAlert style={{ marginTop: '8px' }} title={t('staking.restakeGauge')}>
                      {t('staking.restakeGaugeDescription')}
                    </BalAlert>
                  )} */}

      <StakePreviewModal
        isVisible={isStakePreviewVisible}
        pool={pool}
        action={stakeAction}
        onClose={handlePreviewClose}
        onSuccess={() => handlePreviewClose()}
      />
    </BalCard>
  )
}

export default StakingCard

// ─── DUMMY TRANSLATION FUNCTION ────────────────────────────────
// Replace this with your own i18n solution.
const t = (key: string) => key

// ─── DUMMY COMPONENTS (Replace these with your own implementations) ─────────────────
// For illustration purposes only.
const AnimatePresence = ({
  isVisible,
  children,
  unmountInstantly,
}: {
  isVisible: boolean
  children: React.ReactNode
  unmountInstantly?: boolean
}) => <>{isVisible ? children : null}</>

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
