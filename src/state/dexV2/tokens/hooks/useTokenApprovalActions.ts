import { MaxUint256 } from '@ethersproject/constants'
import { parseUnits } from '@ethersproject/units'
import { simulateContract, waitForTransactionReceipt, writeContract } from '@wagmi/core'
import { flatten } from 'lodash';
import { Address } from 'viem'

import { wagmiConfig } from 'components/Web3Provider'
import { useWeb3React } from 'hooks/useWeb3React'
import { TokenInfo } from 'types/TokenList'
import { useTokens } from './useTokens'
import { TransactionActionInfo } from 'pages/DexV2/types/transactions'

interface Params {
  amountsToApprove: AmountToApprove[];
  spender: string;
  actionType: ApprovalAction;
  forceMax?: boolean;
  skipAllowanceCheck?: boolean;
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
  const { injectSpenders, refetchAllowances, getToken } = useTokens()

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

    // return approvalsRequired(amountsToApprove, spender)
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
  async function approveToken({ token, normalizedAmount, spender, actionType, forceMax = true }: ApproveTokenParams) {
    const amount = forceMax ? MaxUint256.toString() : parseUnits(normalizedAmount, token.decimals).toString()
    const address = token.address as Address

    // @ts-ignore
    const { request } = await simulateContract(wagmiConfig, {
      account,
      address,
      abi: ['function approve(address spender, uint256 amount) public returns (bool)'],
      args: [spender, amount],
      functionName: 'approve',
    })

    // @ts-ignore
    const txHash = await writeContract(wagmiConfig, request)

    const transaction = await waitForTransactionReceipt(wagmiConfig, { hash: txHash })

    return transaction
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
    // async function getTokenApprovalActions({
    //   amountsToApprove,
    //   spender,
    //   actionType,
    //   forceMax = true,
    //   skipAllowanceCheck = false,
    // }: Params): Promise<TransactionActionInfo[]> {
    //   const approvalsRequired = await getApprovalsRequired(
    //     amountsToApprove,
    //     spender,
    //     skipAllowanceCheck
    //   );

    //   return flatten(
    //     approvalsRequired.map(amountToApprove => {
    //       const token = getToken(amountToApprove.address);
    //       const actions: TransactionActionInfo[] = [];

    //       /**
    //        * Some tokens require setting approved amount to 0 before changing the
    //        * approval amount. This injects another action to do that.
    //        */
    //       if (isDoubleApprovalRequired(token, spender)) {
    //         actions.push(
    //           createApprovalAction({
    //             token,
    //             normalizedAmount: '0',
    //             spender,
    //             actionType: ApprovalAction.Unapprove,
    //             forceMax: false,
    //           })
    //         );
    //       }

    //       actions.push(
    //         createApprovalAction({
    //           token,
    //           normalizedAmount: amountToApprove.amount,
    //           spender,
    //           actionType,
    //           forceMax,
    //         })
    //       );

    //       return actions;
    //     })
    //   );
    // }

  return {
    approveToken,
  }
}
