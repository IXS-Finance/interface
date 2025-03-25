import React, { useEffect, useState } from 'react'
import styled, { keyframes } from 'styled-components'
import { getAddress } from '@ethersproject/address'
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
import { Check, Lock, X } from 'react-feather'
import BalCard from 'pages/DexV2/common/Card'
import LoadingBlock from 'pages/DexV2/common/LoadingBlock'
import StakePreviewModal from './StakePreviewModal'
import usePoolGaugeQuery, { PoolGauge } from 'hooks/dex-v2/queries/usePoolGaugeQuery'

// ─── MAIN COMPONENT PROPS & DEFINITION ─────────────────────────────
type Props = {
  pool: Pool
  onSetRestakeVisibility: (value: boolean) => void
}

const StakingCard: React.FC<Props> = ({ pool, onSetRestakeVisibility }) => {
  const [isStakePreviewVisible, setIsStakePreviewVisible] = useState(false)
  const [stakeAction, setStakeAction] = useState<StakeAction>('stake')

  // COMPOSABLES (hooks)
  const { fNum } = useNumbers()
  const { balanceFor } = useTokens()
  const poolGaugeQuery = usePoolGaugeQuery(pool.id)

  const {
    isLoading: isLoadingStakingData,
    isRefetchingStakedShares,
    stakedShares,
    preferentialGaugeAddress,
    isStakablePool,
    injectPoolGaugeQuery,
  } = usePoolStaking()
  const { isAffected } = usePoolWarning(pool.id)
  const { networkId } = useNetwork()

  useEffect(() => {
    injectPoolGaugeQuery(poolGaugeQuery)
  }, [poolGaugeQuery?.data])

  // COMPUTED (calculated inline)
  const fiatValueOfStakedShares = bnum(pool.totalLiquidity)
    .div(pool.totalShares)
    .times((stakedShares || 0).toString())
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
    if (fiatValueOfStakedShares === '0') return
    setStakeAction('unstake')
    setIsStakePreviewVisible(true)
  }

  function handlePreviewClose() {
    setIsStakePreviewVisible(false)
  }

  if (isLoadingStakingData) {
    return <LoadingBlock darker rounded="lg" style={{ height: 238 }} />
  }

  console.log('isStakablePool', isStakablePool)

  if (!isStakablePool) {
    return null
  }

  return (
    <BalCard shadow="none" noBorder className="p-4">
      <Title>Current APR</Title>
      <Description>Start earning rewards </Description>

      <BalStack vertical spacing="sm">
        <BalStack horizontal justify="between">
          <span>
            {t('staked')} {t('lpTokens')}
          </span>
          <BalStack horizontal spacing="sm" align="center">
            <AnimatePresence isVisible={isRefetchingStakedShares}>
              <BalLoadingBlock style={{ height: '1.25rem' }} />
            </AnimatePresence>
            <AnimatePresence isVisible={!isRefetchingStakedShares}>
              <span>{fNum(fiatValueOfStakedShares, FNumFormats.fiat)}</span>
            </AnimatePresence>
            <BalTooltip
              text="The fiat value of LP tokens you have staked in this pool."
              iconSize="sm"
              className="ml-2"
            />
          </BalStack>
        </BalStack>
        <BalStack horizontal justify="between">
          <span>
            {t('unstaked')} {t('lpTokens')}
          </span>
          <BalStack horizontal spacing="sm" align="center">
            <AnimatePresence isVisible={isRefetchingStakedShares}>
              <BalLoadingBlock style={{ height: '1.25rem' }} />
            </AnimatePresence>
            <AnimatePresence isVisible={!isRefetchingStakedShares}>
              <span>{fNum(fiatValueOfUnstakedShares, FNumFormats.fiat)}</span>
            </AnimatePresence>
            <BalTooltip text="The fiat value of LP tokens you can stake." iconSize="sm" className="ml-2" />
          </BalStack>
        </BalStack>

        <BalBtn
          color="blue"
          disabled={isStakeDisabled}
          onClick={showStakePreview}
          style={{ fontSize: '14px', width: '100%' }}
        >
          <Lock size={14} />
          <span style={{ marginLeft: 4 }}>Stake LP Token</span>
        </BalBtn>

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
      </BalStack>

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
