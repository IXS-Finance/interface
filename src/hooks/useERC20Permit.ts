import JSBI from 'jsbi'
import { Percent, CurrencyAmount, Currency, TradeType, Token } from '@ixswap1/sdk-core'
import { Trade as V2Trade } from '@ixswap1/v2-sdk'
import { splitSignature } from 'ethers/lib/utils'
import { useMemo, useState } from 'react'
import { IXS, USDC } from '../constants/tokens'
import { useSingleCallResult } from '../state/multicall/hooks'
import { useWeb3React } from 'hooks/useWeb3React'
import { useEIP2612Contract } from './useContract'
import useIsArgentWallet from './useIsArgentWallet'
import useTransactionDeadline from './useTransactionDeadline'

enum PermitType {
  AMOUNT = 1,
  ALLOWED = 2,
}

// 20 minutes to submit after signing
const PERMIT_VALIDITY_BUFFER = 20 * 60

interface PermitInfo {
  type: PermitType
  name: string
  // version is optional, and if omitted, will not be included in the domain
  version?: string
}

// todo: read this information from extensions on token lists or elsewhere (permit registry?)
const PERMITTABLE_TOKENS: {
  [chainId: number]: {
    [checksummedTokenAddress: string]: PermitInfo
  }
} = {
  [1]: {
    [USDC[1].address]: { type: PermitType.AMOUNT, name: 'USD Coin', version: '2' },
    [IXS[1].address]: { type: PermitType.AMOUNT, name: 'Ixs Token' },
  },
  [4]: {
    [IXS[4].address]: { type: PermitType.AMOUNT, name: 'Ixs Token' },
  },
  [3]: {
    [IXS[3].address]: { type: PermitType.AMOUNT, name: 'Ixs Token' },
  },
  [5]: {
    [IXS[5].address]: { type: PermitType.AMOUNT, name: 'Ixs Token' },
  },
  [42]: {
    [IXS[42].address]: { type: PermitType.AMOUNT, name: 'Ixs Token' },
    [USDC[42].address]: { type: PermitType.AMOUNT, name: 'USD Coin', version: '2' },
  },
  [80001]: {
    [IXS[80001].address]: { type: PermitType.AMOUNT, name: 'Ixs Token' },
    [USDC[80001].address]: { type: PermitType.AMOUNT, name: 'USD Coin', version: '2' },
  },
  [80002]: {
    [IXS[80001].address]: { type: PermitType.AMOUNT, name: 'Ixs Token' },
    [USDC[80001].address]: { type: PermitType.AMOUNT, name: 'USD Coin', version: '2' },
  },
  [137]: {
    [IXS[137].address]: { type: PermitType.AMOUNT, name: 'Ixs Token' },
    [USDC[137].address]: { type: PermitType.AMOUNT, name: 'USD Coin', version: '2' },
  },
  [84532]: {
    [IXS[84532].address]: { type: PermitType.AMOUNT, name: 'Ixs Token' },
    [USDC[84532].address]: { type: PermitType.AMOUNT, name: 'USD Coin', version: '2' },
  },
  [8453]: {
    [IXS[8453].address]: { type: PermitType.AMOUNT, name: 'Ixs Token' },
    [USDC[8453].address]: { type: PermitType.AMOUNT, name: 'USD Coin', version: '2' },
  },
  [153]: {
    [IXS[153].address]: { type: PermitType.AMOUNT, name: 'Ixs Token' },
    [USDC[153].address]: { type: PermitType.AMOUNT, name: 'USD Coin', version: '2' },
  },
  [151]: {
    [IXS[151].address]: { type: PermitType.AMOUNT, name: 'Ixs Token' },
    [USDC[151].address]: { type: PermitType.AMOUNT, name: 'USD Coin', version: '2' },
  },
}

export enum UseERC20PermitState {
  // returned for any reason, e.g. it is an argent wallet, or the currency does not support it
  NOT_APPLICABLE,
  LOADING,
  NOT_SIGNED,
  SIGNED,
}

interface BaseSignatureData {
  v: number
  r: string
  s: string
  deadline: number
  nonce: number
  owner: string
  spender: string
  chainId: number
  tokenAddress: string
  permitType: PermitType
}

export interface StandardSignatureData extends BaseSignatureData {
  amount: string
}

export interface AllowedSignatureData extends BaseSignatureData {
  allowed: true
}

export type SignatureData = StandardSignatureData | AllowedSignatureData

const EIP712_DOMAIN_TYPE = [
  { name: 'name', type: 'string' },
  { name: 'version', type: 'string' },
  { name: 'chainId', type: 'uint256' },
  { name: 'verifyingContract', type: 'address' },
]

const EIP712_DOMAIN_TYPE_NO_VERSION = [
  { name: 'name', type: 'string' },
  { name: 'chainId', type: 'uint256' },
  { name: 'verifyingContract', type: 'address' },
]

const EIP2612_TYPE = [
  { name: 'owner', type: 'address' },
  { name: 'spender', type: 'address' },
  { name: 'value', type: 'uint256' },
  { name: 'nonce', type: 'uint256' },
  { name: 'deadline', type: 'uint256' },
]

const PERMIT_ALLOWED_TYPE = [
  { name: 'holder', type: 'address' },
  { name: 'spender', type: 'address' },
  { name: 'nonce', type: 'uint256' },
  { name: 'expiry', type: 'uint256' },
  { name: 'allowed', type: 'bool' },
]

export function useERC20Permit(
  currencyAmount: CurrencyAmount<Currency> | null | undefined,
  spender: string | null | undefined,
  overridePermitInfo: PermitInfo | undefined | null
): {
  signatureData: SignatureData | null
  state: UseERC20PermitState
  gatherPermitSignature: null | (() => Promise<void>)
} {
  const { account, chainId, provider: library } = useWeb3React()
  const transactionDeadline = useTransactionDeadline()

  const tokenAddress = currencyAmount?.currency?.isToken ? currencyAmount.currency.address : undefined
  const eip2612Contract = useEIP2612Contract(tokenAddress)
  const isArgentWallet = useIsArgentWallet()
  const nonceInputs = useMemo(() => [account ?? undefined], [account])
  const tokenNonceState = useSingleCallResult(eip2612Contract, 'nonces', nonceInputs)

  const permitInfo =
    overridePermitInfo ?? (chainId && tokenAddress ? PERMITTABLE_TOKENS[chainId][tokenAddress] : undefined)

  const [signatureData, setSignatureData] = useState<SignatureData | null>(null)

  return useMemo(() => {
    if (
      isArgentWallet ||
      !currencyAmount ||
      !eip2612Contract ||
      !account ||
      !chainId ||
      !transactionDeadline ||
      !library ||
      !tokenNonceState.valid ||
      !tokenAddress ||
      !spender ||
      !permitInfo
    ) {
      return {
        state: UseERC20PermitState.NOT_APPLICABLE,
        signatureData: null,
        gatherPermitSignature: null,
      }
    }

    const nonceNumber = tokenNonceState.result?.[0]?.toNumber()
    if (tokenNonceState.loading || typeof nonceNumber !== 'number') {
      return {
        state: UseERC20PermitState.LOADING,
        signatureData: null,
        gatherPermitSignature: null,
      }
    }

    const isSignatureDataValid =
      signatureData &&
      signatureData.owner === account &&
      signatureData.deadline >= transactionDeadline.toNumber() &&
      signatureData.tokenAddress === tokenAddress &&
      signatureData.nonce === nonceNumber &&
      signatureData.spender === spender &&
      ('allowed' in signatureData || JSBI.equal(JSBI.BigInt(signatureData.amount), currencyAmount.quotient))

    return {
      state: isSignatureDataValid ? UseERC20PermitState.SIGNED : UseERC20PermitState.NOT_SIGNED,
      signatureData: isSignatureDataValid ? signatureData : null,
      gatherPermitSignature: async function gatherPermitSignature() {
        const allowed = permitInfo.type === PermitType.ALLOWED
        const signatureDeadline = transactionDeadline.toNumber() + PERMIT_VALIDITY_BUFFER
        const value = currencyAmount.quotient.toString()

        const message = allowed
          ? {
              holder: account,
              spender,
              allowed,
              nonce: nonceNumber,
              expiry: signatureDeadline,
            }
          : {
              owner: account,
              spender,
              value,
              nonce: nonceNumber,
              deadline: signatureDeadline,
            }
        const domain = permitInfo.version
          ? {
              name: permitInfo.name,
              version: permitInfo.version,
              verifyingContract: tokenAddress,
              chainId,
            }
          : {
              name: permitInfo.name,
              verifyingContract: tokenAddress,
              chainId,
            }
        const data = JSON.stringify({
          types: {
            EIP712Domain: permitInfo.version ? EIP712_DOMAIN_TYPE : EIP712_DOMAIN_TYPE_NO_VERSION,
            Permit: allowed ? PERMIT_ALLOWED_TYPE : EIP2612_TYPE,
          },
          domain,
          primaryType: 'Permit',
          message,
        })

        return library
          .send('eth_signTypedData_v4', [account, data])
          .then(splitSignature)
          .then((signature: any) => {
            setSignatureData({
              v: signature.v,
              r: signature.r,
              s: signature.s,
              deadline: signatureDeadline,
              ...(allowed ? { allowed } : { amount: value }),
              nonce: nonceNumber,
              chainId,
              owner: account,
              spender,
              tokenAddress,
              permitType: permitInfo.type,
            })
          })
      },
    }
  }, [
    currencyAmount,
    eip2612Contract,
    account,
    chainId,
    isArgentWallet,
    transactionDeadline,
    library,
    tokenNonceState.loading,
    tokenNonceState.valid,
    tokenNonceState.result,
    tokenAddress,
    spender,
    permitInfo,
    signatureData,
  ])
}

const REMOVE_V2_LIQUIDITY_PERMIT_INFO: PermitInfo = {
  version: '1',
  name: 'Ixs Liquidity Token',
  type: PermitType.AMOUNT,
}

export function useV2LiquidityTokenPermit(
  liquidityAmount: CurrencyAmount<Token> | null | undefined,
  spender: string | null | undefined
) {
  return useERC20Permit(liquidityAmount, spender, REMOVE_V2_LIQUIDITY_PERMIT_INFO)
}

export function useERC20PermitFromTrade(
  trade: V2Trade<Currency, Currency, TradeType> | undefined,
  allowedSlippage: Percent
) {
  const amountToApprove = useMemo(
    () => (trade ? trade.maximumAmountIn(allowedSlippage) : undefined),
    [trade, allowedSlippage]
  )

  return useERC20Permit(
    amountToApprove,
    // v2 router does not support
    undefined,
    null
  )
}
