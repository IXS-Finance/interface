import React, { useState } from 'react'
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

// ─── MAIN COMPONENT PROPS & DEFINITION ─────────────────────────────
type Props = {
  pool: Pool
  onSetRestakeVisibility: (value: boolean) => void
}

const StakingIncentivesCard: React.FC<Props> = ({ pool, onSetRestakeVisibility }) => {
  // STATE
  const [isStakePreviewVisible, setIsStakePreviewVisible] = useState(false)
  const [stakeAction, setStakeAction] = useState<StakeAction>('stake')
  const [isOpenedByDefault, setIsOpenedByDefault] = useState(false)

  // COMPOSABLES (hooks)
  const { fNum } = useNumbers()
  const { balanceFor } = useTokens()
  const {
    isLoading: isLoadingStakingData,
    isRefetchingStakedShares,
    stakedShares,
    hasNonPrefGaugeBalance,
    preferentialGaugeAddress,
  } = usePoolStaking()
  const isStakablePool = true
  const { isAffected } = usePoolWarning(pool.id)
  const { networkId } = useNetwork()

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
    deprecatedDetails(pool.id) ||
      fiatValueOfUnstakedShares === '0' ||
      hasNonPrefGaugeBalance ||
      !preferentialGaugeAddress
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

  return (
    <Container>
      {isLoadingStakingData ? (
        <BalLoadingBlock style={{ height: '3rem' }} />
      ) : (
        <RelativeDiv>
          <AccordionContainer isHandle={isStakablePool}>
            <BalAccordion
              className={isStakablePool ? 'handle shadow-2xl' : 'shadow-2xl'}
              sections={[
                {
                  title: t('staking.stakingIncentives'),
                  id: 'staking-incentives',
                  handle: 'staking-handle',
                  isDisabled: !isStakablePool,
                },
              ]}
              reCalcKey={hasNonPrefGaugeBalance ? 0 : 1}
              isOpenedByDefault={isOpenedByDefault}
            >
              {/* Accordion Header */}
              <HeaderButton>
                <BalStack horizontal justify="between" align="center">
                  <BalStack horizontal align="center" spacing="sm">
                    <StatusCircle isStakable={isStakablePool}>
                      {isStakablePool ? <BalIcon name="check" /> : <BalIcon name="x" />}
                    </StatusCircle>
                    <HeaderTitle>{t('staking.stakingIncentives')}</HeaderTitle>
                  </BalStack>
                  {isStakablePool && (
                    <BalStack horizontal spacing="sm" align="center">
                      <BalIcon name="chevron-down" style={{ color: '#007bff' }} />
                    </BalStack>
                  )}
                </BalStack>
              </HeaderButton>
              {/* Accordion Content */}
              <ContentWrapper>
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
                      <BalTooltip text={t('staking.stakedLpTokensTooltip')} />
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
                      <BalTooltip text={t('staking.unstakedLpTokensTooltip')} />
                    </BalStack>
                  </BalStack>
                  {/* {networkId !== 'MAINNET' && (
                    <StakingCardSyncAlert
                      poolAddress={pool.address}
                      poolId={pool.id}
                      fiatValueOfStakedShares={fiatValueOfStakedShares}
                      fiatValueOfUnstakedShares={fiatValueOfUnstakedShares}
                      onShouldStakingCardBeOpened={() => setIsOpenedByDefault(true)}
                    />
                  )} */}
                  {hasNonPrefGaugeBalance && !isAffected ? (
                    <BalStack horizontal spacing="sm" style={{ marginTop: '8px' }}>
                      <BalBtn color="gradient" onClick={() => onSetRestakeVisibility(true)}>
                        {t('restake')}
                      </BalBtn>
                      <BalBtn
                        outline
                        color="blue"
                        disabled={fiatValueOfStakedShares === '0'}
                        onClick={showUnstakePreview}
                      >
                        {t('unstake')}
                      </BalBtn>
                    </BalStack>
                  ) : (
                    <BalStack horizontal spacing="sm" style={{ marginTop: '8px' }}>
                      <BalBtn color="gradient" disabled={isStakeDisabled} onClick={showStakePreview}>
                        {t('stake')}
                      </BalBtn>
                      <BalBtn
                        outline
                        color="blue"
                        disabled={fiatValueOfStakedShares === '0'}
                        onClick={showUnstakePreview}
                      >
                        {t('unstake')}
                      </BalBtn>
                    </BalStack>
                  )}
                  {/* {hasNonPrefGaugeBalance && networkId === 'MAINNET' && (
                    <BalAlert style={{ marginTop: '8px' }} title={t('staking.restakeGauge')}>
                      {t('staking.restakeGaugeDescription')}
                    </BalAlert>
                  )} */}
                </BalStack>
              </ContentWrapper>
            </BalAccordion>
          </AccordionContainer>
        </RelativeDiv>
      )}

      <StakePreviewModal
        isVisible={isStakePreviewVisible}
        pool={pool}
        action={stakeAction}
        onClose={handlePreviewClose}
      />
    </Container>
  )
}

export default StakingIncentivesCard


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

const StakePreviewModal = ({
  isVisible,
  pool,
  action,
  onClose,
}: {
  isVisible: boolean
  pool: Pool
  action: StakeAction
  onClose: () => void
}) => {
  return isVisible ? (
    <div style={{ padding: '16px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <p>Stake Preview Modal – Action: {action}</p>
      <p>Pool: {pool.symbol}</p>
      <button onClick={onClose}>Close</button>
    </div>
  ) : null
}

const BalAccordion = ({
  className,
  sections,
  reCalcKey,
  isOpenedByDefault,
  children,
}: {
  className?: string
  sections: any
  reCalcKey: number
  isOpenedByDefault: boolean
  children: React.ReactNode
}) => {
  // For simplicity, render children directly.
  return <div className={className}>{children}</div>
}

const BalIcon = ({ size, name, style }: { size?: string; name: string; style?: React.CSSProperties }) => {
  return <span style={style}>{name}</span>
}

const BalTooltip = ({ text }: { text: string }) => (
  <span
    style={{
      marginLeft: '8px',
      background: '#eee',
      padding: '2px 4px',
      borderRadius: '4px',
      fontSize: '12px',
    }}
  >
    {text}
  </span>
)

const Container = styled.div`
  padding: 16px;
`

const RelativeDiv = styled.div`
  position: relative;
`

const HeaderButton = styled.button`
  width: 100%;
  padding: 16px;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
`

const HeaderTitle = styled.h6`
  margin: 0;
`

const StatusCircle = styled.div<{ isStakable: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 50%;
  background: ${(props) => (props.isStakable ? '#22c55e' : '#9ca3af')};
  color: white;
`

const ContentWrapper = styled.div`
  background: white;
  border-top: 1px solid #ccc;
  padding: 16px;
  border-radius: 0 0 8px 8px;
`

// ─── ANIMATION & ACCORDION CONTAINER ─────────────────────────────
const animHalf = keyframes`
  from { background-position: 0; }
  to { background-position: 125%; }
`

const anim = keyframes`
  from { background-position: 125%; }
  to { background-position: 600%; }
`

const AccordionContainer = styled.div<{ isHandle: boolean }>`
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  /* Pseudo-element for the animated border */
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: -2px;
    width: 100%;
    height: calc(100% + 4px);
    background: linear-gradient(90deg, #4254ff, #f441a5, #ffeb3b, #4254ff);
    background-size: 400%;
    animation: ${animHalf} 3s ease-out both;
    border-radius: 14px;
    z-index: -1;
  }
  &:hover::before {
    animation: ${anim} 12s linear infinite;
  }
`
