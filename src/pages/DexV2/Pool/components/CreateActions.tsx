import React, { useMemo, useState } from 'react'
import { BackButton, NavigationButtons, NextButton } from '../Create'
import { TransactionActionInfo } from 'pages/DexV2/types/transactions'
import { usePoolCreation } from 'state/dexV2/poolCreation/hooks/usePoolCreation'
import { usePoolCreationState } from 'state/dexV2/poolCreation/hooks'

interface Props {
  tokenAddresses: string[]
  amounts: string[]
  createDisabled: boolean
  goBack: () => void
  success: () => void
}

const CreateActions: React.FC<Props> = ({ goBack }) => {
  const { hasRestoredFromSavedState, poolTypeString, createPool, joinPool } = usePoolCreation()
  const { needsSeeding } = usePoolCreationState()

  const [isRestoredTxConfirmed, setIsRestoredTxConfirmed] = useState(false)

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

  const requiredActions = useMemo(() => {
    if ((hasRestoredFromSavedState && needsSeeding) || isRestoredTxConfirmed) {
      return actions.filter((action) => action.label === 'Fund pool')
    }

    return actions
  }, [])

  const onSubmit = async () => {
    try {
      createPool()
    } catch (e) {
      console.error(e)
    }
  }
  return (
    <div>
      <NavigationButtons>
        <BackButton onClick={goBack}>Back</BackButton>
        <NextButton onClick={onSubmit}>Next</NextButton>
      </NavigationButtons>
    </div>
  )
}

export default CreateActions
