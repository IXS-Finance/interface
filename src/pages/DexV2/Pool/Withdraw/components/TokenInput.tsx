import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { Flex } from 'rebass'
import _get from 'lodash/get'

import TokenSelectInput from '../../../common/TokenSelectInput'
import { ReactComponent as WalletIcon } from 'assets/images/dex-v2/wallet.svg'
import { useTokens } from 'state/dexV2/tokens/hooks/useTokens'
import useNumbers, { FNumFormats } from 'hooks/dex-v2/useNumbers'
import { bnum, isSameAddress } from 'lib/utils'
import { TokenInfo } from 'types/TokenList'
import { useAccount } from 'wagmi'
import { isLessThanOrEqualTo, isPositive } from 'lib/utils/validations'
import { Rules } from 'pages/DexV2/types'
import { overflowProtected } from 'pages/DexV2/Pool/components/helpers'
import { useTokensState } from 'state/dexV2/tokens/hooks'

type InputValue = string | number

type Props = {
  disabled?: boolean
  name: string
  amount: InputValue
  address?: string
  weight?: number | string
  noRules?: boolean
  noMax?: boolean
  priceImpact?: number
  label?: string
  fixedToken?: boolean
  customBalance?: string
  balanceLabel?: string
  disableMax?: boolean
  disableBalance?: boolean
  balanceLoading?: boolean
  hint?: string
  hintAmount?: string
  excludedTokens?: string[]
  options?: string[]
  rules?: Rules
  autoFocus?: boolean
  disableNativeAssetBuffer?: boolean
  hideFooter?: boolean
  hideFiatValue?: boolean
  ignoreWalletBalance?: boolean
  tokenValue?: string
  placeholder?: string
  slider?: boolean
  updateAmount: (amount: string) => void
  updateAddress: (address: string) => void
  setMax?: () => void
}

const defaultProps: Props = {
  name: '',
  amount: '',
  address: '',
  weight: 0,
  noRules: false,
  noMax: false,
  fixedToken: false,
  disableMax: false,
  disableBalance: false,
  balanceLoading: false,
  hintAmount: '',
  disableNativeAssetBuffer: false,
  hideFooter: false,
  hideFiatValue: false,
  ignoreWalletBalance: false,
  rules: [],
  priceImpact: 0,
  label: '',
  customBalance: '',
  balanceLabel: '',
  hint: '',
  excludedTokens: [],
  placeholder: '',
  slider: false,
  updateAmount: () => {},
  updateAddress: () => {},
  setMax: () => {},
}

const TokenInput: React.FC<Props> = (props) => {
  const finalProps = { ...defaultProps, ...props }
  const { disabled, name, noMax, disableMax, customBalance, excludedTokens, autoFocus, hideFiatValue, disableNativeAssetBuffer, updateAddress } = finalProps
  const [address, setAddress] = useState<any>('')
  const [amount, setAmount] = useState<any>('')

  const { address: account } = useAccount()
  const isWalletReady = account !== null
  const { fNum, toFiat } = useNumbers()
  const { getToken, balanceFor, nativeAsset, getMaxBalanceFor } = useTokens()
  const { balances } = useTokensState()

  // Derived values (computed inline)
  const tokenBalance = customBalance ? customBalance : balanceFor(_get(finalProps, 'address', ''))
  const hasToken = !!finalProps.address
  const amountBN = bnum(finalProps.amount)
  const tokenBalanceBN = bnum(tokenBalance)
  const hasAmount = amountBN.gt(0)
  const hasBalance = tokenBalanceBN.gt(0)
  const shouldUseTxBuffer = finalProps.address === nativeAsset.address && !disableNativeAssetBuffer
  const amountExceedsTokenBalance = amountBN.gt(tokenBalance)
  const shouldShowTxBufferMessage = (amountExceedsTokenBalance || !shouldUseTxBuffer || !hasBalance || !hasAmount)
    ? false
    : amountBN.gte(tokenBalanceBN.minus(nativeAsset.minTransactionBuffer))
  const isMaxed = shouldUseTxBuffer
    ? (finalProps.amount === tokenBalanceBN.minus(nativeAsset.minTransactionBuffer).toString())
    : (finalProps.amount === tokenBalance)
  const token: TokenInfo | undefined = !hasToken ? undefined : getToken(_get(finalProps, 'address', ''))
  const tokenValue = finalProps.tokenValue ?? toFiat(amount, _get(finalProps, 'address', ''))
  const inputRules = (() => {
    if (!hasToken || !isWalletReady || finalProps.noRules) return [isPositive()]
    const arr = finalProps.rules ? [...finalProps.rules, isPositive()] : [isPositive()]
    if (!finalProps.ignoreWalletBalance) {
      arr.push(isLessThanOrEqualTo(tokenBalance, 'exceedsBalance'))
    }
    return arr
  })()
  const maxPercentage = (!hasBalance || !hasAmount)
    ? '0'
    : amountBN.div(tokenBalance).times(100).toFixed(2)
  const bufferPercentage = !shouldShowTxBufferMessage
    ? '0'
    : bnum(nativeAsset.minTransactionBuffer).div(tokenBalance).times(100).toFixed(2)
  const barColor = amountExceedsTokenBalance ? 'red' : 'green'
  const priceImpactSign = _get(finalProps, 'priceImpact', 0) >= 0 ? '-' : '+'
  const priceImpactClass = _get(finalProps, 'priceImpact', 0) >= 0.01 ? 'text-red-500' : ''
  const decimalLimit = token?.decimals || 18

  function handleAmountChange(amount: InputValue) {
    const safeAmount = overflowProtected(amount, decimalLimit)
    setAmount(safeAmount)
    finalProps.updateAmount(safeAmount)
  }

  const setMaxHandler = () => {
    if (finalProps.disableMax) return
    const maxAmount = finalProps.customBalance
      ? finalProps.customBalance
      : getMaxBalanceFor(_get(finalProps, 'address', ''), finalProps.disableNativeAssetBuffer)
    handleAmountChange(maxAmount)
  }

  function blockInvalidChar(event: KeyboardEvent) {
    if (['e', 'E', '+', '-'].includes(event.key)) {
      event.preventDefault()
    }
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>): void {
    blockInvalidChar(event.nativeEvent)
  }

  useEffect(() => {
    setAddress(finalProps.address)
    setAmount(finalProps.amount)
  }, [finalProps.address, finalProps.amount])

  return (
    <Container>
      <Flex justifyContent="space-between" alignItems="center">
        <StyledInput
          disabled={disabled}
          placeholder="0.00"
          min="0"
          step="0.01"
          onKeyDown={onKeyDown}
          type="text"
          inputMode="decimal"
          pattern="[0-9]*[.,]?[0-9]*"
          value={amount}
          name={name}
          autoFocus={autoFocus}
          onChange={(e) => handleAmountChange(e.target.value)}
        />
        <Flex alignItems="center" style={{ gap: 8 }}>
          <TokenSelectInput
            modelValue={address as string}
            fixed={finalProps.fixedToken}
            excludedTokens={excludedTokens}
            updateAddress={(value) => updateAddress(value)}
          />
        </Flex>
      </Flex>
      <Flex justifyContent="space-between" alignItems="center">
        {hasAmount && hasToken && !finalProps.hideFiatValue ? (
          <StyledNumber>{fNum(tokenValue, FNumFormats.fiat)}</StyledNumber>
        ) : (
          <div />
        )}
        <Flex alignItems="center" style={{ gap: 8 }}>
          {hasBalance && !finalProps.noMax && !finalProps.disableMax ? (
            <MaxButton onClick={setMaxHandler}>Max</MaxButton>
          ) : null}
          <StyledNumber>{fNum(tokenBalance, FNumFormats.token)}</StyledNumber>
          <WalletIcon />
        </Flex>
      </Flex>
    </Container>
  )
}

export default TokenInput

const Container = styled.div`
  border-radius: 8px;
  background: #f7f7fa;
  display: flex;
  padding: 16px;
  flex-direction: column;
  gap: 8px;
`

const StyledInput = styled.input`
  color: rgba(41, 41, 51, 0.9);
  font-family: Inter;
  font-size: 28px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  letter-spacing: -0.84px;
  text-align: left;
  outline: none;
  border: none;
  background: transparent;
  min-width: 50px;
  max-width: 234px;
`

const StyledNumber = styled.div`
  color: #b8b8d2;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  letter-spacing: -0.42px;
`

const MaxButton = styled.div`
  color: #2563eb;
  transition: color 0.2s ease-in-out;
  font-size: 14px;
  text-transform: capitalize;
  cursor: pointer;

  &:hover {
    color: #8b5cf6;
  }

  &:focus {
    color: #8b5cf6;
  }
`
