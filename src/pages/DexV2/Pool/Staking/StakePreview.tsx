import React from 'react'
import styled from 'styled-components'

// Imported custom hooks & types (assume these exist in your React codebase)
import { fiatValueOf, tokensListExclBpt } from 'hooks/dex-v2/usePoolHelpers'
import { AnyPool } from 'services/pool/types'
import useNumbers from 'hooks/dex-v2/useNumbers'
// import StakeSummary from './StakeSummary'
import FeedbackCard from 'pages/DexV2/common/FeedbackCard'
import ConfirmationIndicator from 'pages/DexV2/common/ConfirmationIndicator'
import { StakeAction, useStakePreview } from './hooks/useStakePreview'
import useWeb3 from 'hooks/dex-v2/useWeb3'
import { useTokens } from 'state/dexV2/tokens/hooks/useTokens'
import { useHistory } from 'react-router-dom'
import AssetSet from 'pages/DexV2/common/AssetSet'
import StakeSummary from './StakeSummary'
import ActionSteps from 'pages/DexV2/Swap/components/ActionSteps'

// ----- Main Component Props -----
type Props = {
  pool: AnyPool
  action: StakeAction
  onClose: () => void
  onSuccess: () => void
}

// ----- Main Component -----
const StakePreview: React.FC<Props> = ({ pool, action, onClose, onSuccess }) => {
  // Custom hooks (assume these are React hooks)
  const { getToken } = useTokens()
  const { fNum } = useNumbers()
  const { isMismatchedNetwork } = useWeb3()
  const {
    isActionConfirmed,
    isActionConfirming,
    confirmationReceipt,
    isLoading,
    currentShares,
    stakeActions,
    // totalUserPoolSharePct,
    // handleSuccess,
    handleClose,
    isStakeAndZero,
  } = useStakePreview({ pool, action, onClose, onSuccess })
  const history = useHistory()

  // Calculate assetRowWidth (no useMemo used)
  const assetRowWidth = (tokensListExclBpt(pool).length * 32) / 1.5

  // Dummy translation function
  const t = (key: string) => key

  return (
    <VStack spacing="md">
      <HStack align="center" spacing="sm">
        {isActionConfirmed && (
          <Circle size={8} bgColor="green">
            <Icon name="check" />
          </Circle>
        )}
        <h4>{action} LP tokens</h4>
      </HStack>

      <Card>
        <HStack justify="space-between" align="center">
          <VStackInner>
            <h5>{fNum(currentShares)} LP tokens</h5>
            <span>{getToken(pool.address)?.symbol}</span>
          </VStackInner>
          <AssetSet addresses={tokensListExclBpt(pool)} width={assetRowWidth} size={32} />
        </HStack>
      </Card>

      <StakeSummary action={action} fiatValue={fiatValueOf(pool, currentShares)} sharePercentage={'0'} />

      {!isActionConfirmed && (
        <ActionSteps
          requiredActions={stakeActions}
          primaryActionType={action}
          isLoading={isLoading}
          disabled={isStakeAndZero || !!isMismatchedNetwork}
          // onSuccess={handleSuccess}
          // onFailed={() => {}}
        />
      )}

      {isActionConfirmed && confirmationReceipt && (
        <VStack spacing="sm">
          <ConfirmationIndicator txReceipt={confirmationReceipt} />
          {action === 'stake' ? (
            <Button variant="gradient" block onClick={() => history.push('/claim')}>
              {t('viewClaims')}
            </Button>
          ) : (
            <Button variant="gray" outlined block onClick={handleClose}>
              {t('close')}
            </Button>
          )}
        </VStack>
      )}

      {(isActionConfirming || isActionConfirmed) && <FeedbackCard />}
    </VStack>
  )
}

export default StakePreview

// ----- Styled Components -----
const VStack = styled.div<{ spacing?: 'sm' | 'md' }>`
  display: flex;
  flex-direction: column;
  gap: ${({ spacing }) => (spacing === 'md' ? '16px' : spacing === 'sm' ? '8px' : '0px')};
`

const HStack = styled.div<{ align?: string; justify?: string; spacing?: 'sm' | 'md' }>`
  display: flex;
  flex-direction: row;
  align-items: ${({ align }) => align || 'center'};
  justify-content: ${({ justify }) => justify || 'flex-start'};
  gap: ${({ spacing }) => (spacing === 'md' ? '16px' : spacing === 'sm' ? '8px' : '0px')};
`

const VStackInner = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0px;
`

const Card = styled.div`
  padding: 8px 16px;
  border: 1px solid #ccc;
  border-radius: 8px;
`

const Circle = styled.div<{ size: number; bgColor?: string }>`
  width: ${({ size }) => size * 4}px;
  height: ${({ size }) => size * 4}px;
  border-radius: 50%;
  background-color: ${({ bgColor }) => bgColor || 'green'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`

const Button = styled.button<{ variant?: string; block?: boolean; outlined?: boolean }>`
  padding: 8px 16px;
  border: ${({ outlined }) => (outlined ? '1px solid #ccc' : 'none')};
  background: ${({ variant }) =>
    variant === 'gradient' ? 'linear-gradient(to right, #f00, #00f)' : variant === 'gray' ? '#ccc' : '#007bff'};
  color: white;
  width: ${({ block }) => (block ? '100%' : 'auto')};
  border-radius: 4px;
  cursor: pointer;
`

// ----- Dummy Components for Missing UI Pieces -----
type IconProps = { name: string }
const Icon: React.FC<IconProps> = ({ name }) => <span>{name}</span>

type BalAssetSetProps = {
  addresses: string[]
  width: number
  size: number
}
const BalAssetSet: React.FC<BalAssetSetProps> = ({ addresses, width, size }) => {
  return (
    <div style={{ display: 'flex', width, gap: '4px' }}>
      {addresses.map((addr) => (
        <div
          key={addr}
          style={{
            width: size,
            height: size,
            borderRadius: '50%',
            background: '#eee',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
          }}
        >
          {addr.slice(0, 4)}
        </div>
      ))}
    </div>
  )
}
