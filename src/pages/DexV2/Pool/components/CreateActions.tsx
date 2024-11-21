import React from 'react'
import { BackButton, NavigationButtons, NextButton } from '../Create'
import { TransactionActionInfo } from 'pages/DexV2/types/transactions'
import { usePoolCreation } from 'state/dexV2/poolCreation/hooks/usePoolCreation'

interface Props {
  tokenAddresses: string[]
  amounts: string[]
  createDisabled: boolean
  goBack: () => void
  success: () => void
}

const CreateActions: React.FC<Props> = ({ goBack }) => {
  const { poolTypeString, createPool, joinPool } = usePoolCreation()

  const actions: TransactionActionInfo[] = [
    {
      label: 'Create Pool',
      loadingLabel: 'Confirm create in wallet',
      confirmingLabel: 'Confirming...',
      action: createPool,
      stepTooltip: `Create ${poolTypeString} pool`,
    },
    {
      label: 'Fund pool',
      loadingLabel: 'Confirm funding in wallet',
      confirmingLabel: 'Confirming...',
      action: joinPool,
      stepTooltip: 'Add the initial liquidity for this pool.',
    },
  ]

  return (
    <div>
      <NavigationButtons>
        <BackButton onClick={goBack}>Back</BackButton>
        <NextButton>Next</NextButton>
      </NavigationButtons>
    </div>
  )
}

export default CreateActions
