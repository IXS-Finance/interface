import React, { useEffect, useMemo, useState } from 'react'
import { BackButton, NavigationButtons, NextButton } from '../Create'
import { TransactionActionInfo } from 'pages/DexV2/types/transactions'
import { usePoolCreation } from 'state/dexV2/poolCreation/hooks/usePoolCreation'
import { usePoolCreationState } from 'state/dexV2/poolCreation/hooks'
import useTokenApprovalActions, { ApprovalAction } from 'state/dexV2/tokens/hooks/useTokenApprovalActions'
import { useWeb3React } from 'hooks/useWeb3React'
import config from 'lib/config'

interface Props {
  tokenAddresses: string[]
  amounts: string[]
  createDisabled: boolean
  goBack: () => void
  success: () => void
}

const CreateActions: React.FC<Props> = ({ amounts, tokenAddresses, goBack }) => {
  const { hasRestoredFromSavedState, poolTypeString, createPool, joinPool } = usePoolCreation()
  const { needsSeeding } = usePoolCreationState()
  const { getTokenApprovalActions } = useTokenApprovalActions()
  const { account, chainId } = useWeb3React()

  const networkConfig = config[chainId]

  const [isRestoredTxConfirmed, setIsRestoredTxConfirmed] = useState(false)

  const amountsToApprove = amounts.map((amount, index) => {
    return {
      address: tokenAddresses[index],
      amount,
    }
  })

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

  const getActions = async () => {
    const approvalActions = await getTokenApprovalActions({
      amountsToApprove,
      spender: networkConfig.addresses.vault,
      actionType: ApprovalAction.AddLiquidity,
    })

    console.log('approvalActions', approvalActions)
  }

  useEffect(() => {
    getActions()
  }, [])
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
