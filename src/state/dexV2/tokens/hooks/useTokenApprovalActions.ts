import { MaxUint256 } from '@ethersproject/constants'
import { parseUnits } from '@ethersproject/units'
import { simulateContract, waitForTransactionReceipt, writeContract } from '@wagmi/core'
import { flatten } from 'lodash'
import { Address, erc20Abi } from 'viem'

import { wagmiConfig } from 'components/Web3Provider'
import { useWeb3React } from 'hooks/useWeb3React'
import { TokenInfo } from 'types/TokenList'
import { useTokens } from './useTokens'
import { TransactionActionInfo } from 'pages/DexV2/types/transactions'
import { bnum } from 'lib/utils'

interface Params {
  amountsToApprove: AmountToApprove[]
  spender: string
  actionType: ApprovalAction
  forceMax?: boolean
  skipAllowanceCheck?: boolean
}

export type AmountToApprove = {
  address: string
  amount: string // normalized amount
}

export enum ApprovalAction {
  AddLiquidity,
  Locking,
  Staking,
  Swapping,
  Unapprove,
  Unwrapping,
}

interface ApproveTokenParams {
  token: TokenInfo
  normalizedAmount: string
  spender: string
  actionType: ApprovalAction
  forceMax?: boolean
}

export default function useTokenApprovalActions() {
  const { account } = useWeb3React()
  const { injectSpenders, refetchAllowances, getToken, approvalsRequired, allowanceFor, approvalRequired } = useTokens()

  function actionLabel(actionType: ApprovalAction, symbol: string): string {
    switch (actionType) {
      case ApprovalAction.Locking:
        return `Approve ${symbol} for locking`
      case ApprovalAction.Staking:
        return `Approve ${symbol} for staking`
      case ApprovalAction.Swapping:
        return `Approve ${symbol} for swapping`
      case ApprovalAction.Unapprove:
        return `Unapprove ${symbol}`
      case ApprovalAction.Unwrapping:
        return `Approve ${symbol} for unwrapping`
      default:
        return `Approve ${symbol}`
    }
  }

  function actionTooltip(actionType: ApprovalAction, symbol: string): string {
    switch (actionType) {
      case ApprovalAction.Locking:
        return `You must approve ${symbol} to lock this token. Approvals are required once per token, per wallet.`
      case ApprovalAction.Staking:
        return `You must approve ${symbol} to stake this token on Balancer. Approvals are required once per token, per wallet.`
      case ApprovalAction.Swapping:
        return `You must approve ${symbol} to swap this token on Balancer. Approvals are required once per token, per wallet.`
      case ApprovalAction.Unapprove:
        return `You must unapprove ${symbol} before a new approval value can be set`
      case ApprovalAction.Unwrapping:
        return `You must approve ${symbol} to unwrap this token. Approvals are required once per token, per wallet.`
      default:
        return `You must approve ${symbol} to add liquidity for this token on Balancer. Approvals are required once per token, per wallet.`
    }
  }

  async function updateAllowancesFor(spender: string): Promise<void> {
    injectSpenders([spender])
    refetchAllowances(spender)
  }

  async function getApprovalsRequired(
    amountsToApprove: AmountToApprove[],
    spender: string,
    skipAllowanceCheck = false
  ) {
    if (!skipAllowanceCheck) {
      await updateAllowancesFor(spender)
    }

    return approvalsRequired(amountsToApprove, spender)
  }

  /**
   * Triggers ERC20 approval transaction for a given token, waits for
   * confirmation and then triggers the transaction notification.
   *
   * @param {TokenInfo} token The token to approve.
   * @param {string} normalizedAmount The amount to approve, normalized, if
   * forceMax is false.
   * @param {string} spender The contract address to give the approval too,
   * typically the vault.
   * @param {ApprovalAction} actionType The action type that follows the
   * approval, used for labeling of tx notification.
   * @param {boolean} forceMax If true, the approval will be for the maximum
   * possible amount.
   * @returns {Promise<TransactionResponse>} The transaction response.
   */
  async function approveToken({ token, normalizedAmount, spender, actionType, forceMax = false }: ApproveTokenParams) {
    const amount = forceMax ? MaxUint256.toString() : parseUnits(normalizedAmount, token.decimals).toString()
    debugger;
    const address = token.address as Address
    const spenderAddress = spender as Address

    // @ts-ignore
    const { request } = await simulateContract(wagmiConfig, {
      account,
      address,
      abi: erc20Abi,
      // @ts-ignore
      args: [spenderAddress, amount],
      functionName: 'approve',
    })

    // @ts-ignore
    const txHash = await writeContract(wagmiConfig, request)

    await waitForTransactionReceipt(wagmiConfig, { hash: txHash })

    return txHash
  }

  /**
   * Some tokens require setting their approval amount to 0 first before being
   * able to adjust the value up again. This returns true for tokens that requires
   * this and false otherwise.
   */
  function isDoubleApprovalRequired(token: any, spender: any): boolean {
    return false
    // return !!(
    //   configService.network.tokens.DoubleApprovalRequired?.includes(token.address) &&
    //   allowanceFor(token.address, spender).gt(0)
    // )
  }

  async function isApprovalValid(amountToApprove: AmountToApprove, spender: string): Promise<boolean> {
    if (bnum(amountToApprove.amount).eq(0)) return true

    await updateAllowancesFor(spender)

    return !approvalRequired(amountToApprove.address, amountToApprove.amount, spender)
  }

  /**
   * Create an action for BalActionSteps that approves a token for spending.
   * @param {TokenInfo} token The token to approve.
   * @param {string} normalizedAmount The amount to approve, normalized, if
   * forceMax is false.
   * @param {string} spender The contract address to give the approval too,
   * typically the vault.
   * @param {ApprovalAction} actionType The action type that follows the
   * approval, used for labeling of tx notification.
   * @param {boolean} forceMax If true, the approval will be for the maximum
   * possible amount.
   * @returns {TransactionActionInfo} The transaction
   */
  function createApprovalAction({
    token,
    normalizedAmount,
    spender,
    actionType,
    forceMax = false,
  }: ApproveTokenParams): TransactionActionInfo {
    return {
      label: actionLabel(actionType, token.symbol),
      loadingLabel: 'Confirm approval in wallet',
      confirmingLabel: 'Confirming...',
      stepTooltip: actionTooltip(actionType, token.symbol),
      action: () => {
        return approveToken({
          token,
          normalizedAmount,
          spender,
          actionType,
          forceMax,
        })
      },
      postActionValidation: () => {
        return isApprovalValid({ address: token.address, amount: normalizedAmount }, spender)
      },
      actionInvalidReason: {
        title: 'Approval insufficient',
        description: "Approved amount isn't enough to cover the transaction, please try again.",
      },
    }
  }

  /**
   * Returns a list of TransactionActions to approve tokens for a given spender.
   * Typically used to inject into BalActionSteps.
   *
   * @param {AmountToApprove[]} amountsToApprove The list of tokens and amounts
   * to approve.
   * @param {string} spender The contract address to give the approval too,
   * typically the vault.
   * @param {ApprovalAction} actionType The action type that follows the
   * approval, used for labeling.
   * @param {boolean} forceMaxApprovals If true, the approval will be for the
   * maximum possible amount.
   * @returns {Promise<TransactionActionInfo[]>} The list of TransactionActions.
   */
  async function getTokenApprovalActions({
    amountsToApprove,
    spender,
    actionType,
    forceMax = false,
    skipAllowanceCheck = false,
  }: Params): Promise<TransactionActionInfo[]> {
    const approvalsRequired = await getApprovalsRequired(amountsToApprove, spender, skipAllowanceCheck)

    return flatten(
      approvalsRequired.map((amountToApprove: any) => {
        const token = getToken(amountToApprove.address)
        const actions: TransactionActionInfo[] = []

        /**
         * Some tokens require setting approved amount to 0 before changing the
         * approval amount. This injects another action to do that.
         */
        if (isDoubleApprovalRequired(token, spender)) {
          actions.push(
            createApprovalAction({
              token,
              normalizedAmount: '0',
              spender,
              actionType: ApprovalAction.Unapprove,
              forceMax: false,
            })
          )
        }

        actions.push(
          createApprovalAction({
            token,
            normalizedAmount: amountToApprove.amount,
            spender,
            actionType,
            forceMax,
          })
        )

        return actions
      })
    )
  }

  return {
    approveToken,
    getTokenApprovalActions,
  }
}
