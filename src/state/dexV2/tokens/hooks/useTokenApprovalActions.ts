import { MaxUint256 } from '@ethersproject/constants'
import { parseUnits } from '@ethersproject/units'
import { simulateContract, waitForTransactionReceipt, writeContract } from '@wagmi/core'
import { wagmiConfig } from 'components/Web3Provider'
import { useWeb3React } from 'hooks/useWeb3React'
import { TokenInfo } from 'types/TokenList'
import { Address } from 'viem'
import { useTokens } from './useTokens'

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
  const { injectSpenders, refetchAllowances } = useTokens()

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

  return {
    approveToken,
  }
}
