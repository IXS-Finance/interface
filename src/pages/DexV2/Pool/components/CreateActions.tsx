import React, { useEffect, useMemo, useState } from 'react'
import { TransactionActionInfo } from 'pages/DexV2/types/transactions'
import { usePoolCreation } from 'state/dexV2/poolCreation/hooks/usePoolCreation'
import { usePoolCreationState } from 'state/dexV2/poolCreation/hooks'
import useTokenApprovalActions from 'hooks/dex-v2/approvals/useTokenApprovalActions'
import { useWeb3React } from 'hooks/useWeb3React'
import config from 'lib/config'
import ActionSteps from './ActionSteps'
import { useTokensState } from 'state/dexV2/tokens/hooks'
import { ApprovalAction } from 'hooks/dex-v2/approvals/types'
import { useTokens } from 'state/dexV2/tokens/hooks/useTokens'

interface Props {
  tokenAddresses: string[]
  amounts: string[]
  createDisabled: boolean
  goBack: () => void
  success: () => void
}

const CreateActions: React.FC<Props> = ({ amounts, tokenAddresses, goBack }) => {
  const { needsSeeding, poolId, hasRestoredFromSavedState, poolTypeString, createPool, joinPool } = usePoolCreation()
  const { getTokenApprovalActions } = useTokenApprovalActions()
  const { account, chainId } = useWeb3React()
  const { allowanceLoading, allowances } = useTokensState()
  const { tokens } = useTokens()
  const [loading, setLoading] = useState(false)

  const initActions: TransactionActionInfo[] = [
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

  const networkConfig = config[chainId]

  const [isRestoredTxConfirmed, setIsRestoredTxConfirmed] = useState(false)
  const [actions, setActions] = useState<TransactionActionInfo[]>(initActions)

  const amountsToApprove = amounts.map((amount, index) => {
    return {
      address: tokenAddresses[index],
      amount,
    }
  })

  const requiredActions = (() => {
    if ((hasRestoredFromSavedState && needsSeeding) || isRestoredTxConfirmed) {
      return actions.filter((action) => action.label === 'Fund pool')
    }
    return actions
  })()

  const getActions = async () => {
    setLoading(true)
    const approvalActions = await getTokenApprovalActions({
      amountsToApprove,
      spender: networkConfig.addresses.vault,
      actionType: ApprovalAction.AddLiquidity,
      forceMax: false,
    })
    setLoading(false)
    setActions([...approvalActions, ...initActions])
  }

  useEffect(() => {
    const numberOfTokens = Object.keys(tokens).length
    if (amountsToApprove.length && numberOfTokens >= amountsToApprove.length) {
      getActions()
    }
  }, [JSON.stringify(amountsToApprove), JSON.stringify(tokens)])

  if (allowanceLoading) {
    return <div>Loading...</div>
  }

  console.log('requiredActions', requiredActions)

  if (loading) {
    return <div>Loading check for approvals...</div>
  }

  return (
    <div>
      <ActionSteps requiredActions={requiredActions} primaryActionType="createPool" disabled={false} goBack={goBack} />
    </div>
  )
}

export default CreateActions
