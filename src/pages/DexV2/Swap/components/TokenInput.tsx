import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { Box, Flex } from 'rebass'
import _get from 'lodash/get'
import numeral from 'numeral'

import TokenSelectInput from '../../common/TokenSelectInput'
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
import useInputValidation from 'pages/DexV2/common/forms/useInputValidation'

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

/**
 * Returns an array of validation rule functions.
 *
 * @param hasToken - Indicates if a token is available.
 * @param isWalletReady - Indicates if the wallet is ready.
 * @param props - An object that can include `noRules`, `ignoreWalletBalance`, and an optional `rules` array.
 * @param tokenBalance - The current token balance.
 * @param t - A translation function.
 *
 * @returns An array of RuleFunction.
 */
function getInputRules(
  hasToken: boolean,
  isWalletReady: boolean,
  props: { noRules?: boolean; ignoreWalletBalance?: boolean; rules?: Rules },
  tokenBalance: string
): Rules {
  if (!hasToken || !isWalletReady || props.noRules) {
    return [isPositive()]
  }

  const rules = props.rules ? [...props.rules, isPositive()] : [isPositive()]
  if (!props.ignoreWalletBalance) {
    rules.push(isLessThanOrEqualTo(tokenBalance, 'Exceeds wallet balance'))
  }
  return rules
}

const displayNumeralNoDecimal = (amount: any) => numeral(amount).format('0,0')

const TokenInput: React.FC<Props> = (props = defaultProps) => {
  const {
    disabled,
    name,
    noMax,
    disableMax,
    customBalance,
    excludedTokens,
    autoFocus,
    hideFiatValue,
    disableNativeAssetBuffer,
    updateAddress,
  } = props
  const [address, setAddress] = useState<any>('')
  const [amount, setAmount] = useState<any>('')
  const [displayValue, setDisplayValue] = useState<string>('')

  const { address: account } = useAccount()
  const isWalletReady = account !== null
  const { fNum, toFiat } = useNumbers()
  const { getToken, balanceFor, nativeAsset, getMaxBalanceFor } = useTokens()

  /**
   * COMPUTED
   */
  const tokenBalance = customBalance ? customBalance : balanceFor(_get(props, 'address', ''))

  const hasToken = !!props.address
  const amountBN = bnum(props.amount)
  const tokenBalanceBN = bnum(tokenBalance)
  const hasAmount = amountBN.gt(0)
  const hasBalance = tokenBalanceBN.gt(0)
  const shouldUseTxBuffer = props.address === nativeAsset.address && !disableNativeAssetBuffer
  const amountExceedsTokenBalance = amountBN.gt(tokenBalance)
  const shouldShowTxBufferMessage =
    !amountExceedsTokenBalance &&
    shouldUseTxBuffer &&
    hasBalance &&
    hasAmount &&
    amountBN.gte(tokenBalanceBN.minus(nativeAsset.minTransactionBuffer))

  const isMaxed = shouldUseTxBuffer
    ? props.amount === tokenBalanceBN.minus(nativeAsset.minTransactionBuffer).toString()
    : props.amount === tokenBalance

  const token: TokenInfo | undefined = !hasToken ? undefined : getToken(_get(props, 'address', ''))

  const tokenValue = props.tokenValue ?? toFiat(amount, _get(props, 'address', ''))

  const inputRules = getInputRules(hasToken, isWalletReady, props, tokenBalance)

  const decimalLimit = token?.decimals || 18

  function handleAmountChange(val: string) {
    const regex = /^-?\d*[.,]?\d*$/
    const value = val.split(',').join('')

    if (regex.test(value)) {
      const amountFinal = numeral(value).value()
      const safeAmount = overflowProtected(amountFinal || 0, decimalLimit)
      setAmount(safeAmount)
      props.updateAmount(safeAmount)

      if (val.length >= 2 && val.charAt(0) === '0' && val.charAt(1) === '0') {
        return setDisplayValue('0')
      }

      if (value.indexOf('.') > -1) {
        const decimal = value.substring(value.indexOf('.') + 1, value.indexOf('.') + decimalLimit + 1)
        const int = value.substring(0, value.indexOf('.'))
        const data = displayNumeralNoDecimal(int) + '.' + decimal
        return setDisplayValue(data)
      }

      setDisplayValue(value ? numeral(value).format('0,0') : '')
    }
  }

  const setMax = () => {
    if (props.disableMax) return
    const maxAmount = props.customBalance
      ? props.customBalance
      : getMaxBalanceFor(_get(props, 'address', ''), props.disableNativeAssetBuffer)
    handleAmountChange(maxAmount)
  }

  useEffect(() => {
    setAddress(props.address)
    setAmount(props.amount)
  }, [props.address, props.amount])

  const handleUpdateIsValid = (isValid: boolean) => {
    console.log('Is valid?', isValid)
  }

  const { errors, isInvalid, validate } = useInputValidation({
    rules: inputRules,
    validateOn: 'input',
    modelValue: amount,
    onUpdateIsValid: handleUpdateIsValid,
  })

  useEffect(() => {
    validate(amount)
  }, [address])

  return (
    <Container>
      <Flex justifyContent="space-between" alignItems="center">
        <div>
          <StyledInput
            disabled={disabled}
            inputMode="decimal"
            autoComplete="off"
            autoCorrect="off"
            type="text"
            spellCheck="false"
            placeholder="0.00"
            value={displayValue}
            name={name}
            autoFocus={autoFocus}
            onChange={(e) => handleAmountChange(e.target.value)}
          />
        </div>

        <Flex alignItems="center" style={{ gap: 8 }}>
          <TokenSelectInput
            modelValue={address as string}
            excludedTokens={excludedTokens}
            updateAddress={(value) => updateAddress(value)}
          />
        </Flex>
      </Flex>

      <div>
        <Flex justifyContent="space-between" alignItems="center">
          {hasAmount && hasToken && !hideFiatValue ? (
            <StyledNumber>{fNum(tokenValue, FNumFormats.fiat)}</StyledNumber>
          ) : (
            <div />
          )}

          <Flex alignItems="center" style={{ gap: 8 }}>
            {hasBalance && !noMax && !disableMax ? <MaxButton onClick={setMax}>Max</MaxButton> : null}
            <StyledNumber>{fNum(tokenBalance, FNumFormats.token)}</StyledNumber>
            <WalletIcon />
          </Flex>
        </Flex>
        {isInvalid && !!errors[0] ? (
          <Box
            sx={{
              fontSize: '12px',
              color: '#f56565',
              mt: 2,
            }}
          >
            {errors[0]}
          </Box>
        ) : null}
      </div>
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
  max-width: 170px;
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
